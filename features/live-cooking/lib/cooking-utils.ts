import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type {
  CookingDifficulty,
  KitchenType,
  MeasurementUnit,
  TemperatureUnit,
} from "@/features/live-cooking/types/cooking";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

export function formatTemperature(
  value: number,
  unit: TemperatureUnit,
): string {
  if (unit === "fahrenheit") {
    return `${value}°F`;
  }
  return `${value}°C`;
}

export function convertTemperature(
  value: number,
  from: TemperatureUnit,
  to: TemperatureUnit,
): number {
  if (from === to) return value;
  if (from === "celsius" && to === "fahrenheit") {
    return Math.round((value * 9) / 5 + 32);
  }
  return Math.round(((value - 32) * 5) / 9);
}

export function formatMeasurement(
  value: number,
  unit: MeasurementUnit,
): string {
  const unitLabels: Record<MeasurementUnit, string> = {
    grams: "g",
    kilograms: "kg",
    milligrams: "mg",
    ounces: "oz",
    pounds: "lb",
    cups: "cup",
    tablespoons: "tbsp",
    teaspoons: "tsp",
    milliliters: "ml",
    liters: "L",
    pieces: "pcs",
    whole: "whole",
  };
  return `${value} ${unitLabels[unit]}`;
}

export function getDifficultyColor(difficulty: CookingDifficulty): string {
  const colors: Record<CookingDifficulty, string> = {
    beginner: "text-green-500",
    intermediate: "text-yellow-500",
    advanced: "text-orange-500",
    professional: "text-red-500",
  };
  return colors[difficulty];
}

export function getDifficultyBgColor(difficulty: CookingDifficulty): string {
  const colors: Record<CookingDifficulty, string> = {
    beginner: "bg-green-500/10",
    intermediate: "bg-yellow-500/10",
    advanced: "bg-orange-500/10",
    professional: "bg-red-500/10",
  };
  return colors[difficulty];
}

export function getKitchenTypeIcon(type: KitchenType): string {
  return type === "residential" ? "🏠" : "🏭";
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function pluralize(
  count: number,
  singular: string,
  plural?: string,
): string {
  return count === 1 ? singular : plural || `${singular}s`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

export function calculateTotalTime(prepTime: number, cookTime: number): number {
  return prepTime + cookTime;
}

export function estimateRemainingTime(
  currentStepIndex: number,
  totalSteps: number,
  elapsedTime: number,
): number {
  if (currentStepIndex === 0) return 0;
  const averageTimePerStep = elapsedTime / currentStepIndex;
  const remainingSteps = totalSteps - currentStepIndex;
  return Math.round(averageTimePerStep * remainingSteps);
}
