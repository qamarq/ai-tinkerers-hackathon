import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { runFridgeVisionAgent } from "@/features/fridge/server/fridgeVisionAgent";

import { createTRPCRouter, publicProcedure } from "../server";

const maxImageDataUrlLength = 2_500_000;

const fridgeImageInputSchema = z.object({
  imageDataUrl: z
    .string()
    .startsWith("data:image/")
    .max(
      maxImageDataUrlLength,
      "Image payload too large. Please retake with lower resolution.",
    ),
});

const fridgeItemSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  confidence: z.number(),
  location: z.enum(["shelf", "door", "drawer", "freezer"]),
  category: z.string().optional(),
});

const fridgeInventorySchema = z.object({
  items: z.array(fridgeItemSchema),
  meta: z.object({
    analyzedAt: z.string(),
    imageSize: z.number(),
    notes: z.string().optional(),
  }),
});

export type FridgeItem = z.infer<typeof fridgeItemSchema>;
export type FridgeInventory = z.infer<typeof fridgeInventorySchema>;

export const fridgeRouter = createTRPCRouter({
  parseImage: publicProcedure
    .input(fridgeImageInputSchema)
    .output(fridgeInventorySchema)
    .mutation(async ({ input }) => {
      if (!process.env.GEMINI_API_KEY) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "GEMINI_API_KEY is missing on the server.",
        });
      }

      const agentOutput = await runFridgeVisionAgent(input.imageDataUrl);

      return {
        items: agentOutput.items,
        meta: {
          analyzedAt: new Date().toISOString(),
          imageSize: input.imageDataUrl.length,
          notes: agentOutput.notes,
        },
      };
    }),
});
