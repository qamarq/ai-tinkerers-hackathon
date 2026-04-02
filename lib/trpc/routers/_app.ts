import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../server";

export const appRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return `Hello ${input.name}!`;
    }),
});

export type AppRouter = typeof appRouter;
