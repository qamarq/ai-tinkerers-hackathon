"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle,
  ChefHat,
  CookingPot,
  Leaf,
  Lightbulb,
  LinkSimple,
  MagnifyingGlass,
  Star,
  Timer,
  Tray,
  XCircle,
} from "@phosphor-icons/react";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Flame,
  Link2,
  Sparkles,
} from "lucide-react";

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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Recipe3dSection } from "@/features/recipe-3d/components/recipe-3d-section";
import type { FridgeInventory } from "@/lib/trpc/routers/fridge";
import type { RecipeResearchResult } from "@/lib/trpc/routers/recipe-research";

import { useRecipeResearch } from "../hooks/useRecipeResearch";

const FRIDGE_INVENTORY_STORAGE_KEY = "fridge:lastInventory";

export function RecipeResearchPage() {
  const router = useRouter();
  const [fridgeInventory, setFridgeInventory] =
    useState<FridgeInventory | null>(null);
  const [userRequest, setUserRequest] = useState("");
  const [result, setResult] = useState<RecipeResearchResult | null>(null);
  const [quickSearches, setQuickSearches] = useState<string[]>([]);
  const [liveActivity, setLiveActivity] = useState<
    RecipeResearchResult["activity"]
  >([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const activityTimersRef = useRef<number[]>([]);
  const completedQuickSearchSeedRef = useRef<string | null>(null);
  const inFlightQuickSearchSeedRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    findRecipes,
    suggestQuickSearches,
    isSuggestingQuickSearches,
    isLoading,
    error,
    reset,
  } = useRecipeResearch();
  const suggestQuickSearchesRef = useRef(suggestQuickSearches);

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

  useEffect(() => {
    if (!result && !isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [result, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      setLiveActivity([]);
      return;
    }

    const streamPlan: Array<RecipeResearchResult["activity"][number]> = [
      {
        type: "search",
        status: "pending",
        message: "Searching recipe sources across the web",
        timestamp: new Date().toISOString(),
      },
      {
        type: "extract",
        status: "pending",
        message: "Extracting recipe details from top matches",
        timestamp: new Date().toISOString(),
      },
      {
        type: "analyze",
        status: "pending",
        message: "Analyzing ingredients and nutrition",
        timestamp: new Date().toISOString(),
      },
      {
        type: "synthesis",
        status: "pending",
        message: "Ranking and preparing your best 3 matches",
        timestamp: new Date().toISOString(),
      },
    ];

    setLiveActivity([]);
    setCurrentStepIndex(0);
    let currentIndex = 0;

    const tick = () => {
      setLiveActivity((prev) => {
        if (prev.length > currentIndex) return prev;

        const newActivity = [...prev];
        if (currentIndex < streamPlan.length) {
          newActivity.push({
            ...streamPlan[currentIndex],
            timestamp: new Date().toISOString(),
          });
        }
        return newActivity;
      });

      if (currentIndex < streamPlan.length - 1) {
        currentIndex++;
        setCurrentStepIndex(currentIndex);
        setTimeout(tick, 500);
      }
    };

    tick();
  }, [isLoading]);

  const fridgeNames = useMemo(
    () => fridgeInventory?.items.map((item) => item.name) ?? [],
    [fridgeInventory],
  );

  const canSubmit = userRequest.trim().length >= 3 && fridgeNames.length > 0;
  const quickSearchSeed = useMemo(
    () =>
      fridgeNames
        .map((name) => name.trim().toLowerCase())
        .filter(Boolean)
        .sort()
        .join("|"),
    [fridgeNames],
  );

  useEffect(() => {
    suggestQuickSearchesRef.current = suggestQuickSearches;
  }, [suggestQuickSearches]);

  useEffect(() => {
    if (!quickSearchSeed) {
      completedQuickSearchSeedRef.current = null;
      inFlightQuickSearchSeedRef.current = null;
      return;
    }

    if (completedQuickSearchSeedRef.current === quickSearchSeed) {
      return;
    }

    if (inFlightQuickSearchSeedRef.current === quickSearchSeed) {
      return;
    }

    inFlightQuickSearchSeedRef.current = quickSearchSeed;

    let cancelled = false;

    const suggest = async () => {
      try {
        const response = await suggestQuickSearchesRef.current({
          fridgeIngredients: fridgeNames,
        });

        if (!cancelled) {
          setQuickSearches(response.searches);
          completedQuickSearchSeedRef.current = quickSearchSeed;
          inFlightQuickSearchSeedRef.current = null;
        }
      } catch {
        if (!cancelled) {
          setQuickSearches([]);
          inFlightQuickSearchSeedRef.current = null;
        }
      }
    };

    void suggest();

    return () => {
      cancelled = true;
      if (inFlightQuickSearchSeedRef.current === quickSearchSeed) {
        inFlightQuickSearchSeedRef.current = null;
      }
    };
  }, [fridgeNames, quickSearchSeed]);

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

  const handleResearch = async (requestOverride?: string) => {
    const effectiveRequest = (requestOverride ?? userRequest).trim();
    const canSubmitRequest =
      effectiveRequest.length >= 3 && fridgeNames.length > 0;

    if (!fridgeInventory || !canSubmitRequest) {
      return;
    }

    if (requestOverride) {
      setUserRequest(effectiveRequest);
    }

    reset();
    setResult(null);
    clearActivityTimers();

    try {
      const response = await findRecipes({
        fridgeInventory: {
          items: fridgeInventory.items,
        },
        userRequest: effectiveRequest,
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

  const matchPercentage = (recipe: {
    availableIngredients: unknown[];
    ingredients: unknown[];
  }) => {
    return Math.round(
      (recipe.availableIngredients.length / recipe.ingredients.length) * 100,
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 via-background to-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Gotownik.love
          </Link>
          <div className="flex items-center gap-2">
            <CookingPot className="h-5 w-5 text-primary" weight="fill" />
            <span className="text-sm font-medium">Recipe Research</span>
          </div>
          <div className="w-24" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        {!isLoading && !result && (
          <>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center gap-2 bg-primary/10 rounded-full px-4 py-1.5">
                <MagnifyingGlass
                  className="h-5 w-5 text-primary"
                  weight="bold"
                />
                <span className="text-sm font-medium text-primary">
                  AI Recipe Agent
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                What do you want to cook?
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto text-base">
                Tell us your cravings and we&apos;ll find 3 perfect recipes
                using what&apos;s already in your fridge.
              </p>
            </div>

            <Card className="border-primary/20 shadow-xl shadow-primary/5 overflow-hidden">
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-semibold text-primary">
                        1
                      </span>
                    </div>
                    <Label className="text-base font-medium">
                      Your fridge contents
                    </Label>
                  </div>
                  {fridgeNames.length > 0 ? (
                    <div className="rounded-2xl border bg-gradient-to-br from-muted/40 to-muted/20 p-4">
                      <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                        <Tray className="h-4 w-4" />
                        <span>
                          {fridgeNames.length} ingredient
                          {fridgeNames.length === 1 ? "" : "s"} from your last
                          scan
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {fridgeNames.map((name) => (
                          <Badge
                            key={name}
                            variant="secondary"
                            className="rounded-full px-3 py-1 text-sm font-medium"
                          >
                            <Leaf className="h-3 w-3 mr-1.5 text-primary" />
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-muted-foreground/20 p-6 text-center">
                      <p className="text-sm text-muted-foreground mb-3">
                        No fridge scan data found. Scan your fridge first.
                      </p>
                      <Button variant="outline" asChild>
                        <Link href="/fridge" className="gap-2">
                          <CookingPot className="h-4 w-4" />
                          Open Fridge Scanner
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-2xl blur-xl opacity-50" />
                  <div className="relative space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-semibold text-primary">
                          2
                        </span>
                      </div>
                      <Label
                        htmlFor="user-request"
                        className="text-base font-medium"
                      >
                        Your request
                      </Label>
                    </div>
                    <div className="relative">
                      <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        ref={inputRef}
                        id="user-request"
                        placeholder="Example: high-protein dinner under 30 minutes, or vegetarian pasta..."
                        value={userRequest}
                        onChange={(event) => setUserRequest(event.target.value)}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" &&
                            canSubmit &&
                            !isLoading
                          ) {
                            void handleResearch();
                          }
                        }}
                        className="h-14 pl-12 text-base rounded-2xl border-2 border-primary/20 focus:border-primary shadow-lg shadow-primary/10 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {fridgeNames.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Quick searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(isSuggestingQuickSearches
                        ? [1, 2, 3, 4]
                        : quickSearches
                      ).map((item, index) =>
                        typeof item === "string" ? (
                          <Button
                            key={item}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              void handleResearch(item);
                            }}
                            className="rounded-full"
                          >
                            {item}
                          </Button>
                        ) : (
                          <Skeleton
                            key={`skeleton-${index}`}
                            className="h-8 rounded-full"
                            style={{
                              width: `${120 + index * 20}px`,
                            }}
                          />
                        ),
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  size="lg"
                  onClick={() => void handleResearch()}
                  disabled={!canSubmit || isLoading}
                  className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 gap-2"
                >
                  {isLoading ? (
                    <>
                      <Sparkles className="h-5 w-5 animate-pulse" />
                      Researching recipes...
                    </>
                  ) : (
                    <>
                      <MagnifyingGlass className="h-5 w-5" />
                      Find 3 Best Recipes
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Tray className="h-3.5 w-3.5" />
                    <span>Fridge scan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI analysis</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>3 recipes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!result && (liveActivity.length > 0 || isLoading) && (
          <Card className="rounded-3xl border border-border/60 bg-muted/35 shadow-[inset_1px_1px_0_rgba(255,255,255,0.7),inset_-1px_-1px_0_rgba(0,0,0,0.06),0_12px_26px_rgba(0,0,0,0.08)] overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <ChefHat className="h-5 w-5" />
                    Research in Progress
                  </CardTitle>
                  <CardDescription>
                    Our AI is browsing the web to find your perfect recipes
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                {liveActivity.map((item, index) => (
                  <div
                    key={`${item.message}-${index}`}
                    className={`flex items-start gap-3 rounded-xl border p-4 transition-all ${
                      item.status === "complete"
                        ? "border-green-200 bg-green-50/50"
                        : item.status === "error"
                          ? "border-red-200 bg-red-50/50"
                          : "border-border/50 bg-background/50"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        item.status === "complete"
                          ? "bg-green-100 text-green-600"
                          : item.status === "error"
                            ? "bg-red-100 text-red-600"
                            : "bg-primary/10 text-primary"
                      }`}
                    >
                      {item.status === "complete" ? (
                        <CheckCircle className="h-4 w-4" weight="fill" />
                      ) : item.status === "error" ? (
                        <XCircle className="h-4 w-4" weight="fill" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm capitalize flex items-center gap-2">
                        {item.type === "search" && (
                          <MagnifyingGlass className="h-4 w-4" />
                        )}
                        {item.type === "extract" && (
                          <BookOpen className="h-4 w-4" />
                        )}
                        {item.type === "analyze" && (
                          <Lightbulb className="h-4 w-4" />
                        )}
                        {item.type === "synthesis" && (
                          <Star className="h-4 w-4" />
                        )}
                        {item.type}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.message}
                      </p>
                    </div>
                    {item.status === "pending" && isLoading && (
                      <div className="w-16">
                        <Progress
                          value={100}
                          className="h-1.5 animate-progress"
                        />
                      </div>
                    )}
                  </div>
                ))}
                {liveActivity.length === 4 && isLoading && (
                  <div className="flex flex-col items-center justify-center py-6 gap-3">
                    <div className="relative">
                      <CookingPot
                        className="h-12 w-12 text-primary animate-bounce"
                        weight="fill"
                      />
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-1">
                        <div
                          className="w-1 h-3 bg-muted-foreground/50 rounded-full animate-pulse"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-1 h-4 bg-muted-foreground/50 rounded-full animate-pulse"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-1 h-3 bg-muted-foreground/50 rounded-full animate-pulse"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground animate-pulse">
                      Cooking up your recipes...
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <>
            {!isLoading && (
              <div className="grid gap-6 lg:grid-cols-3">
                {result.recipes.map((recipe, index) => {
                  const isTopResult = index === 0;
                  return (
                    <Card
                      key={`${recipe.title}-${index}`}
                      className={`relative border ${
                        isTopResult
                          ? "border-primary shadow-lg shadow-primary/10"
                          : "border-border/60"
                      } bg-card rounded-xl overflow-hidden`}
                    >
                      {isTopResult && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                      )}
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex items-center justify-center h-7 w-7 rounded-full text-sm font-bold ${
                                isTopResult
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {index + 1}
                            </div>
                            {isTopResult && (
                              <Badge className="bg-primary text-primary-foreground hover:bg-primary gap-1">
                                <Star className="h-3 w-3" weight="fill" />
                                Top Match
                              </Badge>
                            )}
                          </div>
                          {recipe.fewMissing && recipe.missingCount > 0 && (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1">
                              <CheckCircle className="h-3 w-3" weight="fill" />
                              Almost Complete
                            </Badge>
                          )}
                          {!recipe.fewMissing && recipe.missingCount === 0 && (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
                              <CheckCircle className="h-3 w-3" weight="fill" />
                              All Ingredients
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg leading-snug">
                          {recipe.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-xs mt-1">
                          {recipe.summary}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className="rounded-full gap-1.5"
                          >
                            <Leaf className="h-3 w-3 text-primary" />
                            {matchPercentage(recipe)}%
                          </Badge>
                          <Badge
                            variant="outline"
                            className="rounded-full gap-1.5"
                          >
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {recipe.availableIngredients.length}/
                            {recipe.ingredients.length}
                          </Badge>
                          {recipe.missingCount > 0 && (
                            <Badge
                              variant="outline"
                              className="rounded-full gap-1 text-amber-600 border-amber-200"
                            >
                              <XCircle className="h-3 w-3" />
                              {recipe.missingCount} missing
                            </Badge>
                          )}
                        </div>

                        {recipe.estimatedTimeMinutes && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Timer className="h-4 w-4" />
                            <span>{recipe.estimatedTimeMinutes} min</span>
                          </div>
                        )}

                        <div className="space-y-2">
                          <p className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                            <Lightbulb className="h-3 w-3" />
                            Why it fits
                          </p>
                          <p className="text-sm leading-relaxed">
                            {recipe.whyItFits}
                          </p>
                        </div>

                        {recipe.missingIngredients.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-xs font-medium text-muted-foreground">
                              Need to get:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {recipe.missingIngredients.map((ing) => (
                                <Badge
                                  key={ing}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {ing}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => router.push("/cooking")}
                            className={`w-full gap-2 ${
                              isTopResult
                                ? ""
                                : "bg-muted hover:bg-muted/80 text-foreground"
                            }`}
                          >
                            <Flame className="h-4 w-4" />
                            Start Cooking
                          </Button>
                          <a
                            href={recipe.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground no-underline hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Source
                          </a>
                          <Recipe3dSection
                            recipeName={recipe.title}
                            summary={recipe.summary}
                            ingredients={recipe.ingredients}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Research Sources</h3>
              </div>
              <Card className="rounded-2xl border border-border/60 bg-muted/20 overflow-hidden">
                <CardContent className="p-4 grid gap-3">
                  {result.sources.map((source, index) => (
                    <a
                      key={`${source.url}-${index}`}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 rounded-xl border border-border/40 bg-background/60 p-3 no-underline hover:bg-background/80 hover:border-primary/20 transition-all group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <LinkSimple className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                          {source.title}
                        </p>
                        {source.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {source.description}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </a>
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
