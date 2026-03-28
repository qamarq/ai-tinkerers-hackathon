"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Recipe3dSection } from "@/features/recipe-3d/components/recipe-3d-section";
import type { FridgeInventory } from "@/lib/trpc/routers/fridge";
import type { RecipeResearchResult } from "@/lib/trpc/routers/recipe-research";

import { useRecipeResearch } from "../hooks/useRecipeResearch";

const FRIDGE_INVENTORY_STORAGE_KEY = "fridge:lastInventory";

export function RecipeResearchPage() {
  const [fridgeInventory, setFridgeInventory] =
    useState<FridgeInventory | null>(null);
  const [userRequest, setUserRequest] = useState("");
  const [result, setResult] = useState<RecipeResearchResult | null>(null);
  const [liveActivity, setLiveActivity] = useState<
    RecipeResearchResult["activity"]
  >([]);
  const activityTimersRef = useRef<number[]>([]);

  const { findRecipes, isLoading, error, reset } = useRecipeResearch();

  useEffect(() => {
    const saved = window.localStorage.getItem(FRIDGE_INVENTORY_STORAGE_KEY);
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as FridgeInventory;
      if (Array.isArray(parsed.items)) {
        setFridgeInventory(parsed);
      }
    } catch {
      window.localStorage.removeItem(FRIDGE_INVENTORY_STORAGE_KEY);
    }
  }, []);

  const fridgeNames = useMemo(
    () => fridgeInventory?.items.map((item) => item.name) ?? [],
    [fridgeInventory],
  );

  const canSubmit = userRequest.trim().length >= 3 && fridgeNames.length > 0;

  const clearActivityTimers = () => {
    for (const timerId of activityTimersRef.current) {
      window.clearTimeout(timerId);
    }
    activityTimersRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearActivityTimers();
    };
  }, []);

  const handleResearch = async () => {
    if (!fridgeInventory || !canSubmit) {
      return;
    }

    reset();
    setResult(null);
    clearActivityTimers();
    setLiveActivity([]);

    const streamPlan: Array<RecipeResearchResult["activity"][number]> = [
      {
        type: "search",
        status: "pending",
        message: "Searching recipe sources",
        timestamp: new Date().toISOString(),
      },
      {
        type: "extract",
        status: "pending",
        message: "Extracting recipe details from top sources",
        timestamp: new Date().toISOString(),
      },
      {
        type: "analyze",
        status: "pending",
        message: "Analyzing and ranking recipes",
        timestamp: new Date().toISOString(),
      },
      {
        type: "synthesis",
        status: "pending",
        message: "Preparing your best 3 matches",
        timestamp: new Date().toISOString(),
      },
    ];

    streamPlan.forEach((item, index) => {
      const timerId = window.setTimeout(() => {
        setLiveActivity((previous) => [
          ...previous,
          {
            ...item,
            timestamp: new Date().toISOString(),
          },
        ]);
      }, index * 1100);

      activityTimersRef.current.push(timerId);
    });

    try {
      const response = await findRecipes({
        fridgeInventory: {
          items: fridgeInventory.items,
        },
        userRequest: userRequest.trim(),
      });

      clearActivityTimers();
      setLiveActivity(response.activity);
      setResult(response);
    } catch {
      clearActivityTimers();
      setLiveActivity((previous) => [
        ...previous,
        {
          type: "synthesis",
          status: "error",
          message: "Research failed before completion. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
      setResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 via-background to-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {!isLoading && !result && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl">Recipe Research Agent</CardTitle>
              <CardDescription>
                Tell us what you want to cook and this agent will return 3
                recipes that best match your request and current fridge
                ingredients.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Fridge ingredients found</Label>
                {fridgeNames.length > 0 ? (
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <div className="mb-2 text-xs text-muted-foreground">
                      Using {fridgeNames.length} ingredient
                      {fridgeNames.length === 1 ? "" : "s"} from your last scan
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {fridgeNames.map((name) => (
                        <Badge key={name} variant="outline">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                    No fridge scan data found. Scan your fridge first.
                    <div className="mt-2">
                      <Link href="/fridge" className="underline">
                        Open Fridge Scanner
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleResearch();
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="user-request">
                    What do you want to cook?
                  </Label>
                  <Input
                    id="user-request"
                    placeholder="Example: high-protein dinner under 30 minutes"
                    value={userRequest}
                    onChange={(event) => setUserRequest(event.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!canSubmit || isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? "Researching recipes..." : "Find 3 Best Recipes"}
                </Button>
              </form>

              {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!result && (liveActivity.length > 0 || isLoading) && (
          <section className="rounded-3xl border border-border/60 bg-muted/35 p-5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.65),inset_-1px_-1px_0_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)]">
            <div className="mb-4">
              <h2 className="text-xl font-semibold tracking-tight">
                Research Activity Stream
              </h2>
              <p className="text-sm text-muted-foreground">
                Live updates while the recipe agent researches the web.
              </p>
            </div>

            <div className="space-y-2.5">
              {liveActivity.map((item, index) => (
                <div
                  key={`${item.message}-${index}`}
                  className="rounded-2xl border border-border/50 bg-background/70 px-3 py-2.5 text-sm shadow-[inset_1px_1px_0_rgba(255,255,255,0.6),inset_-1px_-1px_0_rgba(0,0,0,0.06)]"
                >
                  <p className="font-medium capitalize">
                    {item.type} - {item.status}
                  </p>
                  <p className="text-muted-foreground">{item.message}</p>
                </div>
              ))}

              {isLoading && (
                <div className="rounded-2xl border border-border/50 bg-background/70 px-3 py-2.5 text-sm text-muted-foreground shadow-[inset_1px_1px_0_rgba(255,255,255,0.6),inset_-1px_-1px_0_rgba(0,0,0,0.06)]">
                  Agent is still working...
                </div>
              )}
            </div>
          </section>
        )}

        {result && (
          <>
            <div className="grid gap-5 lg:grid-cols-3">
              {result.recipes.map((recipe, index) => (
                <Card
                  key={`${recipe.title}-${index}`}
                  className="overflow-hidden rounded-3xl border border-border/60 bg-muted/35 shadow-[inset_1px_1px_0_rgba(255,255,255,0.7),inset_-1px_-1px_0_rgba(0,0,0,0.06),0_12px_26px_rgba(0,0,0,0.08)]"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">{recipe.title}</CardTitle>
                    <CardDescription>{recipe.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="rounded-full">
                        Have {recipe.availableIngredients.length}/
                        {recipe.ingredients.length}
                      </Badge>
                      <Badge variant="outline" className="rounded-full">
                        Missing {recipe.missingCount}
                      </Badge>
                      {recipe.fewMissing && recipe.missingCount > 0 && (
                        <Badge className="rounded-full bg-emerald-600 text-white hover:bg-emerald-600">
                          Few ingredients missing
                        </Badge>
                      )}
                    </div>

                    {recipe.estimatedTimeMinutes && (
                      <p className="text-sm text-muted-foreground">
                        Estimated time: {recipe.estimatedTimeMinutes} minutes
                      </p>
                    )}

                    <p className="rounded-2xl border border-border/50 bg-background/70 px-3 py-2 text-sm shadow-[inset_1px_1px_0_rgba(255,255,255,0.65),inset_-1px_-1px_0_rgba(0,0,0,0.05)]">
                      {recipe.whyItFits}
                    </p>

                    <div className="space-y-1 text-sm">
                      <p className="font-medium">Missing ingredients:</p>
                      {recipe.missingIngredients.length > 0 ? (
                        <p className="text-muted-foreground">
                          {recipe.missingIngredients.join(", ")}
                        </p>
                      ) : (
                        <p className="text-emerald-700">
                          You already have everything.
                        </p>
                      )}
                    </div>

                    <a
                      href={recipe.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm font-medium no-underline shadow-[inset_1px_1px_0_rgba(255,255,255,0.65),inset_-1px_-1px_0_rgba(0,0,0,0.05)] transition hover:bg-background"
                    >
                      Open source recipe
                    </a>

                    <Recipe3dSection
                      recipeName={recipe.title}
                      summary={recipe.summary}
                      ingredients={recipe.ingredients}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card className="rounded-3xl border border-border/60 bg-muted/35 shadow-[inset_1px_1px_0_rgba(255,255,255,0.7),inset_-1px_-1px_0_rgba(0,0,0,0.06),0_12px_26px_rgba(0,0,0,0.08)]">
                <CardHeader>
                  <CardTitle>Sources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.sources.map((source, index) => (
                    <div key={`${source.url}-${index}`} className="text-sm">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline"
                      >
                        {source.title}
                      </a>
                      {source.description && (
                        <p className="text-muted-foreground">
                          {source.description}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
