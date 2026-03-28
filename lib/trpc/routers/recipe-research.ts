import { TRPCError } from "@trpc/server";
import { generateText } from "ai";
import { z } from "zod";

import {
  runRecipeQuickSearchAgent,
  runRecipeResearchAgent,
} from "@/features/recipe-research/server/recipeResearchAgent";
import { gemini } from "@/lib/ai";

import { createTRPCRouter, publicProcedure } from "../server";

const fridgeItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  confidence: z.number().min(0).max(1),
  location: z.enum(["shelf", "door", "drawer", "freezer"]),
  category: z.string().optional(),
});

const recipeResearchInputSchema = z.object({
  fridgeInventory: z.object({
    items: z.array(fridgeItemSchema),
  }),
  userRequest: z.string().min(3).max(400),
  extraIngredients: z.array(z.string().min(1)).default([]),
  excludedIngredients: z.array(z.string().min(1)).default([]),
  dietaryNotes: z.string().max(300).optional(),
  servings: z.number().int().min(1).max(16).optional(),
  maxPrepMinutes: z.number().int().min(5).max(300).optional(),
  maxMissingIngredients: z.number().int().min(0).max(20).default(3),
  pinYogurtChiaFirstResult: z.boolean().optional(),
});

const quickSearchInputSchema = z.object({
  fridgeIngredients: z.array(z.string().min(1)).min(1).max(50),
  pinYogurtChiaFirstResult: z.boolean().optional(),
});

const recipeRecommendationSchema = z.object({
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
  recipes: z.array(recipeRecommendationSchema).length(3),
  activity: z.array(
    z.object({
      type: z.enum(["search", "extract", "analyze", "synthesis"]),
      status: z.enum(["pending", "complete", "error"]),
      message: z.string(),
      timestamp: z.string(),
    }),
  ),
  sources: z.array(
    z.object({
      url: z.string().url(),
      title: z.string(),
      description: z.string().optional(),
    }),
  ),
  meta: z.object({
    analyzedAt: z.string(),
    fridgeIngredientCount: z.number().int().nonnegative(),
    userRequest: z.string(),
  }),
});

const quickSearchOutputSchema = z.object({
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
    .length(4),
});

const transformRecipeInputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  ingredients: z.array(z.string()),
  estimatedTimeMinutes: z.number().int().positive().optional(),
  sourceUrl: z.string().url(),
});

const transformRecipeOutputSchema = z.object({
  title: z.string(),
  ingredients: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      amount: z.string(),
      checked: z.boolean(),
    }),
  ),
  steps: z.array(
    z.object({
      id: z.number(),
      text: z.string(),
      checked: z.boolean(),
      ingredientIds: z.array(z.string()).optional(),
    }),
  ),
  estimatedTimeMinutes: z.number().int().positive().optional(),
  sourceUrl: z.string().url(),
});

function splitIngredientAndAmount(input: string): {
  name: string;
  amount: string;
} {
  const value = input.trim();
  const match = value.match(/^(.*?)\s*\(([^)]+)\)\s*$/);

  if (!match) {
    return { name: value, amount: "amount" };
  }

  const name = match[1]?.trim() || value;
  const amount = match[2]?.trim() || "amount";

  return { name, amount };
}

function isPinnedYogurtChiaRecipe(input: {
  sourceUrl: string;
  title: string;
}): boolean {
  return (
    input.sourceUrl ===
      "https://feelgoodfoodie.net/recipe/yogurt-chia-pudding/" ||
    input.title.toLowerCase().includes("yogurt chia pudding")
  );
}

export type RecipeResearchResult = z.infer<typeof recipeResearchOutputSchema>;
export type RecipeQuickSearchResult = z.infer<typeof quickSearchOutputSchema>;
export type TransformedRecipe = z.infer<typeof transformRecipeOutputSchema>;

