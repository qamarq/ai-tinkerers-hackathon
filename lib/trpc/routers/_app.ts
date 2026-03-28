import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../server";
import { fridgeRouter } from "./fridge";
import { recipeResearchRouter } from "./recipe-research";
import { recipe3dRouter } from "./recipe3d";

export const appRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return `Hello ${input.name}!`;
    }),
  fridge: fridgeRouter,
  recipe3d: recipe3dRouter,
  recipeResearch: recipeResearchRouter,
});

export type AppRouter = typeof appRouter;
