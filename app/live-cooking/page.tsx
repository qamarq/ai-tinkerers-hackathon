"use client";

import {
  CookingDashboard,
  CookingDashboardSkeleton,
} from "@/features/live-cooking/components";
import type {
  CookingSession,
  Recipe,
} from "@/features/live-cooking/types/cooking";

const mockRecipes: Recipe[] = [
  {
    id: "1",
    name: "Spaghetti Carbonara",
    description:
      "Classic Italian pasta dish with eggs, cheese, pancetta, and pepper.",
    servings: 4,
    prepTime: 15,
    cookTime: 20,
    totalTime: 35,
    difficulty: "intermediate",
    category: "main",
    cuisine: "italian",
    tags: ["pasta", "quick", "classic"],
    ingredients: [
      { id: "1", name: "Spaghetti", amount: 400, unit: "grams" },
      { id: "2", name: "Pancetta", amount: 200, unit: "grams" },
      { id: "3", name: "Eggs", amount: 4, unit: "whole" },
      { id: "4", name: "Pecorino Romano", amount: 100, unit: "grams" },
      { id: "5", name: "Black Pepper", amount: 2, unit: "teaspoons" },
    ],
    steps: [
      {
        id: "s1",
        order: 1,
        title: "Boil Water",
        description: "Bring a large pot of salted water to boil for the pasta.",
        duration: 10,
        equipment: ["pot", "stovetop"],
      },
      {
        id: "s2",
        order: 2,
        title: "Cook Pasta",
        description: "Add spaghetti to boiling water and cook until al dente.",
        duration: 8,
        ingredients: [
          { id: "1", name: "Spaghetti", amount: 400, unit: "grams" },
        ],
        equipment: ["pot", "stovetop"],
      },
      {
        id: "s3",
        order: 3,
        title: "Prepare Sauce",
        description:
          "While pasta cooks, whisk eggs with grated Pecorino and black pepper.",
        duration: 5,
        ingredients: [
          { id: "3", name: "Eggs", amount: 4, unit: "whole" },
          { id: "4", name: "Pecorino Romano", amount: 100, unit: "grams" },
        ],
        equipment: ["bowl", "whisk"],
      },
      {
        id: "s4",
        order: 4,
        title: "Cook Pancetta",
        description: "Cut pancetta into small cubes and fry until crispy.",
        duration: 5,
        ingredients: [
          { id: "2", name: "Pancetta", amount: 200, unit: "grams" },
        ],
        equipment: ["pan", "stovetop"],
      },
      {
        id: "s5",
        order: 5,
        title: "Combine",
        description:
          "Drain pasta, add to pancetta pan, remove from heat, add egg mixture and toss quickly.",
        duration: 3,
        notes:
          "Work quickly to avoid scrambled eggs. The residual heat will cook the eggs gently.",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user1",
  },
  {
    id: "2",
    name: "Chicken Stir Fry",
    description: "Quick and healthy Asian-inspired chicken with vegetables.",
    servings: 2,
    prepTime: 10,
    cookTime: 15,
    totalTime: 25,
    difficulty: "beginner",
    category: "main",
    cuisine: "chinese",
    tags: ["quick", "healthy", "asian"],
    ingredients: [
      { id: "1", name: "Chicken Breast", amount: 300, unit: "grams" },
      { id: "2", name: "Bell Peppers", amount: 2, unit: "whole" },
      { id: "3", name: "Soy Sauce", amount: 3, unit: "tablespoons" },
      { id: "4", name: "Ginger", amount: 1, unit: "tablespoons" },
    ],
    steps: [
      {
        id: "s1",
        order: 1,
        title: "Prep Ingredients",
        description: "Cut chicken into strips and slice vegetables.",
        duration: 10,
      },
      {
        id: "s2",
        order: 2,
        title: "Stir Fry Chicken",
        description: "Heat oil in wok and cook chicken until golden.",
        duration: 8,
        temperature: { value: 200, unit: "celsius" },
        equipment: ["wok", "stovetop"],
      },
      {
        id: "s3",
        order: 3,
        title: "Add Vegetables",
        description: "Add vegetables and stir fry for 3-4 minutes.",
        duration: 4,
      },
      {
        id: "s4",
        order: 4,
        title: "Season and Serve",
        description: "Add soy sauce and ginger, toss and serve.",
        duration: 3,
        ingredients: [
          { id: "3", name: "Soy Sauce", amount: 3, unit: "tablespoons" },
          { id: "4", name: "Ginger", amount: 1, unit: "tablespoons" },
        ],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user1",
  },
];

const mockSessions: CookingSession[] = [
  {
    id: "session1",
    recipeId: "1",
    recipe: mockRecipes[0],
    userId: "user1",
    status: "cooking",
    currentStepIndex: 2,
    startedAt: new Date(Date.now() - 15 * 60 * 1000),
    totalPausedTime: 0,
  },
];

export default function LiveCookingPage() {
  const isLoading = false;

  if (isLoading) {
    return <CookingDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <CookingDashboard
        activeSessions={mockSessions}
        recipes={mockRecipes}
        statistics={{
          totalMeals: 12,
          totalCookingTime: 480,
          activeCooks: mockSessions.length,
        }}
      />
    </div>
  );
}
