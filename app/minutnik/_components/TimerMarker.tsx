"use client";

import { ArrowCounterClockwise, Pause, Play, X } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

import type { Timer } from "./types";

interface TimerMarkerProps {
  timer: Timer;
  onToggle: () => void;
  onReset: () => void;
  onRemove: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function TimerMarker({
  timer,
  onToggle,
  onReset,
  onRemove,
}: TimerMarkerProps) {
  const isExpired = timer.remaining === 0 && timer.duration > 0;

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: `${timer.x}%`,
        top: `${timer.y}%`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-1 rounded-xl px-3 py-2 shadow-lg backdrop-blur-md",
          "border transition-all duration-200",
          isExpired
            ? "animate-pulse border-red-400 bg-red-900/80 text-red-100"
            : timer.isLost
              ? "border-dashed border-yellow-400/60 bg-black/40 text-yellow-200/60"
              : "border-white/20 bg-black/70 text-white",
        )}
      >
        {timer.label && (
          <span className="text-xs font-medium opacity-80">{timer.label}</span>
        )}

        <span
          className={cn(
            "font-mono text-2xl font-bold tabular-nums",
            isExpired && "text-red-200",
          )}
        >
          {formatTime(timer.remaining)}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="rounded-full p-1.5 transition-colors hover:bg-white/20"
            title={timer.isRunning ? "Pause" : "Start"}
          >
            {timer.isRunning ? (
              <Pause size={16} weight="fill" />
            ) : (
              <Play size={16} weight="fill" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="rounded-full p-1.5 transition-colors hover:bg-white/20"
            title="Reset"
          >
            <ArrowCounterClockwise size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="rounded-full p-1.5 transition-colors hover:bg-white/20"
            title="Remove"
          >
            <X size={16} />
          </button>
        </div>

        {timer.isLost && (
          <span className="text-[10px] text-yellow-300/80">tracking lost</span>
        )}
      </div>

      {/* Pointer arrow */}
      <div
        className={cn(
          "mx-auto h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent",
          isExpired
            ? "border-t-red-900/80"
            : timer.isLost
              ? "border-t-black/40"
              : "border-t-black/70",
        )}
      />
    </div>
  );
}
