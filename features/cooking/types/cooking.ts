export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  checked: boolean;
}

export interface CookingStep {
  id: number;
  text: string;
  checked: boolean;
  ingredientIds?: string[];
}

export interface TimerState {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  label: string;
}
