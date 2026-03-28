"use client";

import { useEffect, useRef, useState } from "react";

interface RecipeModelViewerProps {
  modelUrl: string;
  recipeName: string;
}

export function RecipeModelViewer({
  modelUrl,
  recipeName,
}: RecipeModelViewerProps) {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("@google/model-viewer").then(() => setLoaded(true));
  }, []);

  if (!loaded) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">Loading 3D viewer...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="overflow-hidden rounded-lg">
      <model-viewer
        src={modelUrl}
        alt={`3D model of ${recipeName}`}
        auto-rotate
        camera-controls
        shadow-intensity="1"
        style={{ width: "100%", height: "300px" }}
      />
    </div>
  );
}
