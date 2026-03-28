import { generateText } from "ai";

import { gemini } from "@/lib/ai";

export async function generateRecipe3dPrompt(recipe: {
  name: string;
  summary: string;
  ingredients: string[];
}): Promise<string> {
  const ingredientList = recipe.ingredients.slice(0, 15).join(", ");

  console.log("[recipe-3d] Generating prompt for:", recipe.name);
  console.log("[recipe-3d] Input to Gemini:", {
    dish: recipe.name,
    summary: recipe.summary,
    ingredients: ingredientList,
  });

  const { text } = await generateText({
    model: gemini,
    system:
      "You create concise visual descriptions of finished dishes for a text-to-3D model generator. " +
      "Describe the dish as it would appear plated and ready to serve: colors, shapes, textures, arrangement on a plate. " +
      "1-3 sentences max. Do not mention cooking instructions or processes. " +
      "Focus on what makes the dish visually distinctive.",
    prompt: `Dish: ${recipe.name}\nSummary: ${recipe.summary}\nKey ingredients: ${ingredientList}`,
  });

  console.log("[recipe-3d] Generated 3D prompt:", text);
  return text;
}
