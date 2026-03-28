"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowCounterClockwise,
  CheckCircle,
  CookingPot,
  Door,
  MagnifyingGlass,
  Package,
  Snowflake,
  Sparkle,
  Tray,
  Warning,
  XCircle,
} from "@phosphor-icons/react";
import {
  Activity,
  Apple,
  Carrot,
  Cookie,
  CupSoda,
  Drumstick,
  Fish,
  Hamburger,
  Leaf,
  Snowflake as LucideSnowflake,
  Milk,
  Wine,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { FridgeInventory } from "@/lib/trpc/routers/fridge";

interface FridgeResultProps {
  result: FridgeInventory | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

type LoadingStep = {
  type: string;
  status: "pending" | "active" | "complete";
  message: string;
};

const INGREDIENT_ICONS: Record<string, React.ElementType> = {
  apple: Apple,
  orange: Drumstick,
  milk: Milk,
  cheese: Cookie,
  carrot: Carrot,
  butter: Cookie,
  egg: Drumstick,
  bread: Hamburger,
  ketchup: Wine,
  mustard: Wine,
  mayo: Wine,
  juice: CupSoda,
  water: CupSoda,
  soda: CupSoda,
  beer: Wine,
  wine: Wine,
  fish: Fish,
  chicken: Drumstick,
  beef: Drumstick,
  pork: Drumstick,
  shrimp: Fish,
  salmon: Fish,
  lettuce: Leaf,
  cucumber: Carrot,
  onion: LucideSnowflake,
  garlic: LucideSnowflake,
  potato: Carrot,
  mushroom: Drumstick,
  broccoli: LucideSnowflake,
  corn: Carrot,
  peas: Drumstick,
  beans: Drumstick,
  rice: Hamburger,
  pasta: Hamburger,
  noodles: Hamburger,
  cereal: Hamburger,
  yogurt: Milk,
  ice: LucideSnowflake,
  icecream: LucideSnowflake,
  default: Package,
};

const getIngredientIcon = (name: string): React.ElementType => {
  const lower = name.toLowerCase();
  for (const [key, Icon] of Object.entries(INGREDIENT_ICONS)) {
    if (lower.includes(key)) return Icon;
  }
  return Package;
};

const getQuantityLabel = (quantity: number, unit: string): string => {
  if (unit === "piece" || unit === "pieces") {
    if (quantity === 1) {
      return "1 item";
    }
    return `${quantity} items`;
  }
  if (unit === "slice" || unit === "slices") {
    return `${quantity} slice${quantity > 1 ? "s" : ""}`;
  }
  if (unit === "cup" || unit === "cups") {
    return `${quantity} cup${quantity > 1 ? "s" : ""}`;
  }
  if (unit === "bottle" || unit === "bottles") {
    return `${quantity} bottle${quantity > 1 ? "s" : ""}`;
  }
  if (unit === "can" || unit === "cans") {
    return `${quantity} can${quantity > 1 ? "s" : ""}`;
  }
  if (unit === "jar" || unit === "jars") {
    return `${quantity} jar${quantity > 1 ? "s" : ""}`;
  }
  if (unit === "pack" || unit === "packs") {
    return `${quantity} pack${quantity > 1 ? "s" : ""}`;
  }
  if (unit === "carton" || unit === "cartons") {
    return `${quantity} carton${quantity > 1 ? "s" : ""}`;
  }
  return `${quantity} ${unit}`;
};

const LOCATION_ICONS: Record<string, React.ElementType> = {
  shelf: Tray,
  door: Door,
  drawer: LucideSnowflake,
  freezer: Snowflake,
};

const LOCATION_LABELS: Record<string, string> = {
  shelf: "Shelf",
  door: "Door",
  drawer: "Drawer",
  freezer: "Freezer",
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  dairy: { bg: "bg-amber-100", text: "text-amber-700" },
  meat: { bg: "bg-red-100", text: "text-red-700" },
  vegetables: { bg: "bg-green-100", text: "text-green-700" },
  fruits: { bg: "bg-orange-100", text: "text-orange-700" },
  beverages: { bg: "bg-sky-100", text: "text-sky-700" },
  condiments: { bg: "bg-yellow-100", text: "text-yellow-700" },
  leftovers: { bg: "bg-purple-100", text: "text-purple-700" },
  seafood: { bg: "bg-cyan-100", text: "text-cyan-700" },
  poultry: { bg: "bg-rose-100", text: "text-rose-700" },
  bakery: { bg: "bg-amber-100", text: "text-amber-700" },
  frozen: { bg: "bg-sky-100", text: "text-sky-700" },
  snacks: { bg: "bg-pink-100", text: "text-pink-700" },
  default: { bg: "bg-gray-100", text: "text-gray-700" },
};

const getCategoryColor = (category?: string) => {
  if (!category) return CATEGORY_COLORS.default;
  const lower = category.toLowerCase();
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return CATEGORY_COLORS.default;
};

const LoadingState: React.FC = () => {
  const [steps, setSteps] = useState<LoadingStep[]>([
    {
      type: "open",
      status: "pending",
      message: "Opening fridge door",
    },
    {
      type: "examine",
      status: "pending",
      message: "Examining shelf contents",
    },
    {
      type: "capture",
      status: "pending",
      message: "Capturing item images",
    },
    {
      type: "identify",
      status: "pending",
      message: "Identifying food items",
    },
    {
      type: "classify",
      status: "pending",
      message: "Classifying by category",
    },
    {
      type: "compile",
      status: "pending",
      message: "Compiling inventory",
    },
  ]);
  const stepRefs = useRef<number[]>([]);
  const stepElementRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stepRefs.current.forEach((id) => window.clearTimeout(id));
    stepRefs.current = [];

    setSteps((prev) => prev.map((s) => ({ ...s, status: "pending" as const })));

    let currentIndex = 0;

    const tick = () => {
      setSteps((prev) => {
        const newSteps = [...prev];
        if (currentIndex < newSteps.length) {
          if (currentIndex > 0) {
            newSteps[currentIndex - 1] = {
              ...newSteps[currentIndex - 1],
              status: "complete",
            };
          }
          newSteps[currentIndex] = {
            ...newSteps[currentIndex],
            status: "active",
          };
        }
        return newSteps;
      });

      setTimeout(() => {
        const activeStep = stepElementRefs.current[currentIndex];
        if (activeStep) {
          activeStep.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 50);

      if (currentIndex < steps.length - 1) {
        currentIndex++;
        const timeoutId = window.setTimeout(tick, 500);
        stepRefs.current.push(timeoutId);
      } else {
        setSteps((prev) =>
          prev.map((s, i) =>
            i === prev.length - 1 ? { ...s, status: "complete" } : s,
          ),
        );
      }
    };

    const initialTimeout = window.setTimeout(tick, 300);
    stepRefs.current.push(initialTimeout);

    return () => {
      stepRefs.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const completedSteps = steps.filter((s) => s.status === "complete").length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <Card className="border-primary/30 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
        <CardTitle className="flex items-center gap-3 text-base">
          <MagnifyingGlass className="h-5 w-5 text-primary" />
          <span>Scanning Your Fridge</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div ref={stepsContainerRef} className="space-y-2 pb-4">
          {steps.map((step, index) => (
            <div
              key={step.type}
              ref={(el) => {
                stepElementRefs.current[index] = el;
              }}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all scroll-mt-4 ${
                step.status === "complete"
                  ? "border-green-200 bg-green-50/50"
                  : step.status === "active"
                    ? "border-primary/30 bg-primary/5"
                    : "border-muted/50 bg-muted/20"
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0 ${
                  step.status === "complete"
                    ? "bg-green-100 text-green-600"
                    : step.status === "active"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step.status === "complete" ? (
                  <CheckCircle className="h-4 w-4" weight="fill" />
                ) : step.status === "active" ? (
                  <Activity className="h-4 w-4 animate-pulse" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm capitalize">{step.message}</p>
              </div>
              {step.status === "active" && (
                <div className="w-12 flex-shrink-0">
                  <Progress value={100} className="h-1 animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-2xl blur-xl opacity-50" />
          <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-muted/30 p-4">
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <CookingPot
                  className="h-14 w-14 text-primary/40 animate-pulse"
                  weight="fill"
                />
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-1">
                  <div
                    className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-pulse"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-1 h-3 bg-muted-foreground/50 rounded-full animate-pulse"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-pulse"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Scanning progress
                  </span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className="flex gap-1">
            {[0, 150, 300].map((delay) => (
              <div
                key={delay}
                className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground animate-pulse">
            Identifying your ingredients...
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const ErrorState: React.FC<{ error: string; onRetry?: () => void }> = ({
  error,
  onRetry,
}) => (
  <Card className="border-red-500/50 bg-red-50 dark:bg-red-950/20">
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400 text-base">
        <XCircle className="h-5 w-5" weight="fill" />
        Analysis Failed
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <ArrowCounterClockwise className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </CardContent>
  </Card>
);

const EmptyState: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-base">
        <Warning className="h-5 w-5" weight="fill" />
        No Items Detected
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <p className="text-sm text-amber-700 dark:text-amber-300">
        Try another angle, open the fridge wider, or improve lighting and scan
        again.
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-2 border-amber-200 text-amber-600 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/30"
        >
          <ArrowCounterClockwise className="h-4 w-4" />
          Retry Scan
        </Button>
      )}
    </CardContent>
  </Card>
);

const IngredientCard: React.FC<{
  name: string;
  quantity: number;
  unit: string;
  location: string;
  confidence: number;
  category?: string;
}> = ({ name, quantity, unit, location, confidence, category }) => {
  const Icon = getIngredientIcon(name);
  const colors = getCategoryColor(category);
  const LocationIcon = LOCATION_ICONS[location] || Tray;

  return (
    <Card
      className={`${colors.bg.split("-")[0]}-50 border ${colors.bg.split("-")[0]}-200`}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg} flex-shrink-0`}
          >
            <Icon className={`h-5 w-5 ${colors.text}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium text-sm truncate">{name}</h3>
              </div>
              <Badge
                variant="outline"
                className={`${colors.bg} ${colors.text} border-0 text-xs flex-shrink-0`}
              >
                {getQuantityLabel(quantity, unit)}
              </Badge>
            </div>

            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <LocationIcon className="h-3 w-3" />
                <span>{LOCATION_LABELS[location] || location}</span>
              </div>

              <div className="flex items-center gap-1">
                <div
                  className={`h-1 w-10 rounded-full overflow-hidden ${
                    confidence >= 0.8
                      ? "bg-green-200"
                      : confidence >= 0.5
                        ? "bg-amber-200"
                        : "bg-red-200"
                  }`}
                >
                  <div
                    className={`h-full rounded-full ${
                      confidence >= 0.8
                        ? "bg-green-500"
                        : confidence >= 0.5
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    confidence >= 0.8
                      ? "text-green-600"
                      : confidence >= 0.5
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const FridgeResult: React.FC<FridgeResultProps> = ({
  result,
  isLoading,
  error,
  onRetry,
}) => {
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && result.items.length > 0) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [result]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (!result) {
    return null;
  }

  if (result.items.length === 0) {
    return <EmptyState onRetry={onRetry} />;
  }

  const itemsByCategory = result.items.reduce<
    Record<string, typeof result.items>
  >((acc, item) => {
    const cat = item.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categoryOrder = [
    "dairy",
    "meat",
    "vegetables",
    "fruits",
    "beverages",
    "condiments",
    "leftovers",
    "seafood",
    "poultry",
    "bakery",
    "frozen",
    "snacks",
  ];

  const sortedCategories = Object.keys(itemsByCategory).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.toLowerCase());
    const bIndex = categoryOrder.indexOf(b.toLowerCase());
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <div ref={resultsRef} className="space-y-6">
      <Card className="border-green-500/20 bg-gradient-to-br from-green-50/30 to-green-50/10 dark:from-green-950/20 dark:to-green-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
            </div>
            <div>
              <span className="text-base">Inventory Complete</span>
              <p className="text-sm font-normal text-muted-foreground">
                Found {result.items.length} items in your fridge
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap gap-3">
        {result.items.map((item, index) => (
          <IngredientCard
            key={`${item.name}-${index}`}
            name={item.name}
            quantity={item.quantity}
            unit={item.unit}
            location={item.location}
            confidence={item.confidence}
            category={item.category}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Tray className="h-3 w-3" />
          <span>Shelf</span>
        </div>
        <div className="flex items-center gap-1">
          <Door className="h-3 w-3" />
          <span>Door</span>
        </div>
        <div className="flex items-center gap-1">
          <LucideSnowflake className="h-3 w-3" />
          <span>Drawer</span>
        </div>
        <div className="flex items-center gap-1">
          <Snowflake className="h-3 w-3" />
          <span>Freezer</span>
        </div>
      </div>
    </div>
  );
};
