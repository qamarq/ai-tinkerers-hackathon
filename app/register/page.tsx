"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { RegistrationFlow } from "@/features/auth";
import type { AccountType } from "@/features/live-cooking/types/cooking";

export default function RegisterPage() {
  const router = useRouter();

  const handleRegistrationComplete = (data: { accountType: AccountType }) => {
    console.log("Registration data:", data);
    toast.success("Welcome to Gotownik!");
    router.push("/fridge");
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 to-background">
      <RegistrationFlow
        onComplete={handleRegistrationComplete}
        onCancel={handleCancel}
      />
    </div>
  );
}
