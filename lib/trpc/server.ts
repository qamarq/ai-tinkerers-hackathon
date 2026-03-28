import { initTRPC } from "@trpc/server";
import { cache } from "react";
import { z } from "zod";

export const createTRPCContext = cache(async () => {
  return {};
});

const t = initTRPC.create();

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
