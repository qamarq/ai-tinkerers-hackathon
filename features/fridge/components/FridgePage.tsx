"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { Camera } from "@phosphor-icons/react";

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

  React.useEffect(() => {
    if (!parsedResult) {
      return;
    }

    window.localStorage.setItem(
      FRIDGE_INVENTORY_STORAGE_KEY,
      JSON.stringify(parsedResult),
    );
  }, [parsedResult]);

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl">Fridge Scanner</CardTitle>
            <CardDescription>
              Take a photo of your fridge and we&apos;ll send it to an AI vision
              agent via tRPC.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">1. Capture Image</h2>
              <FridgeCapture
                onImageCapture={handleImageCapture}
                imagePreview={imagePreview}
                onClearImage={handleClearImage}
                disabled={isParsing}
              />
            </div>

            {imagePreview && (
              <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                {isParsing
                  ? "Running fridge analysis..."
                  : "Analysis complete. You can retake the photo to scan again."}
              </div>
            )}

            {(parsedResult || isParsing || error) && (
              <div className="border-t pt-8">
                <h2 className="text-lg font-semibold mb-4">2. Results</h2>
                <FridgeResult
                  result={parsedResult}
                  isLoading={isParsing}
                  error={error}
                />
              </div>
            )}

            {parsedResult && !isParsing && (
              <Link href="/recipe-research">
                <Button className="w-full">
                  Find Best Recipes From My Fridge
                </Button>
              </Link>
            )}

            {imagePreview && !isParsing && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleClearImage}
              >
                <Camera className="mr-2 h-4 w-4" />
                Scan Another Photo
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
