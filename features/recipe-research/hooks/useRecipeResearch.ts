"use client";

import { trpc } from "@/lib/trpc/client";
import type { RecipeResearchResult } from "@/lib/trpc/routers/recipe-research";

type FindRecipesInput = {
  fridgeInventory: {
    items: Array<{
      name: string;
      quantity: number;
      unit: string;
      confidence: number;
      location: "shelf" | "door" | "drawer" | "freezer";
      category?: string;
    }>;
  };
  userRequest: string;
  extraIngredients?: string[];
  excludedIngredients?: string[];
  dietaryNotes?: string;
  servings?: number;
  maxPrepMinutes?: number;
  maxMissingIngredients?: number;
};

export function useRecipeResearch(): {
  findRecipes: (input: FindRecipesInput) => Promise<RecipeResearchResult>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
} {
  const mutation = trpc.recipeResearch.findRecipes.useMutation();

  return {
    findRecipes: (input) => mutation.mutateAsync(input),
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
    reset: mutation.reset,
  };
}
