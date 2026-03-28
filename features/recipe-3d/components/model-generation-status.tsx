"use client";

import { AlertCircle, Loader2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc/client";

interface ModelGenerationStatusProps {
  taskId: number;
  onComplete: (modelUrl: string) => void;
  onError: (message: string) => void;
}

export function ModelGenerationStatus({
  taskId,
  onComplete,
  onError,
}: ModelGenerationStatusProps) {
  const { data: task } = trpc.recipe3d.getStatus.useQuery(
    { taskId },
    {
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (status === "SUCCEEDED" || status === "FAILED") return false;
        return 3000;
      },
    },
  );

  if (task?.status === "SUCCEEDED" && task.modelUrl) {
    // Notify parent on next tick to avoid setState-during-render
    setTimeout(() => onComplete(task.modelUrl!), 0);
  }

  if (task?.status === "FAILED") {
    setTimeout(() => onError(task.errorMessage ?? "Generation failed"), 0);
  }

  const statusText =
    task?.status === "PENDING"
      ? "Starting generation..."
      : task?.status === "GENERATING"
        ? `Creating 3D model... ${task.progress}%`
        : task?.status === "SUCCEEDED"
          ? "Complete!"
          : task?.status === "FAILED"
            ? "Failed"
            : "Initializing...";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {task?.status === "FAILED" ? (
          <AlertCircle className="h-4 w-4 text-destructive" />
        ) : (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        <span className="text-sm text-muted-foreground">{statusText}</span>
      </div>
      <Progress value={task?.progress ?? 0} className="h-2" />
    </div>
  );
}
