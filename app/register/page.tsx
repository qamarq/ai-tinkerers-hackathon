"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { RegistrationFlow, type RegistrationData } from "@/features/auth";

export default function RegisterPage() {
  const router = useRouter();

  const handleRegistrationComplete = (data: RegistrationData) => {
    console.log("Registration data:", data);
    toast.success("Account created successfully!");
    router.push("/live-cooking");
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
