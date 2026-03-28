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
import { Textarea } from "@/components/ui/textarea";
import type { FridgeInventory } from "@/lib/trpc/routers/fridge";
import type { RecipeResearchResult } from "@/lib/trpc/routers/recipe-research";

import { useRecipeResearch } from "../hooks/useRecipeResearch";

const FRIDGE_INVENTORY_STORAGE_KEY = "fridge:lastInventory";

function parseList(rawValue: string): string[] {
  return rawValue
    .split(/\n|,/)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function parseOptionalInt(rawValue: string): number | undefined {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.floor(parsed);
}

function parseOptionalNonNegativeInt(rawValue: string): number | undefined {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return Math.floor(parsed);
}

export function RecipeResearchPage() {
  const [fridgeInventory, setFridgeInventory] =
    useState<FridgeInventory | null>(null);
  const [userRequest, setUserRequest] = useState("");
  const [extraIngredientsInput, setExtraIngredientsInput] = useState("");
  const [excludedIngredientsInput, setExcludedIngredientsInput] = useState("");
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [servingsInput, setServingsInput] = useState("2");
  const [maxPrepMinutesInput, setMaxPrepMinutesInput] = useState("30");
  const [maxMissingIngredientsInput, setMaxMissingIngredientsInput] =
    useState("3");
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
        extraIngredients: parseList(extraIngredientsInput),
        excludedIngredients: parseList(excludedIngredientsInput),
        dietaryNotes: dietaryNotes.trim() || undefined,
        servings: parseOptionalInt(servingsInput),
        maxPrepMinutes: parseOptionalInt(maxPrepMinutesInput),
        maxMissingIngredients:
          parseOptionalNonNegativeInt(maxMissingIngredientsInput) ?? 3,
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
              Researches the web and returns 3 recipes that best match your
              request and current fridge ingredients.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Fridge ingredients found</Label>
              {fridgeNames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {fridgeNames.map((name) => (
                    <Badge key={name} variant="outline">
                      {name}
                    </Badge>
                  ))}
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="user-request">What do you want to cook?</Label>
                <Textarea
                  id="user-request"
                  placeholder="Example: high-protein dinner under 30 minutes, no seafood"
                  value={userRequest}
                  onChange={(event) => setUserRequest(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="extra-ingredients">
                  Extra ingredients (optional)
                </Label>
                <Textarea
                  id="extra-ingredients"
                  placeholder="onion, garlic, olive oil"
                  value={extraIngredientsInput}
                  onChange={(event) =>
                    setExtraIngredientsInput(event.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excluded-ingredients">
                  Exclude ingredients
                </Label>
                <Textarea
                  id="excluded-ingredients"
                  placeholder="peanuts, shellfish"
                  value={excludedIngredientsInput}
                  onChange={(event) =>
                    setExcludedIngredientsInput(event.target.value)
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="dietary-notes">Dietary notes (optional)</Label>
                <Input
                  id="dietary-notes"
                  placeholder="vegetarian, gluten-free, keto"
                  value={dietaryNotes}
                  onChange={(event) => setDietaryNotes(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  inputMode="numeric"
                  value={servingsInput}
                  onChange={(event) => setServingsInput(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-prep">Max prep minutes</Label>
                <Input
                  id="max-prep"
                  inputMode="numeric"
                  value={maxPrepMinutesInput}
                  onChange={(event) =>
                    setMaxPrepMinutesInput(event.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-missing">Max missing ingredients</Label>
                <Input
                  id="max-missing"
                  inputMode="numeric"
                  value={maxMissingIngredientsInput}
                  onChange={(event) =>
                    setMaxMissingIngredientsInput(event.target.value)
                  }
                />
              </div>
            </div>

            <Button disabled={!canSubmit || isLoading} onClick={handleResearch}>
              {isLoading ? "Researching recipes..." : "Find 3 Best Recipes"}
            </Button>

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
