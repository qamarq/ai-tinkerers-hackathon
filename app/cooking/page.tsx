"use client";

import { useEffect, useState } from "react";
import { Provider, useSetAtom } from "jotai";

import {
  ingredientsAtom,
  stepsAtom,
} from "@/features/cooking/atoms/cookingAtoms";
import { CookingFinish } from "@/features/cooking/components/CookingFinish";
import { CookingSession } from "@/features/cooking/components/CookingSession";
import { CookingSetup } from "@/features/cooking/components/CookingSetup";
import { loadRecipeForCooking } from "@/features/cooking/utils/recipeTransformer";

type View = "setup" | "session" | "finish";

interface SessionState {
  cameraId: string;
  micId: string;
}

function CookingPageContent() {
  const [view, setView] = useState<View>("setup");
  const [session, setSession] = useState<SessionState>({
    cameraId: "",
    micId: "",
  });
  const [recipeInfo, setRecipeInfo] = useState<{
    title: string;
    stepsCount: number;
    timeMinutes?: number;
  } | null>(null);

  const setIngredients = useSetAtom(ingredientsAtom);
  const setSteps = useSetAtom(stepsAtom);

  // Load recipe from recipe-research if available
  useEffect(() => {
    const recipe = loadRecipeForCooking();
    if (recipe) {
      setIngredients(recipe.ingredients);
      setSteps(recipe.steps);
      setRecipeInfo({
        title: recipe.title,
        stepsCount: recipe.steps.length,
        timeMinutes: recipe.estimatedTimeMinutes,
      });
    }
  }, [setIngredients, setSteps]);

  const handleStart = (cameraId: string, micId: string) => {
    setSession({ cameraId, micId });
    setView("session");
  };

  const handleEnd = () => {
    setView("setup");
  };

  const handleSessionEnd = () => {
    setView("finish");
  };

  const handleRestart = () => {
    setView("setup");
  };

  return (
    <>
      {view === "setup" ? (
        <CookingSetup onStart={handleStart} recipeInfo={recipeInfo} />
      ) : view === "session" ? (
        <CookingSession
          cameraId={session.cameraId}
          micId={session.micId}
          onEnd={handleEnd}
          onSessionEnd={handleSessionEnd}
          recipeTitle={recipeInfo?.title}
        />
      ) : (
        <CookingFinish onRestart={handleRestart} />
      )}
    </>
  );
}

export default function CookingPage() {
  return (
    <Provider>
      <CookingPageContent />
    </Provider>
  );
}
