"use client";

import { useState } from "react";

import { trpc } from "@/lib/trpc/client";

import { Generate3dButton } from "./generate-3d-button";
import { ModelGenerationStatus } from "./model-generation-status";
import { RecipeModelViewer } from "./recipe-model-viewer";

type Phase = "idle" | "generating" | "viewing" | "error";

interface Recipe3dSectionProps {
  recipeName: string;
  summary: string;
  ingredients: string[];
}

export function Recipe3dSection({
  recipeName,
  summary,
  ingredients,
}: Recipe3dSectionProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [taskId, setTaskId] = useState<number | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check if a model already exists for this recipe
  const { data: existingTask } = trpc.recipe3d.getByRecipeName.useQuery(
    { recipeName },
    {
      enabled: phase === "idle",
    },
  );

  // If an existing completed model is found, show it
  if (
    phase === "idle" &&
    existingTask?.status === "SUCCEEDED" &&
    existingTask.modelUrl
  ) {
    return (
      <div className="mt-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">3D Preview</p>
        <RecipeModelViewer
          modelUrl={existingTask.modelUrl}
          recipeName={recipeName}
        />
      </div>
    );
  }

  // If an existing in-progress task is found, show status
  if (
    phase === "idle" &&
    existingTask &&
    (existingTask.status === "PENDING" || existingTask.status === "GENERATING")
  ) {
    return (
      <div className="mt-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          3D Model Generation
        </p>
        <ModelGenerationStatus
          taskId={existingTask.id}
          onComplete={(url) => {
            setModelUrl(url);
            setPhase("viewing");
          }}
          onError={(msg) => {
            setErrorMsg(msg);
            setPhase("error");
          }}
        />
      </div>
    );
  }

  if (phase === "idle") {
    return (
      <div className="mt-3 flex justify-center">
        <Generate3dButton
          recipeName={recipeName}
          summary={summary}
          ingredients={ingredients}
          onTaskCreated={(id) => {
            setTaskId(id);
            setPhase("generating");
          }}
        />
      </div>
    );
  }

  if (phase === "generating" && taskId !== null) {
    return (
      <div className="mt-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          3D Model Generation
        </p>
        <ModelGenerationStatus
          taskId={taskId}
          onComplete={(url) => {
            setModelUrl(url);
            setPhase("viewing");
          }}
          onError={(msg) => {
            setErrorMsg(msg);
            setPhase("error");
          }}
        />
      </div>
    );
  }

  if (phase === "viewing" && modelUrl) {
    return (
      <div className="mt-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">3D Preview</p>
        <RecipeModelViewer modelUrl={modelUrl} recipeName={recipeName} />
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="mt-3 space-y-2">
        <p className="text-xs text-destructive">
          3D generation failed: {errorMsg}
        </p>
        <Generate3dButton
          recipeName={recipeName}
          summary={summary}
          ingredients={ingredients}
          onTaskCreated={(id) => {
            setTaskId(id);
            setPhase("generating");
          }}
        />
      </div>
    );
  }

  return null;
}
