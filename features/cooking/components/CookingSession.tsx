"use client";

import { useEffect, useState } from "react";

import { useCookingSession } from "../hooks/useCookingSession";
import { DraggableWindow } from "./DraggableWindow";
import { IngredientsWindow } from "./windows/IngredientsWindow";
import { StepsWindow } from "./windows/StepsWindow";
import { TimerWindow } from "./windows/TimerWindow";
import { TranscriptWindow } from "./windows/TranscriptWindow";

interface CookingSessionProps {
  cameraId: string;
  micId: string;
  onEnd: () => void;
  onSessionEnd: () => void;
}

export function CookingSession({
  cameraId,
  micId,
  onEnd,
  onSessionEnd,
}: CookingSessionProps) {
  const {
    videoRef,
    connectionState,
    messages,
    isProcessing,
    connect,
    disconnect,
  } = useCookingSession({ cameraId, micId, onSessionEnd });

  const [nextZ, setNextZ] = useState(20);
  const [zIndexes, setZIndexes] = useState({
    ingredients: 11,
    steps: 11,
    timer: 11,
    transcript: 11,
  });

  const bringToFront = (id: keyof typeof zIndexes) => {
    setNextZ((z) => {
      const next = z + 1;
      setZIndexes((prev) => ({ ...prev, [id]: next }));
      return next;
    });
  };

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnd = () => {
    disconnect();
    onEnd();
  };

  const statusLabel = {
    connecting: "Connecting to Chef AI...",
    connected: "Chef AI Active",
    disconnected: "Disconnected",
    error: "Connection Error",
  }[connectionState];

  const statusDot = {
    connecting: "bg-yellow-400 animate-pulse",
    connected: "bg-green-400 animate-pulse",
    disconnected: "bg-gray-500",
    error: "bg-red-500",
  }[connectionState];

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none">
      {/* Live camera feed */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Subtle dark vignette overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/30 pointer-events-none" />

      {/* Top status bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2 shadow-xl">
        <div className={`w-2 h-2 rounded-full shrink-0 ${statusDot}`} />
        <span className="text-white/80 text-sm font-medium">{statusLabel}</span>
        {isProcessing && connectionState === "connected" && (
          <span className="text-orange-400/90 text-xs animate-pulse ml-1">
            ✦ thinking...
          </span>
        )}
      </div>

      {/* End button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={handleEnd}
          className="bg-red-500/70 hover:bg-red-500/90 active:bg-red-600 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium border border-red-400/20 transition-all duration-150 shadow-lg"
        >
          ✕ End
        </button>
      </div>

      {/* AR Draggable Windows */}
      {/* Ingredients - Top Left */}
      <DraggableWindow
        title="🥗 Ingredients"
        initialX={20}
        initialY={60}
        initialWidth={270}
        initialHeight={360}
        zIndex={zIndexes.ingredients}
        onFocus={() => bringToFront("ingredients")}
      >
        <IngredientsWindow />
      </DraggableWindow>

      {/* Steps - Bottom Right */}
      <DraggableWindow
        title="📋 Cooking Steps"
        initialX={
          typeof window !== "undefined" ? window.innerWidth - 330 : 1000
        }
        initialY={
          typeof window !== "undefined" ? window.innerHeight - 500 : 400
        }
        initialWidth={310}
        initialHeight={460}
        zIndex={zIndexes.steps}
        onFocus={() => bringToFront("steps")}
      >
        <StepsWindow />
      </DraggableWindow>

      {/* Timer - Top Right */}
      <DraggableWindow
        title="⏱️ Timer"
        initialX={
          typeof window !== "undefined" ? window.innerWidth - 270 : 1000
        }
        initialY={60}
        initialWidth={250}
        initialHeight={210}
        minHeight={120}
        zIndex={zIndexes.timer}
        onFocus={() => bringToFront("timer")}
      >
        <TimerWindow />
      </DraggableWindow>

      {/* Chat - Bottom Left */}
      <DraggableWindow
        title="💬 Chat with Chef AI"
        initialX={20}
        initialY={
          typeof window !== "undefined" ? window.innerHeight - 380 : 400
        }
        initialWidth={350}
        initialHeight={320}
        zIndex={zIndexes.transcript}
        onFocus={() => bringToFront("transcript")}
      >
        <TranscriptWindow messages={messages} isProcessing={isProcessing} />
      </DraggableWindow>
    </div>
  );
}
