import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character",
  );

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format");

export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters");

export const recipeNameSchema = z
  .string()
  .min(1, "Recipe name is required")
  .max(200, "Recipe name must be less than 200 characters");

export const urlSchema = z
  .string()
  .url("Invalid URL")
  .optional()
  .or(z.literal(""));

export const positiveNumberSchema = z
  .number()
  .positive("Must be a positive number");

export const servingsSchema = z.number().int().min(1).max(100);

export const durationSchema = z.number().int().min(0).max(86400);

export const temperatureSchema = z.number().min(-50).max(500);

export function validateEmail(email: string): boolean {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

export function validatePassword(password: string): boolean {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
}

export function getPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push("Use at least 8 characters");

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("Add an uppercase letter");

  if (/[a-z]/.test(password)) score++;
  else feedback.push("Add a lowercase letter");

  if (/[0-9]/.test(password)) score++;
  else feedback.push("Add a number");

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push("Add a special character");

  return { score, feedback };
}
