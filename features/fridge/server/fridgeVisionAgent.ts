import { generateText, Output } from 'ai'
import { z } from 'zod'

import { gemini } from '@/lib/ai'

const fridgeAgentItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  confidence: z.number().min(0).max(1),
  location: z.enum(['shelf', 'door', 'drawer', 'freezer']),
  category: z.string().optional(),
})

const fridgeAgentOutputSchema = z.object({
  items: z.array(fridgeAgentItemSchema),
  notes: z.string().optional(),
})

export type FridgeAgentOutput = z.infer<typeof fridgeAgentOutputSchema>

export async function runFridgeVisionAgent(
  imageDataUrl: string
): Promise<FridgeAgentOutput> {
  const { output } = await generateText({
    model: gemini,
    output: Output.object({
      schema: fridgeAgentOutputSchema,
      name: 'FridgeInventoryExtraction',
      description:
        'Detected food and beverage items visible in a fridge photo with quantity/location estimates.',
    }),
    system:
      'You are a fridge inventory extraction agent. Identify visible fridge items and return only valid structured output. Use confidence values from 0 to 1. If uncertain, include fewer items instead of hallucinating.',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this fridge photo. Return only items clearly visible in the image.',
          },
          {
            type: 'image',
            image: imageDataUrl,
          },
        ],
      },
    ],
  })

  return output
}
