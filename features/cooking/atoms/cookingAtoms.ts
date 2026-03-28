import { atom } from "jotai";

import type { CookingStep, Ingredient, TimerState } from "../types/cooking";

export const MOCK_INGREDIENTS: Ingredient[] = [
  { id: "1", name: "Spaghetti", amount: "300g", checked: false },
  { id: "2", name: "Bacon / Pancetta", amount: "150g", checked: false },
  { id: "3", name: "Egg yolks", amount: "3 pcs", checked: false },
  { id: "4", name: "Parmesan (grated)", amount: "80g", checked: false },
  { id: "5", name: "Black pepper", amount: "to taste", checked: false },
  { id: "6", name: "Coarse salt", amount: "to taste", checked: false },
];

export const MOCK_STEPS: CookingStep[] = [
  {
    id: 1,
    text: "Boil a large pot of heavily salted water",
    checked: false,
    ingredientIds: ["6"],
  },
  {
    id: 2,
    text: "Cook spaghetti al dente (8-10 min). Save 2 cups of pasta water!",
    checked: false,
    ingredientIds: ["1"],
  },
  {
    id: 3,
    text: "Fry chopped bacon in a dry pan until golden brown",
    checked: false,
    ingredientIds: ["2"],
  },
  {
    id: 4,
    text: "Mix egg yolks with grated parmesan and lots of black pepper",
    checked: false,
    ingredientIds: ["3", "4", "5"],
  },
  {
    id: 5,
    text: "Drain pasta, save 2 cups of cooking water",
    checked: false,
  },
  {
    id: 6,
    text: "Remove pan from heat, add pasta to bacon and mix",
    checked: false,
  },
  {
    id: 7,
    text: "Add egg-cheese mixture, stir vigorously while adding pasta water",
    checked: false,
  },
  {
    id: 8,
    text: "Serve immediately with extra parmesan and pepper",
    checked: false,
    ingredientIds: ["4", "5"],
  },
];

export const ingredientsAtom = atom<Ingredient[]>(MOCK_INGREDIENTS);
export const stepsAtom = atom<CookingStep[]>(MOCK_STEPS);
export const timerAtom = atom<TimerState>({
  totalSeconds: 0,
  remainingSeconds: 0,
  isRunning: false,
  label: "",
});
