"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/fridge");
  }, [router]);

  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 to-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">
          <p className="text-lg text-muted-foreground">
            Setting up your account...
          </p>
        </div>
      </div>
    </div>
  );
}
