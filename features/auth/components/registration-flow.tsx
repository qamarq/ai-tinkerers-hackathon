"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, ChefHat, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/features/live-cooking/lib";
import type { AccountType } from "@/features/live-cooking/types/cooking";

interface RegistrationFlowProps {
  onComplete?: (data: { accountType: AccountType }) => void;
  onCancel?: () => void;
}

const ACCOUNT_TYPES: {
  type: AccountType;
  icon: typeof Home;
  label: string;
  description: string;
}[] = [
  {
    type: "personal",
    icon: Home,
    label: "Personal",
    description: "Home cooking for you and your family",
  },
  {
    type: "professional",
    icon: Building2,
    label: "Professional",
    description: "For chefs and food businesses",
  },
];

export function RegistrationFlow({
  onComplete,
  onCancel,
}: RegistrationFlowProps) {
  const [selectedType, setSelectedType] = useState<AccountType>("personal");

  void onCancel;

  const handleGetStarted = () => {
    onComplete?.({ accountType: selectedType });
  };

  const handleSkip = () => {
    onComplete?.({ accountType: "personal" });
  };

  return (
    <div className="container mx-auto py-16 max-w-xl">
      <div className="text-center mb-12 space-y-4">
        <Link href="/" className="inline-block">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full hover:bg-primary/20 transition-colors">
              <ChefHat className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mt-4">Gotownik</h1>
        </Link>
        <p className="text-muted-foreground text-lg">
          Your AI-powered cooking assistant
        </p>
      </div>

      <div className="space-y-6">
        <p className="text-center text-sm text-muted-foreground">
          How will you be using Gotownik?
        </p>

        <div className="grid grid-cols-2 gap-4">
          {ACCOUNT_TYPES.map(({ type, icon: Icon, label, description }) => (
            <Card
              key={type}
              className={cn(
                "cursor-pointer transition-all hover:scale-105",
                selectedType === type &&
                  "border-primary ring-2 ring-primary bg-primary/5",
              )}
              onClick={() => setSelectedType(type)}
            >
              <CardContent className="pt-8 pb-8 flex flex-col items-center gap-3">
                <Icon className="h-10 w-10" />
                <div className="text-center">
                  <p className="font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="w-full text-lg py-6"
          >
            <ChefHat className="h-5 w-5 mr-2" />
            Get Started
          </Button>
          <Button
            variant="ghost"
            onClick={handleSkip}
            size="lg"
            className="w-full"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}
