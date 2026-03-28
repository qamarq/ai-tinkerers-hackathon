"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CookingPot } from "@phosphor-icons/react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle,
  Sparkle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FridgeInventory } from "@/lib/trpc/routers/fridge";

import { useFridgeParser } from "../hooks/useFridgeParser";
import { fileToDataUrl } from "../utils/fileToDataUrl";
import { FridgeCapture } from "./FridgeCapture";
import { FridgeResult } from "./FridgeResult";

const FRIDGE_INVENTORY_STORAGE_KEY = "fridge:lastInventory";

export const FridgePage: React.FC = () => {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<FridgeInventory | null>(
    null,
  );
  const { parseImage, isParsing, error, reset } = useFridgeParser();

  const handleImageCapture = useCallback(
    async (file: File) => {
      try {
        const dataUrl = await fileToDataUrl(file);
        setImagePreview(dataUrl);
        setParsedResult(null);

        reset();
        const result = await parseImage(dataUrl);
        setParsedResult(result);
      } catch (err) {
        console.error("Failed to process image:", err);
      }
    },
    [parseImage, reset],
  );

  const handleClearImage = useCallback(() => {
    setImagePreview(null);
    setParsedResult(null);
    window.localStorage.removeItem(FRIDGE_INVENTORY_STORAGE_KEY);
    reset();
  }, [reset]);

  const handleRetry = useCallback(() => {
    handleClearImage();
  }, [handleClearImage]);

  React.useEffect(() => {
    if (!parsedResult) {
      return;
    }

    window.localStorage.setItem(
      FRIDGE_INVENTORY_STORAGE_KEY,
      JSON.stringify(parsedResult),
    );
  }, [parsedResult]);

  const hasResults = parsedResult || isParsing || error;
  const itemCount = parsedResult?.items.length ?? 0;
  const canContinue = imagePreview && !isParsing;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Gotownik.love
          </Link>
          <div className="inline-flex items-center justify-center gap-2 bg-primary/10 rounded-full px-4 py-1.5">
            <CookingPot className="h-5 w-5 text-primary" weight="fill" />
            <span className="text-sm font-medium text-primary">
              Fridge Scanner
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            What&apos;s in your fridge?
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Take a photo or upload an image of your fridge contents. We&apos;ll
            identify items and help you find recipes.
          </p>
        </div>

        <Card className="border-primary/20 shadow-lg">
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <h2 className="font-semibold">Capture Image</h2>
              </div>
              <FridgeCapture
                onImageCapture={handleImageCapture}
                imagePreview={imagePreview}
                onClearImage={handleClearImage}
                disabled={isParsing}
              />
            </div>

            {imagePreview && (
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3 text-sm">
                {isParsing ? (
                  <>
                    <Sparkle className="h-4 w-4 animate-pulse text-primary" />
                    <span className="text-muted-foreground">
                      Analyzing your fridge photo...
                    </span>
                  </>
                ) : parsedResult ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>
                      Found <span className="font-semibold">{itemCount}</span>{" "}
                      item
                      {itemCount !== 1 ? "s" : ""}. Review results or retake the
                      photo.
                    </span>
                  </>
                ) : null}
              </div>
            )}

            {hasResults && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-semibold text-primary">
                      2
                    </span>
                  </div>
                  <h2 className="font-semibold">Results</h2>
                </div>
                <FridgeResult
                  result={parsedResult}
                  isLoading={isParsing}
                  error={error}
                  onRetry={handleRetry}
                />
              </div>
            )}

            {hasResults && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-semibold text-primary">
                      3
                    </span>
                  </div>
                  <h2 className="font-semibold">Continue</h2>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    className="flex-1 gap-2"
                    disabled={!canContinue}
                    onClick={() => router.push("/recipe-research")}
                    size="lg"
                  >
                    Find Recipes
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  {imagePreview && !isParsing && (
                    <Button
                      variant="outline"
                      onClick={handleClearImage}
                      size="lg"
                      className="gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Scan Again
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5" />
            <span>Camera or upload</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkle className="h-3.5 w-3.5" />
            <span>AI detection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowRight className="h-3.5 w-3.5" />
            <span>Get recipes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
