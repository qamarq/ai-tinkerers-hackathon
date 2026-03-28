"use client";

import {
  CheckCircle2,
  ChefHat,
  Clock,
  Flame,
  Pause,
  Play,
  SkipForward,
  Thermometer,
  Users,
  Utensils,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  formatDuration,
  formatTemperature,
  getDifficultyBgColor,
  getDifficultyColor,
} from "@/features/live-cooking/lib";
import type {
  CookingSession,
  CookingStep,
  Recipe,
} from "@/features/live-cooking/types/cooking";

interface CookingDashboardProps {
  activeSessions?: CookingSession[];
  recipes?: Recipe[];
  statistics?: {
    totalMeals: number;
    totalCookingTime: number;
    activeCooks: number;
  };
}

export function CookingDashboard({
  activeSessions = [],
  recipes = [],
  statistics,
}: CookingDashboardProps) {
  const t = useTranslations("liveCooking");
  const td = useTranslations("dashboard");

  const stats = statistics || {
    totalMeals: 12,
    totalCookingTime: 480,
    activeCooks: activeSessions.length,
  };

  void recipes;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {td("todaysMeals")}
            </CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMeals}</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {td("activeCooks")}
            </CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCooks}</div>
            <p className="text-xs text-muted-foreground">Currently cooking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {td("mealHistory")}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(stats.totalCookingTime)}
            </div>
            <p className="text-xs text-muted-foreground">Total cooking time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{td("recentActivity")}</CardTitle>
            <CardDescription>{td("noActivity")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeSessions.length > 0 ? (
              activeSessions.map((session) => (
                <div key={session.id} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <ChefHat className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.recipe.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.status}
                    </p>
                  </div>
                  <Badge variant="outline">{session.recipe.difficulty}</Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{td("noActivity")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{td("quickActions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                      <Play className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="text-sm font-medium">{t("startCooking")}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
                      <Pause className="h-6 w-6 text-yellow-500" />
                    </div>
                    <p className="text-sm font-medium">{t("pauseCooking")}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                      <SkipForward className="h-6 w-6 text-blue-500" />
                    </div>
                    <p className="text-sm font-medium">{t("nextStep")}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">
                      {t("cookingComplete")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const t = useTranslations("liveCooking");

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <ChefHat className="h-16 w-16 text-primary/50" />
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{recipe.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {recipe.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className={getDifficultyBgColor(recipe.difficulty)}
          >
            <span className={getDifficultyColor(recipe.difficulty)}>
              {recipe.difficulty}
            </span>
          </Badge>
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            {formatDuration(recipe.totalTime)}
          </Badge>
          <Badge variant="outline">
            <Users className="h-3 w-3 mr-1" />
            {recipe.servings}
          </Badge>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t("prepTime")}:</span>
            <span>{formatDuration(recipe.prepTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t("cookTime")}:</span>
            <span>{formatDuration(recipe.cookTime)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CookingStepCardProps {
  step: CookingStep;
  stepNumber: number;
  totalSteps: number;
  isActive?: boolean;
  isCompleted?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
}

export function CookingStepCard({
  step,
  stepNumber,
  totalSteps,
  isActive = false,
  isCompleted = false,
}: CookingStepCardProps) {
  const t = useTranslations("liveCooking");

  return (
    <Card className={isActive ? "ring-2 ring-primary" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
              isCompleted
                ? "bg-green-500 text-white"
                : isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : stepNumber}
          </div>
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{step.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("stepOf", { current: stepNumber, total: totalSteps })}
            </p>
          </div>
          {step.temperature && (
            <Badge variant="outline" className="gap-1">
              <Thermometer className="h-3 w-3" />
              {formatTemperature(step.temperature.value, step.temperature.unit)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{step.description}</p>

        {step.duration && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t("duration")}:</span>
            <span>{formatDuration(step.duration)}</span>
          </div>
        )}

        {step.ingredients && step.ingredients.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t("ingredients")}</h4>
            <ul className="text-sm space-y-1">
              {step.ingredients.map((ingredient) => (
                <li key={ingredient.id} className="flex items-center gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    {ingredient.amount} {ingredient.unit} {ingredient.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step.equipment && step.equipment.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t("equipment")}</h4>
            <div className="flex flex-wrap gap-2">
              {step.equipment.map((item) => (
                <Badge key={item} variant="secondary">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {step.notes && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm italic text-muted-foreground">{step.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ActiveCookingCardProps {
  session: CookingSession;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onNextStep?: () => void;
}

export function ActiveCookingCard({
  session,
  onPause,
  onResume,
  onStop,
  onNextStep,
}: ActiveCookingCardProps) {
  const t = useTranslations("liveCooking");
  const currentStep = session.recipe.steps[session.currentStepIndex];
  const progress =
    ((session.currentStepIndex + 1) / session.recipe.steps.length) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>{t("cookingInProgress")}</CardTitle>
            <CardDescription>{session.recipe.name}</CardDescription>
          </div>
          <Badge
            variant={
              session.status === "cooking"
                ? "default"
                : session.status === "paused"
                  ? "secondary"
                  : "outline"
            }
          >
            {session.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t("currentStep")}</span>
            <span>
              {t("stepOf", {
                current: session.currentStepIndex + 1,
                total: session.recipe.steps.length,
              })}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {currentStep && (
          <div className="rounded-lg border p-4 space-y-2">
            <h4 className="font-medium">{currentStep.title}</h4>
            <p className="text-sm text-muted-foreground">
              {currentStep.description}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {session.status === "cooking" ? (
            <Button variant="secondary" onClick={onPause} className="flex-1">
              <Pause className="h-4 w-4 mr-2" />
              {t("pauseCooking")}
            </Button>
          ) : (
            <Button variant="secondary" onClick={onResume} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              {t("resumeCooking")}
            </Button>
          )}
          <Button variant="outline" onClick={onNextStep} className="flex-1">
            <SkipForward className="h-4 w-4 mr-2" />
            {t("nextStep")}
          </Button>
          <Button variant="destructive" onClick={onStop}>
            {t("stopCooking")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
