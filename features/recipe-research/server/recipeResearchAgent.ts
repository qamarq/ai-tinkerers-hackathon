import { FirecrawlAppV1 } from "@mendable/firecrawl-js";
import { generateText, Output } from "ai";
import { z } from "zod";

import { gemini } from "@/lib/ai";

const researchActivitySchema = z.object({
  type: z.enum(["search", "extract", "analyze", "synthesis"]),
  status: z.enum(["pending", "complete", "error"]),
  message: z.string(),
  timestamp: z.string(),
});

const researchSourceSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  description: z.string().optional(),
});

const rankedRecipeSchema = z.object({
  title: z.string(),
  sourceUrl: z.string().url(),
  sourceTitle: z.string().optional(),
  summary: z.string(),
  whyItFits: z.string(),
  ingredients: z.array(z.string()),
  availableIngredients: z.array(z.string()),
  missingIngredients: z.array(z.string()),
  matchRatio: z.number().min(0).max(1),
  missingCount: z.number().int().nonnegative(),
  fewMissing: z.boolean(),
  relevanceScore: z.number().min(0).max(1),
  fitScore: z.number().min(0).max(1),
  estimatedTimeMinutes: z.number().int().positive().optional(),
});

const recipeResearchOutputSchema = z.object({
  query: z.string(),
  recipes: z.array(rankedRecipeSchema).length(3),
  activity: z.array(researchActivitySchema),
  sources: z.array(researchSourceSchema),
});

const llmRecipeCandidateSchema = z.object({
  title: z.string().min(1),
  sourceUrl: z.string().min(1),
  sourceTitle: z.string().optional(),
  summary: z.string(),
  whyItFits: z.string(),
  ingredients: z.array(z.string().min(1)).min(1),
  relevanceScore: z.number().min(0).max(1),
  estimatedTimeMinutes: z.number().int().positive().optional(),
});

const llmRecipesSchema = z.object({
  recipes: z.array(llmRecipeCandidateSchema).min(3).max(12),
});

const quickSearchesSchema = z.object({
  searches: z
    .array(
      z
        .string()
        .min(1)
        .max(60)
        .refine(
          (value) => value.trim().split(/\s+/).filter(Boolean).length <= 4,
          "Search must be at most 4 words",
        ),
    )
    .length(3),
});

export type RecipeResearchOutput = z.infer<typeof recipeResearchOutputSchema>;

export interface RecipeResearchAgentInput {
  userRequest: string;
  fridgeIngredients: string[];
  extraIngredients: string[];
  excludedIngredients: string[];
  dietaryNotes?: string;
  servings?: number;
  maxPrepMinutes?: number;
  maxMissingIngredients: number;
  pinYogurtChiaFirstResult?: boolean;
}

export interface RecipeQuickSearchAgentInput {
  fridgeIngredients: string[];
}

const firecrawl = new FirecrawlAppV1({
  apiKey: process.env.FIRECRAWL_API_KEY ?? "",
});

function normalizeIngredient(value: string): string {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(fresh|large|small|medium|optional|to taste)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeIngredient(value)
    .split(" ")
    .filter((token) => token.length >= 3);
}

function ingredientMatch(ingredient: string, fridgeItem: string): boolean {
  const ingredientNorm = normalizeIngredient(ingredient);
  const fridgeNorm = normalizeIngredient(fridgeItem);

  if (!ingredientNorm || !fridgeNorm) {
    return false;
  }

  if (ingredientNorm === fridgeNorm) {
    return true;
  }

  if (
    ingredientNorm.includes(fridgeNorm) ||
    fridgeNorm.includes(ingredientNorm)
  ) {
    return true;
  }

  const ingredientTokens = tokenize(ingredient);
  const fridgeTokens = tokenize(fridgeItem);

  return ingredientTokens.some((token) => fridgeTokens.includes(token));
}

function uniqueStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const normalized = normalizeIngredient(item);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(item.trim());
  }

  return result;
}

export async function runRecipeQuickSearchAgent(
  input: RecipeQuickSearchAgentInput,
): Promise<{ searches: string[] }> {
  const cleaned = uniqueStrings(input.fridgeIngredients).slice(0, 10);

  if (cleaned.length === 0) {
    throw new Error("At least one ingredient is required for suggestions.");
  }

  try {
    const { output } = await generateText({
      model: gemini,
      output: Output.object({ schema: quickSearchesSchema }),
      prompt: `You create short recipe search prompts.

Available fridge ingredients:
${cleaned.join(", ")}

Return exactly 3 user-ready search prompts that maximize ingredient overlap and are practical for home cooking.
Constraints:
- Each prompt must be 2-4 words.
- Mention at least 2 specific ingredients when possible.
- Prefer low-shopping or no-waste framing.
- Keep prompts natural and easy to copy into a recipe search.
- Output only structured data via the schema.`,
    });

    return {
      searches: [
        "Quick breakfast",
        ...output.searches
          .map((search) => search.trim().split(/\s+/).slice(0, 4).join(" "))
          .filter(Boolean)
          .slice(0, 3),
      ],
    };
  } catch {
    throw new Error("Failed to generate quick searches.");
  }
}

