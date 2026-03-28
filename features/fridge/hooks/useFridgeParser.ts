'use client';

import { trpc } from '@/lib/trpc/client';
import type { FridgeInventory } from '@/lib/trpc/routers/fridge';

export function useFridgeParser(): {
  parseImage: (imageDataUrl: string) => Promise<FridgeInventory>;
  isParsing: boolean;
  error: string | null;
  reset: () => void;
} {
  const mutation = trpc.fridge.parseImage.useMutation();

  const parseImage = async (imageDataUrl: string): Promise<FridgeInventory> => {
    return await mutation.mutateAsync({ imageDataUrl });
  };

  return {
    parseImage,
    isParsing: mutation.isPending,
    error: mutation.error?.message ?? null,
    reset: mutation.reset,
  };
}
