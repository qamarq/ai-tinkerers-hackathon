"use client";

import Link from "next/link";
import { useAtom } from "jotai";
import { ArrowLeft, ChefHat, Home, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { ingredientsAtom, stepsAtom } from "../atoms/cookingAtoms";

interface CookingFinishProps {
  onRestart: () => void;
}

export function CookingFinish({ onRestart }: CookingFinishProps) {
  const [ingredients] = useAtom(ingredientsAtom);
  const [steps] = useAtom(stepsAtom);

  const completedIngredients = ingredients.filter((i) => i.checked).length;
  const completedSteps = steps.filter((s) => s.checked).length;
  const allStepsCompleted = completedSteps === steps.length;
  const stepsProgress = steps.length
    ? (completedSteps / steps.length) * 100
    : 0;
  const ingredientsProgress = ingredients.length
    ? (completedIngredients / ingredients.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 via-background to-background">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Gotownik.love
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <ChefHat className="h-3.5 w-3.5" />
            Session complete
          </div>
        </div>

        <div className="mx-auto max-w-2xl space-y-6">
          <div className="text-center">
            <p className="mb-3 text-5xl">{allStepsCompleted ? "🎉" : "👨‍🍳"}</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {allStepsCompleted ? "Bon Appetit!" : "Cooking Session Ended"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {allStepsCompleted
                ? "Great work - you completed every step."
                : "Your progress is saved, so you can continue anytime."}
            </p>
          </div>

          <Card className="border-border/70 shadow-xl">
            <CardHeader className="border-b bg-muted/35">
              <CardTitle className="text-xl">Session Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-4 sm:p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cooking Steps</span>
                  <span className="font-mono font-semibold">
                    {completedSteps}/{steps.length}
                  </span>
                </div>
                <Progress value={stepsProgress} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Ingredients Used
                  </span>
                  <span className="font-mono font-semibold">
                    {completedIngredients}/{ingredients.length}
                  </span>
                </div>
                <Progress value={ingredientsProgress} className="h-2" />
              </div>

              {allStepsCompleted && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">
                    Achievement unlocked
                  </p>
                  <p className="mt-1">Perfect Carbonara Chef</p>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button onClick={onRestart} className="w-full sm:flex-1">
                  <RotateCcw className="h-4 w-4" />
                  Start New Session
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
