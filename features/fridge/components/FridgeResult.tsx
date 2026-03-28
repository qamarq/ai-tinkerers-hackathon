"use client";

import React from "react";
import {
  ArrowCounterClockwise,
  CircleNotch,
  MagnifyingGlass,
  Package,
  Warning,
  XCircle,
} from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FridgeInventory } from "@/lib/trpc/routers/fridge";

interface FridgeResultProps {
  result: FridgeInventory | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const FOOD_EMOJIS: Record<string, string> = {
  dairy: "🧀",
  meat: "🥩",
  vegetables: "🥬",
  fruits: "🍎",
  beverages: "🥤",
  condiments: "🧂",
  leftovers: "🍲",
  seafood: "🐟",
  poultry: "🍗",
  bakery: "🍞",
  frozen: "🧊",
  snacks: "🍿",
  default: "📦",
};

const getFoodEmoji = (category?: string): string => {
  if (!category) return FOOD_EMOJIS.default;
  const lower = category.toLowerCase();
  for (const [key, emoji] of Object.entries(FOOD_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return FOOD_EMOJIS.default;
};

export const FridgeResult: React.FC<FridgeResultProps> = ({
  result,
  isLoading,
  error,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-base">
            <CircleNotch className="h-5 w-5 animate-spin text-primary" />
            <span>Analyzing your fridge photo...</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
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
  }

  if (!result) {
    return null;
  }

  if (result.items.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-base">
            <Warning className="h-5 w-5" weight="fill" />
            No Items Detected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Try another angle, open the fridge wider, or improve lighting and
            scan again.
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
  }

  return (
    <div className="space-y-4">
      <Card className="border-green-500/20 bg-green-50/30 dark:bg-green-950/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package
              className="h-5 w-5 text-green-600 dark:text-green-400"
              weight="fill"
            />
            Detected Items ({result.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((item, index) => (
                <TableRow key={`${item.name}-${index}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getFoodEmoji(item.category)}
                      </span>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.category && (
                          <div className="text-xs text-muted-foreground capitalize">
                            {item.category}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {item.location}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-medium ${
                        item.confidence >= 0.8
                          ? "text-green-600 dark:text-green-400"
                          : item.confidence >= 0.5
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
