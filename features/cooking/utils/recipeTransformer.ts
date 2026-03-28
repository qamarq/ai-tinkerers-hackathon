import type { TransformedRecipe } from "@/lib/trpc/routers/recipe-research";

/**
 * Storage key for passing recipe between pages
 */
export const COOKING_RECIPE_STORAGE_KEY = "cooking:selectedRecipe";

/**
 * Save transformed recipe to localStorage for cooking session
 */
export function saveRecipeForCooking(recipe: TransformedRecipe): void {
  try {
    localStorage.setItem(COOKING_RECIPE_STORAGE_KEY, JSON.stringify(recipe));
  } catch (error) {
    console.error("Failed to save recipe to localStorage:", error);
  }
}

/**
 * Load recipe from localStorage and clear it
 */
export function loadRecipeForCooking(): TransformedRecipe | null {
  try {
    const saved = localStorage.getItem(COOKING_RECIPE_STORAGE_KEY);
    if (!saved) {
      return null;
    }

    const recipe = JSON.parse(saved) as TransformedRecipe;
    // Clear after loading
    localStorage.removeItem(COOKING_RECIPE_STORAGE_KEY);
    return recipe;
  } catch (error) {
    console.error("Failed to load recipe from localStorage:", error);
    return null;
  }
}
