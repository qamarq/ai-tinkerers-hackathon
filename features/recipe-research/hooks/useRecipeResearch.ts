"use client";

import { useCallback } from "react";

import { trpc } from "@/lib/trpc/client";
import type {
  RecipeQuickSearchResult,
  RecipeResearchResult,
  TransformedRecipe,
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
  pinYogurtChiaFirstResult?: boolean;
};

type SuggestQuickSearchesInput = {
  fridgeIngredients: string[];
};

type TransformRecipeInput = {
  title: string;
  summary: string;
  ingredients: string[];
  estimatedTimeMinutes?: number;
  sourceUrl: string;
};

function isPinnedFirstRecipeEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const flag = window.localStorage.getItem(
    "recipeResearch:pinYogurtChiaFirstResult",
  );

  if (!flag) {
    return false;
  }

  const normalized = flag.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "on";
}

export function useRecipeResearch(): {
  findRecipes: (input: FindRecipesInput) => Promise<RecipeResearchResult>;
  suggestQuickSearches: (
    input: SuggestQuickSearchesInput,
  ) => Promise<RecipeQuickSearchResult>;
  transformRecipe: (input: TransformRecipeInput) => Promise<TransformedRecipe>;
  isSuggestingQuickSearches: boolean;
  isTransformingRecipe: boolean;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
} {
  const recipeMutation = trpc.recipeResearch.findRecipes.useMutation();
  const quickSearchMutation =
    trpc.recipeResearch.suggestQuickSearches.useMutation();
  const transformMutation = trpc.recipeResearch.transformRecipe.useMutation();

  const findRecipes = useCallback(
    (input: FindRecipesInput) =>
      recipeMutation.mutateAsync({
        ...input,
        pinYogurtChiaFirstResult:
          input.pinYogurtChiaFirstResult ?? isPinnedFirstRecipeEnabled(),
      }),
    [recipeMutation],
  );

  const suggestQuickSearches = useCallback(
    (input: SuggestQuickSearchesInput) =>
      quickSearchMutation.mutateAsync(input),
    [quickSearchMutation],
  );

  const transformRecipe = useCallback(
    (input: TransformRecipeInput) => transformMutation.mutateAsync(input),
    [transformMutation],
  );

  const reset = useCallback(() => {
    recipeMutation.reset();
  }, [recipeMutation]);

  return {
    findRecipes,
    suggestQuickSearches,
    transformRecipe,
    isSuggestingQuickSearches: quickSearchMutation.isPending,
    isTransformingRecipe: transformMutation.isPending,
    isLoading: recipeMutation.isPending,
    error: recipeMutation.error?.message ?? null,
    reset,
  };
}
