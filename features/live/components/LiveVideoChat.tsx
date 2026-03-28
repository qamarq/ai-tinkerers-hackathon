"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { useGeminiLive } from "../hooks/useGeminiLive";
import type { LiveChatMessage } from "../types/live";

export function LiveVideoChat() {
  const {
    videoRef,
    connectionState,
    messages,
    isProcessing,
    connect,
    disconnect,
  } = useGeminiLive();

  const handleConnect = () => {
    if (connectionState === "connected") {
      disconnect();
    } else {
      connect();
    }
  };

  const getStatusColor = () => {
    switch (connectionState) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case "connected":
        return "Połączono";
      case "connecting":
        return "Łączenie...";
      case "error":
        return "Błąd połączenia";
      default:
        return "Rozłączono";
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Video Full Screen */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Overlay when disconnected */}
        {connectionState === "disconnected" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center space-y-6">
              <Link
                href="/"
                className="inline-block mb-8 text-white/80 hover:text-white transition-colors text-lg"
              >
                ← Gotownik.love
              </Link>
              <h1 className="text-4xl font-bold text-white">
                Live AI Video Chat
              </h1>
              <p className="text-xl text-gray-300">
                Rozmawiaj naturalnie z AI - widzi Cię i słyszy
              </p>
              <Button
                onClick={handleConnect}
                size="lg"
                className="text-lg px-8 py-6"
              >
                🎥 Rozpocznij rozmowę
              </Button>
            </div>
          </div>
        )}

        {/* Status indicators */}
        {connectionState === "connected" && (
          <>
            {/* Top bar with status and controls */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-linear-to-b from-black/60 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link
                    href="/"
                    className="text-white/80 hover:text-white transition-colors flex items-center gap-1"
                  >
                    ← Gotownik.love
                  </Link>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
                  <span className="text-white font-medium">
                    {getStatusText()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleConnect}
                    variant="destructive"
                    size="lg"
                  >
                    Rozłącz
                  </Button>
                </div>
              </div>
            </div>

            {/* Processing indicator */}
            {isProcessing && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  AI myśli...
                </div>
              </div>
            )}

            {/* Listening indicator */}
            {isProcessing && (
              <div className="absolute top-20 right-4 bg-red-600 text-white px-4 py-3 rounded-full text-sm shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  Słucham...
                </div>
              </div>
            )}
          </>
        )}

        {/* AR-style floating conversation bubbles - side panel */}
        {connectionState === "connected" && messages.length > 0 && (
          <div className="absolute right-0 top-0 bottom-0 w-96 p-4 flex flex-col justify-end pointer-events-none">
            <div className="space-y-3 pointer-events-auto">
              {messages
                .slice(-5)
                .map((message: LiveChatMessage, index: number) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    } animate-in slide-in-from-right duration-300`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-black/70 text-white border border-white/20"
                          : "bg-black/60 text-white border border-white/10"
                      } shadow-2xl backdrop-blur-xl`}
                    >
                      <p className="text-xs font-semibold mb-1 opacity-70 uppercase tracking-wide">
                        {message.role === "user" ? "👤 Ty" : "🤖 AI"}
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Help hint */}
        {connectionState === "connected" && messages.length === 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <div className="bg-white/10 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-xl">
              <p className="text-lg font-medium mb-2">
                🎤 Po prostu zacznij mówić
              </p>
              <p className="text-sm text-gray-300">
                Pytaj o wszystko - widzę Cię i słyszę 👁️
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
