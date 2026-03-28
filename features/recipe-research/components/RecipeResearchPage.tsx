"use client";

import { useEffect, useMemo, useState } from "react";
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
import type { FridgeInventory } from "@/lib/trpc/routers/fridge";
import type { RecipeResearchResult } from "@/lib/trpc/routers/recipe-research";

import { useRecipeResearch } from "../hooks/useRecipeResearch";

const FRIDGE_INVENTORY_STORAGE_KEY = "fridge:lastInventory";

export function RecipeResearchPage() {
  const [fridgeInventory, setFridgeInventory] =
    useState<FridgeInventory | null>(null);
  const [userRequest, setUserRequest] = useState("");
  const [result, setResult] = useState<RecipeResearchResult | null>(null);

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

  const handleResearch = async () => {
    if (!fridgeInventory || !canSubmit) {
      return;
    }

    reset();
    setResult(null);

    try {
      const response = await findRecipes({
        fridgeInventory: {
          items: fridgeInventory.items,
        },
        userRequest: userRequest.trim(),
      });

      setResult(response);
    } catch {
      setResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 via-background to-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl">Recipe Research Agent</CardTitle>
            <CardDescription>
              Tell us what you want to cook and this agent will return 3 recipes
              that best match your request and current fridge ingredients.
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
                <Label htmlFor="user-request">What do you want to cook?</Label>
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

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
          </div>
        )}

        {result && (
          <>
            <div className="grid gap-4 lg:grid-cols-3">
              {result.recipes.map((recipe, index) => (
                <Card key={`${recipe.title}-${index}`}>
                  <CardHeader>
                    <CardTitle className="text-xl">{recipe.title}</CardTitle>
                    <CardDescription>{recipe.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge>
                        Have {recipe.availableIngredients.length}/
                        {recipe.ingredients.length}
                      </Badge>
                      <Badge variant="outline">
                        Missing {recipe.missingCount}
                      </Badge>
                      {recipe.fewMissing && (
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                          Few ingredients missing
                        </Badge>
                      )}
                    </div>

                    {recipe.estimatedTimeMinutes && (
                      <p className="text-sm text-muted-foreground">
                        Estimated time: {recipe.estimatedTimeMinutes} minutes
                      </p>
                    )}

                    <p className="text-sm">{recipe.whyItFits}</p>

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
                      className="text-sm underline"
                    >
                      Open source recipe
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Research Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.activity.map((item, index) => (
                    <div
                      key={`${item.message}-${index}`}
                      className="rounded-md border p-2 text-sm"
                    >
                      <p className="font-medium capitalize">
                        {item.type} - {item.status}
                      </p>
                      <p className="text-muted-foreground">{item.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
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
