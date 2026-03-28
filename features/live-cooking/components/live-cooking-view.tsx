"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChefHat,
  Pause,
  Play,
  SkipForward,
  Timer,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn, formatDuration } from "@/features/live-cooking/lib";
import type { CookingSession } from "@/features/live-cooking/types/cooking";

interface LiveCookingViewProps {
  session: CookingSession;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onNextStep?: () => void;
  onPreviousStep?: () => void;
}

export function LiveCookingView({
  session,
  onPause,
  onResume,
  onStop,
  onNextStep,
  onPreviousStep,
}: LiveCookingViewProps) {
  const currentStep = session.recipe.steps[session.currentStepIndex];
  const progress =
    ((session.currentStepIndex + 1) / session.recipe.steps.length) * 100;
  const isFirstStep = session.currentStepIndex === 0;
  const isLastStep =
    session.currentStepIndex === session.recipe.steps.length - 1;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {session.recipe.name}
          </h1>
          <p className="text-muted-foreground">Cooking in Progress</p>
        </div>
        <Badge
          variant={
            session.status === "cooking"
              ? "default"
              : session.status === "paused"
                ? "secondary"
                : session.status === "completed"
                  ? "default"
                  : "destructive"
          }
          className="text-lg px-4 py-2"
        >
          {session.status === "cooking" && <Timer className="h-4 w-4 mr-2" />}
          {session.status}
        </Badge>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold",
                  session.status === "cooking"
                    ? "bg-primary text-primary-foreground"
                    : session.status === "paused"
                      ? "bg-yellow-500 text-white"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {session.currentStepIndex + 1}/{session.recipe.steps.length}
              </div>
              <div>
                <p className="font-medium">Current Step</p>
                <p className="text-sm text-muted-foreground">
                  Step {session.currentStepIndex + 1} of{" "}
                  {session.recipe.steps.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{Math.round(progress)}%</p>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {currentStep && (
            <Card className="ring-2 ring-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{currentStep.title}</CardTitle>
                  <div className="flex gap-2">
                    {currentStep.temperature && (
                      <Badge variant="outline" className="text-sm">
                        🌡️ {formatDuration(currentStep.temperature.value)}°
                      </Badge>
                    )}
                    {currentStep.duration && (
                      <Badge variant="outline" className="text-sm">
                        ⏱️ {formatDuration(currentStep.duration)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-base leading-relaxed">
                  {currentStep.description}
                </p>

                {currentStep.ingredients &&
                  currentStep.ingredients.length > 0 && (
                    <div className="rounded-lg bg-muted/50 p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <ChefHat className="h-4 w-4" />
                        Ingredients (Current Step)
                      </h4>
                      <ul className="space-y-1">
                        {currentStep.ingredients.map((ing) => (
                          <li
                            key={ing.id}
                            className="text-sm flex items-center gap-2"
                          >
                            <span className="text-primary">•</span>
                            <span className="font-medium">
                              {ing.amount} {ing.unit}
                            </span>
                            <span>{ing.name}</span>
                            {ing.notes && (
                              <span className="text-muted-foreground">
                                ({ing.notes})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {currentStep.equipment && currentStep.equipment.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <ChefHat className="h-4 w-4" />
                      Equipment
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentStep.equipment.map((item) => (
                        <Badge key={item} variant="secondary">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep.notes && (
                  <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <p className="text-sm">{currentStep.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={onPreviousStep}
              disabled={isFirstStep}
            >
              Previous Step
            </Button>
            {isLastStep ? (
              <Button variant="default" size="lg" onClick={onStop}>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Cooking Complete!
              </Button>
            ) : (
              <Button variant="default" size="lg" onClick={onNextStep}>
                Next Step
                <SkipForward className="h-5 w-5 ml-2" />
              </Button>
            )}
          </div>

          <div className="flex justify-center gap-2">
            <Button
              variant={session.status === "cooking" ? "secondary" : "default"}
              onClick={session.status === "cooking" ? onPause : onResume}
            >
              {session.status === "cooking" ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
            <Button variant="destructive" onClick={onStop}>
              <XCircle className="h-4 w-4 mr-2" />
              Stop Cooking
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {session.recipe.steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                    index === session.currentStepIndex
                      ? "bg-primary/10 border border-primary"
                      : index < session.currentStepIndex
                        ? "bg-green-500/5"
                        : "hover:bg-muted/50",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0",
                      index < session.currentStepIndex
                        ? "bg-green-500 text-white"
                        : index === session.currentStepIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {index < session.currentStepIndex ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm",
                        index < session.currentStepIndex
                          ? "line-through text-muted-foreground"
                          : "",
                      )}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {session.recipe.ingredients.map((ing) => (
                  <li
                    key={ing.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {ing.amount} {ing.unit} {ing.name}
                    </span>
                    {ing.isOptional && (
                      <Badge variant="outline" className="text-xs">
                        Optional
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Remaining Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-bold">
                  {formatDuration(
                    Math.max(
                      0,
                      (session.recipe.steps.length -
                        session.currentStepIndex -
                        1) *
                        10,
                    ),
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Estimated based on remaining steps
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
