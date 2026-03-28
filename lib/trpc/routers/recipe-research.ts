import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  runRecipeQuickSearchAgent,
  runRecipeResearchAgent,
} from "@/features/recipe-research/server/recipeResearchAgent";

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
});

const quickSearchInputSchema = z.object({
  fridgeIngredients: z.array(z.string().min(1)).min(1).max(50),
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

export type RecipeResearchResult = z.infer<typeof recipeResearchOutputSchema>;
export type RecipeQuickSearchResult = z.infer<typeof quickSearchOutputSchema>;

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
});