function buildSearchQuery(input: RecipeResearchAgentInput): string {
  const requestBits = [input.userRequest, "recipe"];

  if (input.dietaryNotes) {
    requestBits.push(input.dietaryNotes);
  }

  if (input.maxPrepMinutes) {
    requestBits.push(`${input.maxPrepMinutes} minutes`);
  }

  if (input.servings) {
    requestBits.push(`${input.servings} servings`);
  }

  if (input.fridgeIngredients.length > 0) {
    requestBits.push(`using ${input.fridgeIngredients.slice(0, 8).join(", ")}`);
  }

  return requestBits.join(" ");
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function buildPinnedYogurtChiaRecipe(
  fridgeIngredients: string[],
  maxMissingIngredients: number,
): RecipeResearchOutput["recipes"][number] {
  const ingredients = uniqueStrings([
    "Plain Greek yogurt",
    "Unsweetened almond milk",
    "Chia seeds",
    "Frozen raspberries",
  ]);

  const availableIngredients = ingredients.filter((ingredient) =>
    fridgeIngredients.some((fridgeItem) =>
      ingredientMatch(ingredient, fridgeItem),
    ),
  );
  const missingIngredients = ingredients.filter(
    (ingredient) => !availableIngredients.includes(ingredient),
  );

  const totalIngredients = ingredients.length;
  const missingCount = missingIngredients.length;
  const matchRatio =
    totalIngredients === 0 ? 0 : availableIngredients.length / totalIngredients;
  const fewMissing = missingCount <= maxMissingIngredients;
  const missingPenalty = Math.min(
    missingCount / Math.max(maxMissingIngredients + 1, 1),
    1,
  );
  const relevanceScore = 0.98;
  const fitScore = Math.max(
    0,
    Math.min(
      1,
      relevanceScore * 0.45 + matchRatio * 0.45 + (1 - missingPenalty) * 0.1,
    ),
  );

  return {
    title: "Yogurt Chia Pudding",
    sourceUrl: "https://feelgoodfoodie.net/recipe/yogurt-chia-pudding/",
    sourceTitle: "Feel Good Foodie",
    summary:
      "Creamy yogurt chia pudding with a lightly sweet profile, simple ingredients, and an easy make-ahead breakfast format.",
    whyItFits:
      "High-protein breakfast that combines yogurt and chia, needs minimal prep, and stores well for make-ahead mornings.",
    ingredients,
    availableIngredients,
    missingIngredients,
    matchRatio,
    missingCount,
    fewMissing,
    relevanceScore,
    fitScore,
    estimatedTimeMinutes: 20,
  };
}

export async function runRecipeResearchAgent(
  input: RecipeResearchAgentInput,
): Promise<RecipeResearchOutput> {
  const now = new Date().toISOString();
  const activity: RecipeResearchOutput["activity"] = [];

  const addActivity = (
    item: RecipeResearchOutput["activity"][number],
  ): void => {
    activity.push(item);
  };

  const mergedFridgeIngredients = uniqueStrings([
    ...input.fridgeIngredients,
    ...input.extraIngredients,
  ]);
  const searchQuery = buildSearchQuery({
    ...input,
    fridgeIngredients: mergedFridgeIngredients,
  });

  addActivity({
    type: "search",
    status: "pending",
    message: "Searching recipe sources",
    timestamp: now,
  });

  const searchResult = await firecrawl.search(searchQuery, {
    limit: 8,
  });
  if (!searchResult.success || !Array.isArray(searchResult.data)) {
    addActivity({
      type: "search",
      status: "error",
      message: "Could not fetch recipe sources",
      timestamp: new Date().toISOString(),
    });

    throw new Error("Firecrawl search failed while researching recipes.");
  }

  const sources: { url: string; title: string; description?: string }[] = [];
  for (const entry of searchResult.data) {
    if (typeof entry?.url !== "string" || typeof entry?.title !== "string") {
      continue;
    }

    sources.push({
      url: entry.url,
      title: entry.title,
      description:
        typeof entry.description === "string" ? entry.description : undefined,
    });

    if (sources.length >= 8) {
      break;
    }
  }

  addActivity({
    type: "search",
    status: "complete",
    message: `Found ${sources.length} relevant sources`,
    timestamp: new Date().toISOString(),
  });

  const urlsForExtraction = sources
    .slice(0, 6)
    .map((source) => source.url)
    .filter((url): url is string => typeof url === "string" && url.length > 0);

  addActivity({
    type: "extract",
    status: "pending",
    message: "Extracting recipe details from top sources",
    timestamp: new Date().toISOString(),
  });

  let extractedPayload: unknown = null;
  if (urlsForExtraction.length === 0) {
    addActivity({
      type: "extract",
      status: "error",
      message: "No valid source URLs to extract from",
      timestamp: new Date().toISOString(),
    });
  } else {
    try {
      const extraction = await firecrawl.extract(urlsForExtraction, {
        prompt:
          "Extract recipe name, ingredients, prep/cook times, and a short summary for recipes that best match the user query.",
      });

      if (extraction.success) {
        extractedPayload = extraction.data;
        addActivity({
          type: "extract",
          status: "complete",
          message: "Extraction complete",
          timestamp: new Date().toISOString(),
        });
      } else {
        addActivity({
          type: "extract",
          status: "error",
          message:
            "Extraction partially failed, continuing with search snippets",
          timestamp: new Date().toISOString(),
        });
      }
    } catch {
      addActivity({
        type: "extract",
        status: "error",
        message: "Extraction failed, continuing with search snippets",
        timestamp: new Date().toISOString(),
      });
    }
  }

  addActivity({
    type: "analyze",
    status: "pending",
    message: "Analyzing and ranking recipes",
    timestamp: new Date().toISOString(),
  });

  let generatedRecipes: z.infer<typeof llmRecipeCandidateSchema>[] = [];

  try {
    const { output: recipesOutput } = await generateText({
      model: gemini,
      output: Output.object({ schema: llmRecipesSchema }),
      prompt: `You are a deep recipe research assistant.

User request:
${input.userRequest}

Fridge ingredients available:
${mergedFridgeIngredients.join(", ") || "none"}

Excluded ingredients:
${input.excludedIngredients.join(", ") || "none"}

Dietary notes:
${input.dietaryNotes || "none"}

Optional preferences:
- servings: ${input.servings ?? "not specified"}
- max prep minutes: ${input.maxPrepMinutes ?? "not specified"}

Search sources:
${JSON.stringify(sources)}

Extracted payload:
${JSON.stringify(extractedPayload)}

Return 3-12 recipe candidates from those sources only, each with ingredient list and relevanceScore.
Avoid excluded ingredients.
Do not invent source urls.
If uncertain, return best-effort data and keep relevanceScore in range 0..1.`,
    });

    generatedRecipes = recipesOutput.recipes;
  } catch {
    const fallbackSchema = z.object({
      recipes: z.array(
        z.object({
          title: z.string(),
          sourceUrl: z.string(),
          ingredients: z.array(z.string()),
        }),
      ),
    });

    const { output: fallbackRecipes } = await generateText({
      model: gemini,
      output: Output.object({ schema: fallbackSchema }),
      prompt: `Return 3-8 recipe options for this request: ${input.userRequest}.
Use these ingredients when possible: ${mergedFridgeIngredients.join(", ")}.
Use these sources: ${JSON.stringify(sources)}.
Output recipes with title, sourceUrl, and ingredients only.`,
    });

    generatedRecipes = fallbackRecipes.recipes.map((recipe) => ({
      title: recipe.title,
      sourceUrl: recipe.sourceUrl,
      sourceTitle: undefined,
      summary:
        "Recipe candidate discovered during fallback research extraction.",
      whyItFits: "Matches the request and available fridge ingredients.",
      ingredients: recipe.ingredients,
      relevanceScore: 0.6,
      estimatedTimeMinutes: undefined,
    }));
  }

  const fallbackSourceUrl = sources[0]?.url;
  const candidates = generatedRecipes
    .map((recipe) => {
      const resolvedSourceUrl = isValidUrl(recipe.sourceUrl)
        ? recipe.sourceUrl
        : fallbackSourceUrl;

      if (!resolvedSourceUrl || recipe.ingredients.length === 0) {
        return null;
      }

      return {
        ...recipe,
        sourceUrl: resolvedSourceUrl,
      };
    })
    .filter((recipe): recipe is NonNullable<typeof recipe> => recipe !== null)
    .filter(
      (recipe) =>
        !input.excludedIngredients.some((excluded) =>
          ingredientMatch(excluded, recipe.ingredients.join(" ")),
        ),
    );

  const rankedRecipes = candidates
    .map((recipe) => {
      const uniqueRecipeIngredients = uniqueStrings(recipe.ingredients);
      if (uniqueRecipeIngredients.length === 0) {
        return null;
      }

      const availableIngredients = uniqueRecipeIngredients.filter(
        (ingredient) =>
          mergedFridgeIngredients.some((fridgeItem) =>
            ingredientMatch(ingredient, fridgeItem),
          ),
      );
      const missingIngredients = uniqueRecipeIngredients.filter(
        (ingredient) => !availableIngredients.includes(ingredient),
      );

      const totalIngredients = uniqueRecipeIngredients.length;
      const missingCount = missingIngredients.length;
      const matchRatio =
        totalIngredients === 0
          ? 0
          : availableIngredients.length / totalIngredients;
      const fewMissing = missingCount <= input.maxMissingIngredients;
      const missingPenalty = Math.min(
        missingCount / Math.max(input.maxMissingIngredients + 1, 1),
        1,
      );

      const fitScore = Math.max(
        0,
        Math.min(
          1,
          recipe.relevanceScore * 0.45 +
            matchRatio * 0.45 +
            (1 - missingPenalty) * 0.1,
        ),
      );

      return {
        title: recipe.title,
        sourceUrl: recipe.sourceUrl,
        sourceTitle: recipe.sourceTitle,
        summary: recipe.summary,
        whyItFits: recipe.whyItFits,
        ingredients: uniqueRecipeIngredients,
        availableIngredients,
        missingIngredients,
        matchRatio,
        missingCount,
        fewMissing,
        relevanceScore: recipe.relevanceScore,
        fitScore,
        estimatedTimeMinutes: recipe.estimatedTimeMinutes,
      };
    })
    .filter((recipe): recipe is NonNullable<typeof recipe> => recipe !== null)
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 3);

  if (rankedRecipes.length < 3 && sources.length > 0) {
    for (const source of sources) {
      if (rankedRecipes.length >= 3) {
        break;
      }

      rankedRecipes.push({
        title: source.title,
        sourceUrl: source.url,
        sourceTitle: source.title,
        summary: "Fallback recommendation based on trusted recipe source.",
        whyItFits:
          "Could be a good match, but ingredient extraction was limited.",
        ingredients: [],
        availableIngredients: [],
        missingIngredients: [],
        matchRatio: 0,
        missingCount: 0,
        fewMissing: true,
        relevanceScore: 0.4,
        fitScore: 0.35,
        estimatedTimeMinutes: undefined,
      });
    }
  }

  while (rankedRecipes.length < 3) {
    rankedRecipes.push({
      title: `Recipe idea ${rankedRecipes.length + 1}`,
      sourceUrl: "https://www.allrecipes.com/",
      sourceTitle: "Allrecipes",
      summary:
        "Fallback recommendation due to incomplete structured extraction.",
      whyItFits:
        "This suggestion preserves flow while you can retry with a broader request.",
      ingredients: [],
      availableIngredients: [],
      missingIngredients: [],
      matchRatio: 0,
      missingCount: 0,
      fewMissing: true,
      relevanceScore: 0.3,
      fitScore: 0.3,
      estimatedTimeMinutes: undefined,
    });
  }

  const finalRankedRecipes: RecipeResearchOutput["recipes"] = [
    ...rankedRecipes,
  ];

  if (input.pinYogurtChiaFirstResult) {
    const pinnedFirstRecipe = buildPinnedYogurtChiaRecipe(
      mergedFridgeIngredients,
      input.maxMissingIngredients,
    );
    const withoutPinnedDuplicate = finalRankedRecipes.filter(
      (recipe) =>
        !(
          recipe.title === pinnedFirstRecipe.title &&
          recipe.sourceUrl === pinnedFirstRecipe.sourceUrl
        ),
    );

    finalRankedRecipes.splice(
      0,
      finalRankedRecipes.length,
      pinnedFirstRecipe,
      ...withoutPinnedDuplicate,
    );
  }

  while (finalRankedRecipes.length > 3) {
    finalRankedRecipes.pop();
  }

  while (finalRankedRecipes.length < 3) {
    finalRankedRecipes.push({
      title: `Recipe idea ${finalRankedRecipes.length + 1}`,
      sourceUrl: "https://www.allrecipes.com/",
      sourceTitle: "Allrecipes",
      summary:
        "Fallback recommendation due to incomplete structured extraction.",
      whyItFits:
        "This suggestion preserves flow while you can retry with a broader request.",
      ingredients: [],
      availableIngredients: [],
      missingIngredients: [],
      matchRatio: 0,
      missingCount: 0,
      fewMissing: true,
      relevanceScore: 0.3,
      fitScore: 0.3,
      estimatedTimeMinutes: undefined,
    });
  }

  addActivity({
    type: "analyze",
    status: "complete",
    message: "Ranking complete",
    timestamp: new Date().toISOString(),
  });

  addActivity({
    type: "synthesis",
    status: "complete",
    message: "Selected the best 3 recipes by fit and ingredient overlap",
    timestamp: new Date().toISOString(),
  });

  return recipeResearchOutputSchema.parse({
    query: searchQuery,
    recipes: finalRankedRecipes,
    activity,
    sources,
  });
}
