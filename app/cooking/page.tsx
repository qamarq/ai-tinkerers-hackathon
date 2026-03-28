"use client";

import { useState } from "react";
import { Provider } from "jotai";

import { CookingFinish } from "@/features/cooking/components/CookingFinish";
import { CookingSession } from "@/features/cooking/components/CookingSession";
import { CookingSetup } from "@/features/cooking/components/CookingSetup";

type View = "setup" | "session" | "finish";

interface SessionState {
  cameraId: string;
  micId: string;
}

export default function CookingPage() {
  const [view, setView] = useState<View>("setup");
  const [session, setSession] = useState<SessionState>({
    cameraId: "",
    micId: "",
  });

  const handleStart = (cameraId: string, micId: string) => {
    setSession({ cameraId, micId });
    setView("session");
  };

  const handleEnd = () => {
    setView("setup");
  };

  const handleSessionEnd = () => {
    setView("finish");
  };

  const handleRestart = () => {
    setView("setup");
  };

  return (
    <Provider>
      {view === "setup" ? (
        <CookingSetup onStart={handleStart} />
      ) : view === "session" ? (
        <CookingSession
          cameraId={session.cameraId}
          micId={session.micId}
          onEnd={handleEnd}
          onSessionEnd={handleSessionEnd}
        />
      ) : (
        <CookingFinish onRestart={handleRestart} />
      )}
    </Provider>
  );
}
