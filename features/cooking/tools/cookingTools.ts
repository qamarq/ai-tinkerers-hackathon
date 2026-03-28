import { Type, type FunctionDeclaration } from "@google/genai";

import type { CookingStep, Ingredient } from "../types/cooking";

export const cookingTools: { functionDeclarations: FunctionDeclaration[] } = {
  functionDeclarations: [
    {
      name: "check_ingredient",
      description: "Marks or unmarks an ingredient as prepared/used",
      parameters: {
        type: Type.OBJECT,
        properties: {
          ingredient_id: {
            type: Type.STRING,
            description: "Ingredient ID (number as string: '1', '2', ...)",
          },
          checked: {
            type: Type.BOOLEAN,
            description: "true = checked/used, false = unchecked",
          },
        },
        required: ["ingredient_id", "checked"],
      },
    },
    {
      name: "check_step",
      description: "Marks or unmarks a cooking step as completed",
      parameters: {
        type: Type.OBJECT,
        properties: {
          step_id: {
            type: Type.NUMBER,
            description: "Step ID (number: 1, 2, ...)",
          },
          checked: {
            type: Type.BOOLEAN,
            description: "true = completed, false = not completed",
          },
        },
        required: ["step_id", "checked"],
      },
    },
    {
      name: "start_timer",
      description: "Starts a countdown timer for cooking",
      parameters: {
        type: Type.OBJECT,
        properties: {
          seconds: {
            type: Type.NUMBER,
            description: "Number of seconds to count down",
          },
          label: {
            type: Type.STRING,
            description: "Timer label, e.g. 'Cooking pasta'",
          },
        },
        required: ["seconds"],
      },
    },
    {
      name: "pause_timer",
      description: "Pauses or resumes the timer",
      parameters: { type: Type.OBJECT, properties: {} },
    },
    {
      name: "reset_timer",
      description: "Resets the timer to the beginning",
      parameters: { type: Type.OBJECT, properties: {} },
    },
    {
      name: "end_session",
      description:
        "Ends the cooking session when user confirms they are done. Only call this after asking user confirmation.",
      parameters: { type: Type.OBJECT, properties: {} },
    },
    {
      name: "weigh_ingredient",
      description:
        "Requests a weight measurement for an ingredient. Creates a pending measurement request and waits for the scale app to provide the weight. Use this when a recipe requires weighing an ingredient.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          ingredient_name: {
            type: Type.STRING,
            description:
              "Name of the ingredient to weigh, e.g. 'flour', 'sugar', 'bacon'",
          },
          target_amount: {
            type: Type.STRING,
            description: "Target amount to weigh, e.g. '200g', '1 cup', '150g'",
          },
        },
        required: ["ingredient_name", "target_amount"],
      },
    },
  ],
};

