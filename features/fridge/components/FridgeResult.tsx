"use client";

import React from "react";
import { FileCode, Spinner } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
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
}

export const FridgeResult: React.FC<FridgeResultProps> = ({
  result,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Spinner className="h-5 w-5 animate-spin text-primary" />
            Analyzing your fridge photo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Analysis failed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  if (result.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No obvious items detected</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Try another angle, open the fridge wider, or improve lighting and
            scan again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Detected Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((item, index) => (
                <TableRow key={`${item.name}-${index}`}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    {item.category && (
                      <div className="text-xs text-muted-foreground">
                        {item.category}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.location}</Badge>
                  </TableCell>
                  <TableCell>{(item.confidence * 100).toFixed(0)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Raw JSON
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs font-mono">
            {JSON.stringify(result, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground border-t pt-4">
        <p>Analyzed at: {new Date(result.meta.analyzedAt).toLocaleString()}</p>
        {result.meta.notes && (
          <p className="mt-1 italic">{result.meta.notes}</p>
        )}
      </div>
    </div>
  );
};
