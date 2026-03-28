import { z } from "zod";

export const cookingDifficultySchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "professional",
]);
export type CookingDifficulty = z.infer<typeof cookingDifficultySchema>;

export const kitchenTypeSchema = z.enum(["residential", "commercial"]);
export type KitchenType = z.infer<typeof kitchenTypeSchema>;

export const accountTypeSchema = z.enum(["personal", "professional"]);
export type AccountType = z.infer<typeof accountTypeSchema>;

export const cookingStatusSchema = z.enum([
  "idle",
  "preparing",
  "cooking",
  "paused",
  "completed",
  "cancelled",
]);
export type CookingStatus = z.infer<typeof cookingStatusSchema>;

export const temperatureUnitSchema = z.enum(["celsius", "fahrenheit"]);
export type TemperatureUnit = z.infer<typeof temperatureUnitSchema>;

export const measurementUnitSchema = z.enum([
  "grams",
  "kilograms",
  "milligrams",
  "ounces",
  "pounds",
  "cups",
  "tablespoons",
  "teaspoons",
  "milliliters",
  "liters",
  "pieces",
  "whole",
]);
export type MeasurementUnit = z.infer<typeof measurementUnitSchema>;

export const dietaryPreferenceSchema = z.enum([
  "none",
  "vegetarian",
  "vegan",
  "pescatarian",
  "gluten_free",
  "dairy_free",
  "nut_free",
  "halal",
  "kosher",
]);
export type DietaryPreference = z.infer<typeof dietaryPreferenceSchema>;

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: MeasurementUnit;
  notes?: string;
  isOptional?: boolean;
}

export interface CookingStep {
  id: string;
  order: number;
  title: string;
  description: string;
  duration?: number;
  temperature?: {
    value: number;
    unit: TemperatureUnit;
  };
  ingredients?: Ingredient[];
  equipment?: string[];
  notes?: string;
  imageUrl?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  difficulty: CookingDifficulty;
  category: string;
  cuisine: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: CookingStep[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface CookingSession {
  id: string;
  recipeId: string;
  recipe: Recipe;
  userId: string;
  status: CookingStatus;
  currentStepIndex: number;
  startedAt?: Date;
  pausedAt?: Date;
  completedAt?: Date;
  totalPausedTime: number;
  notes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  accountType: AccountType;
  kitchenName?: string;
  kitchenType?: KitchenType;
  equipment: string[];
  cookingGoals: string[];
  experienceLevel: CookingDifficulty;
  dietaryPreferences: DietaryPreference[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CookingStatistics {
  totalMeals: number;
  totalCookingTime: number;
  averageCookingTime: number;
  favoriteRecipes: string[];
  mostUsedEquipment: string[];
  weeklyMeals: number[];
  monthlyMeals: number;
}

export interface MealPlan {
  id: string;
  userId: string;
  date: Date;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  recipeId: string;
  recipe: Recipe;
  notes?: string;
}