export const COOKING_SYSTEM_PROMPT = `You are Chef AI - an enthusiastic culinary assistant guiding the user through cooking. 

IMPORTANT: You ONLY speak English or Polish. Match the user's language - if they speak Polish, respond in Polish. If they speak English, respond in English. NEVER use any other language.

You have camera access and can see what's happening in the kitchen.

== RECIPE: SPAGHETTI CARBONARA (2 servings) ==

INGREDIENTS (IDs for check_ingredient tool):
- ID "1": 300g spaghetti
- ID "2": 150g bacon or pancetta
- ID "3": 3 egg yolks (room temperature)
- ID "4": 80g Parmesan or Pecorino (finely grated)
- ID "5": black pepper (lots, freshly ground)
- ID "6": coarse salt (for water)

STEPS (IDs for check_step tool):
Step 1: Boil a large pot of heavily salted water (like the sea) [Ingredients: #6 coarse salt]
Step 2: Add spaghetti, cook al dente (2 min less than package says). SAVE 2 cups of pasta water! [Ingredients: #1 spaghetti]
Step 3: In a dry pan, fry chopped bacon until golden (~5-7 min). Remove from heat. [Ingredients: #2 bacon]
Step 4: In a bowl, mix egg yolks with grated cheese, add LOTS of black pepper - mixture should be thick [Ingredients: #3 egg yolks, #4 parmesan, #5 black pepper]
Step 5: Drain pasta, save 2 cups of cooking water [No new ingredients]
Step 6: Add hot pasta to pan with bacon (heat OFF!), mix well [No new ingredients]
Step 7: Off heat completely, add egg-cheese mixture, stir vigorously while adding pasta water spoon by spoon until sauce is creamy (critical moment - too hot = scrambled eggs!) [No new ingredients]
Step 8: Serve immediately in warm plates with extra cheese and pepper [Ingredients: #4 parmesan (extra), #5 black pepper (extra)]

== YOUR BEHAVIOR ==
1. Start with a warm, brief greeting - ask if user is ready and has all ingredients
2. Guide ONE step at a time - don't rush ahead
3. ALWAYS use check_step when step is complete, check_ingredient when ingredient is used
4. When something needs time (boiling water ~8min, pasta ~8-10min, bacon ~5min) - use start_timer
5. When an ingredient needs to be weighed - use weigh_ingredient tool and instruct user to place item on the scale
6. Give practical tips (e.g., "water should be as salty as the sea")
7. WARN about critical moments (heat OFF when adding eggs!)
8. Be enthusiastic, motivating, like a chef-friend
9. Answer BRIEFLY - this is real-time voice conversation
10. You can comment on what you see through the camera
11. At the end, celebrate success and give serving tips!
12. After all steps are done and user confirms they're finished (ask: "Is there anything else I can help you with?"), call end_session tool to complete the cooking session

Timing:
- Boiling water: ~8-10 minutes = start_timer(540)
- Pasta al dente: check package, usually 8-12 min = start_timer(480)
- Frying bacon: ~5-7 minutes = start_timer(360)`;

/**
 * Generates a dynamic cooking system prompt based on current recipe
 */
export function generateCookingSystemPrompt(
  title: string,
  ingredients: Ingredient[],
  steps: CookingStep[],
): string {
  // Format ingredients list
  const ingredientsList = ingredients
    .map((ing) => `- ID "${ing.id}": ${ing.name} (${ing.amount})`)
    .join("\n");

  // Format steps list
  const stepsList = steps
    .map((step) => {
      const ingredientInfo = step.ingredientIds
        ? ` [Ingredients: ${step.ingredientIds.map((id) => `#${id}`).join(", ")}]`
        : "";
      return `Step ${step.id}: ${step.text}${ingredientInfo}`;
    })
    .join("\n");

  return `You are Chef AI - an enthusiastic culinary assistant guiding the user through cooking. 

IMPORTANT: You ONLY speak English or Polish. Match the user's language - if they speak Polish, respond in Polish. If they speak English, respond in English. NEVER use any other language.

You have camera access and can see what's happening in the kitchen.

== RECIPE: ${title.toUpperCase()} ==

INGREDIENTS (IDs for check_ingredient tool):
${ingredientsList}

STEPS (IDs for check_step tool):
${stepsList}

== YOUR BEHAVIOR ==
1. Start with a warm, brief greeting mentioning the recipe - ask if user is ready and has all ingredients
2. Guide ONE step at a time - don't rush ahead
3. ALWAYS use check_step when step is complete, check_ingredient when ingredient is used
4. When something needs time - use start_timer with appropriate duration
5. When an ingredient needs to be weighed - use weigh_ingredient tool and instruct user to place item on the scale (the scale app will send the weight automatically)
6. Give practical cooking tips
7. WARN about critical moments (heat control, timing, etc.)
8. Be enthusiastic, motivating, like a chef-friend
9. Answer BRIEFLY - this is real-time voice conversation
10. You can comment on what you see through the camera
11. At the end, celebrate success and give serving tips!
12. After all steps are done and user confirms they're finished (ask: "Is there anything else I can help you with?"), call end_session tool to complete the cooking session

Be flexible with timing estimates based on what you see and what the user tells you.`;
}
