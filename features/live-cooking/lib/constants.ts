export const defaultCookingDifficulty = "intermediate" as const;

export const defaultKitchenType = "residential" as const;

export const defaultAccountType = "personal" as const;

export const difficultyColors = {
  beginner: "bg-green-500",
  intermediate: "bg-yellow-500",
  advanced: "bg-orange-500",
  professional: "bg-red-500",
} as const;

export const difficultyLabels = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  professional: "Professional",
} as const;

export const cookingCategories = [
  "appetizer",
  "main",
  "side",
  "dessert",
  "salad",
  "soup",
  "breakfast",
  "snack",
  "beverage",
  "sauce",
  "marinade",
] as const;

export const cuisineTypes = [
  "american",
  "italian",
  "mexican",
  "chinese",
  "japanese",
  "indian",
  "thai",
  "french",
  "mediterranean",
  "korean",
  "vietnamese",
  "greek",
  "spanish",
  "middle_eastern",
  "caribbean",
] as const;

export const commonEquipment = [
  "oven",
  "stovetop",
  "microwave",
  "grill",
  "air_fryer",
  "slow_cooker",
  "instant_pot",
  "blender",
  "food_processor",
  "stand_mixer",
  "toaster",
  "toaster_oven",
  "steam cooker",
  "rice_cooker",
  " sous_vide",
  "cast_iron_skillet",
  "wok",
  "double_boiler",
  "dutch_oven",
] as const;

export const commonCookingGoals = [
  "save_time",
  "eat_healthier",
  "meal_prep",
  "learn_skills",
  "impress_guests",
  "special_diet",
  "budget_cooking",
  "family_meals",
] as const;

export const dietaryOptions = [
  { value: "none", labelKey: "None" },
  { value: "vegetarian", labelKey: "Vegetarian" },
  { value: "vegan", labelKey: "Vegan" },
  { value: "pescatarian", labelKey: "Pescatarian" },
  { value: "gluten_free", labelKey: "Gluten Free" },
  { value: "dairy_free", labelKey: "Dairy Free" },
  { value: "nut_free", labelKey: "Nut Free" },
  { value: "halal", labelKey: "Halal" },
  { value: "kosher", labelKey: "Kosher" },
] as const;

export const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const;

export const temperatureUnits = ["celsius", "fahrenheit"] as const;

export const measurementUnits = [
  { value: "grams", labelKey: "g", shortKey: "g" },
  { value: "kilograms", labelKey: "kg", shortKey: "kg" },
  { value: "milligrams", labelKey: "mg", shortKey: "mg" },
  { value: "ounces", labelKey: "oz", shortKey: "oz" },
  { value: "pounds", labelKey: "lb", shortKey: "lb" },
  { value: "cups", labelKey: "cup", shortKey: "cup" },
  { value: "tablespoons", labelKey: "tbsp", shortKey: "tbsp" },
  { value: "teaspoons", labelKey: "tsp", shortKey: "tsp" },
  { value: "milliliters", labelKey: "ml", shortKey: "ml" },
  { value: "liters", labelKey: "L", shortKey: "L" },
  { value: "pieces", labelKey: "pcs", shortKey: "pcs" },
  { value: "whole", labelKey: "whole", shortKey: "whole" },
] as const;