export const recipeResearchRouter = createTRPCRouter({
  suggestQuickSearches: publicProcedure
    .input(quickSearchInputSchema)
    .output(quickSearchOutputSchema)
    .mutation(async ({ input }) => {
      if (!process.env.GEMINI_API_KEY) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "GEMINI_API_KEY is missing on the server.",
        });
      }

      return runRecipeQuickSearchAgent({
        fridgeIngredients: input.fridgeIngredients,
        pinYogurtChiaFirstResult: input.pinYogurtChiaFirstResult,
      });
    }),
  findRecipes: publicProcedure
    .input(recipeResearchInputSchema)
    .output(recipeResearchOutputSchema)
    .mutation(async ({ input }) => {
      if (!process.env.GEMINI_API_KEY) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "GEMINI_API_KEY is missing on the server.",
        });
      }

      if (!process.env.FIRECRAWL_API_KEY) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "FIRECRAWL_API_KEY is missing on the server.",
        });
      }

      const result = await runRecipeResearchAgent({
        userRequest: input.userRequest,
        fridgeIngredients: input.fridgeInventory.items.map((item) => item.name),
        extraIngredients: input.extraIngredients,
        excludedIngredients: input.excludedIngredients,
        dietaryNotes: input.dietaryNotes,
        servings: input.servings,
        maxPrepMinutes: input.maxPrepMinutes,
        maxMissingIngredients: input.maxMissingIngredients,
        pinYogurtChiaFirstResult: input.pinYogurtChiaFirstResult,
      });

      return {
        ...result,
        meta: {
          analyzedAt: new Date().toISOString(),
          fridgeIngredientCount: input.fridgeInventory.items.length,
          userRequest: input.userRequest,
        },
      };
    }),
  transformRecipe: publicProcedure
    .input(transformRecipeInputSchema)
    .output(transformRecipeOutputSchema)
    .mutation(async ({ input }) => {
      if (!process.env.GEMINI_API_KEY) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "GEMINI_API_KEY is missing on the server.",
        });
      }

      // Transform ingredients with IDs
      const ingredients = input.ingredients.map((ing, index) => {
        const { name, amount } = splitIngredientAndAmount(ing);

        return {
          id: (index + 1).toString(),
          name,
          amount,
          checked: false,
        };
      });

      if (isPinnedYogurtChiaRecipe(input)) {
        const getAmount = (nameIncludes: string): string => {
          const ingredient = ingredients.find((ing) =>
            ing.name.toLowerCase().includes(nameIncludes.toLowerCase()),
          );
          return ingredient?.amount ?? "amount";
        };

        const yogurtAmount = getAmount("yogurt");
        const milkAmount = getAmount("milk");
        const chiaAmount = getAmount("chia");
        const raspberriesAmount = getAmount("rasp");

        const yogurtId = ingredients.find((ing) =>
          ing.name.toLowerCase().includes("yogurt"),
        )?.id;
        const milkId = ingredients.find((ing) =>
          ing.name.toLowerCase().includes("milk"),
        )?.id;
        const chiaId = ingredients.find((ing) =>
          ing.name.toLowerCase().includes("chia"),
        )?.id;
        const raspberriesId = ingredients.find((ing) =>
          ing.name.toLowerCase().includes("rasp"),
        )?.id;

        const steps = [
          {
            id: 1,
            text: `Add ${yogurtAmount} Greek yogurt to a jar.`,
            checked: false,
            ingredientIds: [yogurtId].filter((id): id is string => Boolean(id)),
          },
          {
            id: 2,
            text: `Pour in ${milkAmount} milk and whisk until smooth.`,
            checked: false,
            ingredientIds: [milkId].filter((id): id is string => Boolean(id)),
          },
          {
            id: 3,
            text: `Stir in ${chiaAmount} chia seeds and mix well so the seeds are evenly distributed.`,
            checked: false,
            ingredientIds: [chiaId].filter((id): id is string => Boolean(id)),
          },
          {
            id: 4,
            text: "Rest for 10 minutes, stir once more, then cover and refrigerate until thickened.",
            checked: false,
            ingredientIds: [chiaId].filter((id): id is string => Boolean(id)),
          },
          {
            id: 5,
            text: `Top with ${raspberriesAmount} raspberries before serving.`,
            checked: false,
            ingredientIds: [raspberriesId].filter((id): id is string =>
              Boolean(id),
            ),
          },
        ];

        return {
          title: input.title,
          ingredients,
          steps,
          estimatedTimeMinutes: input.estimatedTimeMinutes,
          sourceUrl: input.sourceUrl,
        };
      }

      // Create ingredient mapping for AI
      const ingredientList = ingredients
        .map((ing) => `ID ${ing.id}: ${ing.name}`)
        .join("\n");

      // Generate cooking steps using AI
      const prompt = `You are a professional chef. Generate detailed cooking steps for this recipe.

Recipe Title: ${input.title}
Summary: ${input.summary}
Estimated Time: ${input.estimatedTimeMinutes || "30-45"} minutes

Ingredients (with IDs):
${ingredientList}

Generate 5-8 clear, actionable cooking steps. For each step:
1. Write clear instructions (1-2 sentences max)
2. Reference ingredient IDs when ingredients are used (e.g., ["1", "2"])
3. Estimate how many minutes this step takes (optional)
4. When mentioning ingredient amounts, ALWAYS use GRAMS (g) - e.g., "200g flour", "50g butter"
5. For liquids, remember that 1ml ≈ 1g (e.g., "100ml milk" = "100g milk")

Important:
- Steps should be in logical cooking order
- Be specific about techniques (chop, dice, sauté, etc.)
- Include temperatures and timings where relevant
- Mention when to use specific ingredients
- Keep instructions concise and clear
- Express all measurements in GRAMS (g)

Return ONLY a JSON object with this exact structure:
{
  "steps": [
    {
      "text": "Step instruction here",
      "ingredientIds": ["1", "2"],
      "estimatedMinutes": 5
    }
  ]
}`;

      try {
        const { text } = await generateText({
          model: gemini,
          prompt,
          temperature: 0.3,
        });

        // Parse AI response
        const stepsSchema = z.object({
          steps: z.array(
            z.object({
              text: z.string(),
              ingredientIds: z.array(z.string()).optional(),
              estimatedMinutes: z.number().optional(),
            }),
          ),
        });

        const parsed = stepsSchema.parse(JSON.parse(text));

        // Transform to CookingStep format
        const steps = parsed.steps.map((step, index) => ({
          id: index + 1,
          text: step.text,
          checked: false,
          ingredientIds: step.ingredientIds,
        }));

        return {
          title: input.title,
          ingredients,
          steps,
          estimatedTimeMinutes: input.estimatedTimeMinutes,
          sourceUrl: input.sourceUrl,
        };
      } catch (error) {
        console.error("Failed to generate cooking steps:", error);

        // Fallback: basic steps
        const steps = [
          {
            id: 1,
            text: "Prepare all ingredients and equipment",
            checked: false,
            ingredientIds: ingredients.map((i) => i.id),
          },
          {
            id: 2,
            text: "Follow the cooking instructions from the recipe source",
            checked: false,
          },
          {
            id: 3,
            text: "Complete the dish and serve",
            checked: false,
          },
        ];

        return {
          title: input.title,
          ingredients,
          steps,
          estimatedTimeMinutes: input.estimatedTimeMinutes,
          sourceUrl: input.sourceUrl,
        };
      }
    }),
});
