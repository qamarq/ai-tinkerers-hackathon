"use client";

import { useEffect, useRef } from "react";

import type { LiveChatMessage } from "@/features/live/types/live";

interface TranscriptWindowProps {
  messages: LiveChatMessage[];
  isProcessing: boolean;
}

export function TranscriptWindow({
  messages,
  isProcessing,
}: TranscriptWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-white/30 text-sm text-center">
          Start speaking to see transcription...
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[90%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
              msg.role === "user"
                ? "bg-blue-500/25 border border-blue-400/20 text-blue-100"
                : "bg-white/8 border border-white/10 text-white/85"
            }`}
          >
            <span className="opacity-50 uppercase tracking-wide text-[10px] font-semibold block mb-0.5">
              {msg.role === "user" ? "You" : "Chef AI"}
            </span>
            {msg.content}
          </div>
        </div>
      ))}
      {isProcessing && (
        <div className="flex gap-2 justify-start">
          <div className="bg-white/8 border border-white/10 px-3 py-2 rounded-xl">
            <div className="flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-100" />
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
