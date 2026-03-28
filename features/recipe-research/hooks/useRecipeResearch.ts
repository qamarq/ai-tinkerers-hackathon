"use client";

import { useCallback } from "react";

import { trpc } from "@/lib/trpc/client";
import type {
  RecipeQuickSearchResult,
  RecipeResearchResult,
} from "@/lib/trpc/routers/recipe-research";

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

type SuggestQuickSearchesInput = {
  fridgeIngredients: string[];
};

export function useRecipeResearch(): {
  findRecipes: (input: FindRecipesInput) => Promise<RecipeResearchResult>;
  suggestQuickSearches: (
    input: SuggestQuickSearchesInput,
  ) => Promise<RecipeQuickSearchResult>;
  isSuggestingQuickSearches: boolean;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
} {
  const recipeMutation = trpc.recipeResearch.findRecipes.useMutation();
  const quickSearchMutation =
    trpc.recipeResearch.suggestQuickSearches.useMutation();

  const findRecipes = useCallback(
    (input: FindRecipesInput) => recipeMutation.mutateAsync(input),
    [recipeMutation],
  );

  const suggestQuickSearches = useCallback(
    (input: SuggestQuickSearchesInput) =>
      quickSearchMutation.mutateAsync(input),
    [quickSearchMutation],
  );

  const reset = useCallback(() => {
    recipeMutation.reset();
  }, [recipeMutation]);

  return {
    findRecipes,
    suggestQuickSearches,
    isSuggestingQuickSearches: quickSearchMutation.isPending,
    isLoading: recipeMutation.isPending,
    error: recipeMutation.error?.message ?? null,
    reset,
  };
}
