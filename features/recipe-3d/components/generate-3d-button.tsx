"use client";

import { Box, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";

interface Generate3dButtonProps {
  recipeName: string;
  summary: string;
  ingredients: string[];
  onTaskCreated: (taskId: number) => void;
}

export function Generate3dButton({
  recipeName,
  summary,
  ingredients,
  onTaskCreated,
}: Generate3dButtonProps) {
  const mutation = trpc.recipe3d.generate.useMutation({
    onSuccess: (data) => {
      onTaskCreated(data.taskId);
    },
  });

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => mutation.mutate({ recipeName, summary, ingredients })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Box className="mr-2 h-4 w-4" />
      )}
      {mutation.isPending ? "Generating..." : "Generate 3D Model"}
    </Button>
  );
}
