"use client";

import { useState } from "react";
import {
  Building2,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Flame,
  Home,
  Target,
  User,
  Users,
  Utensils,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/features/live-cooking/lib";
import type {
  AccountType,
  CookingDifficulty,
  KitchenType,
} from "@/features/live-cooking/types/cooking";

interface RegistrationFlowProps {
  onComplete?: (data: RegistrationData) => void;
  onCancel?: () => void;
}

export interface RegistrationData {
  step1: {
    accountType: AccountType;
    fullName: string;
    email: string;
    phone?: string;
  };
  step2: {
    kitchenName: string;
    kitchenType: KitchenType;
    equipment: string[];
  };
  step3: {
    experienceLevel: CookingDifficulty;
    cookingGoals: string[];
    dietaryPreferences: string[];
  };
}

const STEPS = [
  { id: 1, titleKey: "accountType", icon: User },
  { id: 2, titleKey: "kitchenSetup", icon: Utensils },
  { id: 3, titleKey: "cookingGoals", icon: Target },
  { id: 4, titleKey: "review", icon: ClipboardCheck },
];

const EXPERIENCE_LEVELS: CookingDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
  "professional",
];

const COOKING_GOALS = [
  "save_time",
  "eat_healthier",
  "meal_prep",
  "learn_skills",
  "impress_guests",
  "special_diet",
  "budget_cooking",
  "family_meals",
];

const DIETARY_PREFERENCES = [
  "none",
  "vegetarian",
  "vegan",
  "pescatarian",
  "gluten_free",
  "dairy_free",
  "nut_free",
  "halal",
  "kosher",
];

const EQUIPMENT_OPTIONS = [
  "Oven",
  "Stovetop",
  "Microwave",
  "Grill",
  "Air Fryer",
  "Slow Cooker",
  "Instant Pot",
  "Blender",
  "Food Processor",
  "Stand Mixer",
  "Rice Cooker",
  "Sous Vide",
];

