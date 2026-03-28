import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../server";
import { fridgeRouter } from "./fridge";

export const appRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return `Hello ${input.name}!`;
    }),
  fridge: fridgeRouter,
});

export type AppRouter = typeof appRouter;