export function RegistrationFlow({
  onComplete,
  onCancel,
}: RegistrationFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);

  void onCancel;
  const [formData, setFormData] = useState<RegistrationData>({
    step1: {
      accountType: "personal",
      fullName: "",
      email: "",
      phone: "",
    },
    step2: {
      kitchenName: "",
      kitchenType: "residential",
      equipment: [],
    },
    step3: {
      experienceLevel: "intermediate",
      cookingGoals: [],
      dietaryPreferences: [],
    },
  });

  const totalSteps = STEPS.length;
  const progress = (currentStep / totalSteps) * 100;

  const updateStep1 = (data: Partial<RegistrationData["step1"]>) => {
    setFormData((prev) => ({
      ...prev,
      step1: { ...prev.step1, ...data },
    }));
  };

  const updateStep2 = (data: Partial<RegistrationData["step2"]>) => {
    setFormData((prev) => ({
      ...prev,
      step2: { ...prev.step2, ...data },
    }));
  };

  const updateStep3 = (data: Partial<RegistrationData["step3"]>) => {
    setFormData((prev) => ({
      ...prev,
      step3: { ...prev.step3, ...data },
    }));
  };

  const toggleArrayValue = <T extends string>(
    array: T[],
    value: T,
    setter: (val: T[]) => void,
  ) => {
    if (array.includes(value)) {
      setter(array.filter((v) => v !== value));
    } else {
      setter([...array, value]);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.step1.accountType &&
          formData.step1.fullName &&
          formData.step1.email
        );
      case 2:
        return formData.step2.kitchenName;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Create Your Account
        </h1>
        <p className="text-muted-foreground">
          Join us to start automating your cooking
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCompleted
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted text-muted-foreground",
                    )}
                  >
                    {isCompleted ? (
                      <ChevronRight className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">
                    {step.titleKey === "accountType"
                      ? "Account Type"
                      : step.titleKey === "kitchenSetup"
                        ? "Kitchen Setup"
                        : step.titleKey === "cookingGoals"
                          ? "Cooking Goals"
                          : "Review"}
                  </span>
                </div>
                {step.id < totalSteps && (
                  <div
                    className={cn(
                      "h-0.5 w-8 sm:w-16 mx-1",
                      step.id < currentStep ? "bg-primary" : "bg-muted",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
        <Progress value={progress} className="h-2 mt-4" />
        <p className="text-sm text-muted-foreground text-center mt-2">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1
              ? "Account Type"
              : currentStep === 2
                ? "Kitchen Setup"
                : currentStep === 3
                  ? "Cooking Goals"
                  : "Review"}
          </CardTitle>
          <CardDescription>
            {currentStep === 4
              ? "Please review your information before creating your account"
              : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <StepOne data={formData.step1} onUpdate={updateStep1} />
          )}

          {currentStep === 2 && (
            <StepTwo
              data={formData.step2}
              onUpdate={updateStep2}
              toggleEquipment={(eq) =>
                toggleArrayValue(formData.step2.equipment, eq, (val) =>
                  updateStep2({ equipment: val }),
                )
              }
            />
          )}

          {currentStep === 3 && (
            <StepThree
              data={formData.step3}
              onUpdate={updateStep3}
              toggleGoal={(goal) =>
                toggleArrayValue(formData.step3.cookingGoals, goal, (val) =>
                  updateStep3({ cookingGoals: val }),
                )
              }
              toggleDietary={(pref) =>
                toggleArrayValue(
                  formData.step3.dietaryPreferences,
                  pref,
                  (val) => updateStep3({ dietaryPreferences: val }),
                )
              }
            />
          )}

          {currentStep === 4 && <ReviewStep data={formData} />}

          <div className="flex gap-4 pt-4">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1"
            >
              {currentStep === totalSteps ? (
                <>
                  Submit
                  <ChefHat className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StepOne({
  data,
  onUpdate,
}: {
  data: RegistrationData["step1"];
  onUpdate: (data: Partial<RegistrationData["step1"]>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Account Type</Label>
        <div className="grid grid-cols-2 gap-4">
          <Card
            className={cn(
              "cursor-pointer transition-colors",
              data.accountType === "personal" &&
                "border-primary ring-2 ring-primary",
            )}
            onClick={() => onUpdate({ accountType: "personal" })}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-2">
                <Home className="h-8 w-8" />
                <p className="font-medium">Personal</p>
                <p className="text-xs text-muted-foreground text-center">
                  For home cooking enthusiasts
                </p>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-colors",
              data.accountType === "professional" &&
                "border-primary ring-2 ring-primary",
            )}
            onClick={() => onUpdate({ accountType: "professional" })}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-2">
                <Building2 className="h-8 w-8" />
                <p className="font-medium">Professional</p>
                <p className="text-xs text-muted-foreground text-center">
                  For chefs and food businesses
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={data.fullName}
          onChange={(e) => onUpdate({ fullName: e.target.value })}
          placeholder="John Doe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => onUpdate({ email: e.target.value })}
          placeholder="john@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={data.phone}
          onChange={(e) => onUpdate({ phone: e.target.value })}
          placeholder="+1 (555) 000-0000"
        />
      </div>
    </div>
  );
}

function StepTwo({
  data,
  onUpdate,
  toggleEquipment,
}: {
  data: RegistrationData["step2"];
  onUpdate: (data: Partial<RegistrationData["step2"]>) => void;
  toggleEquipment: (eq: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="kitchenName">Kitchen Name</Label>
        <Input
          id="kitchenName"
          value={data.kitchenName}
          onChange={(e) => onUpdate({ kitchenName: e.target.value })}
          placeholder="My Home Kitchen"
        />
      </div>

      <div className="space-y-4">
        <Label>Kitchen Type</Label>
        <div className="grid grid-cols-2 gap-4">
          <Card
            className={cn(
              "cursor-pointer transition-colors",
              data.kitchenType === "residential" &&
                "border-primary ring-2 ring-primary",
            )}
            onClick={() => onUpdate({ kitchenType: "residential" })}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-2">
                <Home className="h-8 w-8" />
                <p className="font-medium">Residential</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-colors",
              data.kitchenType === "commercial" &&
                "border-primary ring-2 ring-primary",
            )}
            onClick={() => onUpdate({ kitchenType: "commercial" })}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-2">
                <Building2 className="h-8 w-8" />
                <p className="font-medium">Commercial</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <Label>Your Equipment</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {EQUIPMENT_OPTIONS.map((equipment) => (
            <Card
              key={equipment}
              className={cn(
                "cursor-pointer transition-colors",
                data.equipment.includes(equipment) &&
                  "border-primary ring-2 ring-primary bg-primary/5",
              )}
              onClick={() => toggleEquipment(equipment)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={data.equipment.includes(equipment)}
                    className="pointer-events-none"
                  />
                  <span className="text-sm">{equipment}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepThree({
  data,
  onUpdate,
  toggleGoal,
  toggleDietary,
}: {
  data: RegistrationData["step3"];
  onUpdate: (data: Partial<RegistrationData["step3"]>) => void;
  toggleGoal: (goal: string) => void;
  toggleDietary: (pref: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Cooking Experience Level</Label>
        <div className="grid grid-cols-2 gap-3">
          {EXPERIENCE_LEVELS.map((level) => (
            <Card
              key={level}
              className={cn(
                "cursor-pointer transition-colors",
                data.experienceLevel === level &&
                  "border-primary ring-2 ring-primary",
              )}
              onClick={() => onUpdate({ experienceLevel: level })}
            >
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  {level === "beginner" && (
                    <Clock className="h-5 w-5 text-green-500" />
                  )}
                  {level === "intermediate" && (
                    <Users className="h-5 w-5 text-yellow-500" />
                  )}
                  {level === "advanced" && (
                    <Flame className="h-5 w-5 text-orange-500" />
                  )}
                  {level === "professional" && (
                    <ChefHat className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm font-medium capitalize">
                    {level}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Cooking Goals</Label>
        <div className="grid grid-cols-2 gap-3">
          {COOKING_GOALS.map((goal) => (
            <Card
              key={goal}
              className={cn(
                "cursor-pointer transition-colors",
                data.cookingGoals.includes(goal) &&
                  "border-primary ring-2 ring-primary bg-primary/5",
              )}
              onClick={() => toggleGoal(goal)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={data.cookingGoals.includes(goal)}
                    className="pointer-events-none"
                  />
                  <span className="text-sm">{goal.replace("_", " ")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Dietary Preferences</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DIETARY_PREFERENCES.map((pref) => (
            <Card
              key={pref}
              className={cn(
                "cursor-pointer transition-colors",
                data.dietaryPreferences.includes(pref) &&
                  "border-primary ring-2 ring-primary bg-primary/5",
              )}
              onClick={() => toggleDietary(pref)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={data.dietaryPreferences.includes(pref)}
                    className="pointer-events-none"
                  />
                  <span className="text-sm capitalize">
                    {pref.replace("_", " ")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ data }: { data: RegistrationData }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Account Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <Badge>{data.step1.accountType}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span>{data.step1.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span>{data.step1.email}</span>
          </div>
          {data.step1.phone && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span>{data.step1.phone}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Kitchen Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Kitchen:</span>
            <span>{data.step2.kitchenName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <Badge>{data.step2.kitchenType}</Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Equipment:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {data.step2.equipment.map((eq) => (
                <Badge key={eq} variant="secondary">
                  {eq}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cooking Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Experience:</span>
            <Badge>{data.step3.experienceLevel}</Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Goals:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {data.step3.cookingGoals.map((goal) => (
                <Badge key={goal} variant="secondary">
                  {goal.replace("_", " ")}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Dietary:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {data.step3.dietaryPreferences.map((pref) => (
                <Badge key={pref} variant="secondary">
                  {pref.replace("_", " ")}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
