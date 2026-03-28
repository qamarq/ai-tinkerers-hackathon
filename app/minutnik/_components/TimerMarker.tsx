"use client";

import { useRef, useState } from "react";
import { ArrowCounterClockwise, Pause, Play, X } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

import type { Timer } from "./types";

interface TimerMarkerProps {
  timer: Timer;
  onToggle: () => void;
  onReset: () => void;
  onRemove: () => void;
  onPositionChange: (x: number, y: number) => void;
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
  onPositionChange,
}: TimerMarkerProps) {
  const isExpired = timer.remaining === 0 && timer.duration > 0;
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;

    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const rect = containerRef.current?.parentElement?.getBoundingClientRect();
    if (!rect) return;

    dragOffsetRef.current = {
      x: e.clientX - ((timer.x / 100) * rect.width + rect.left),
      y: e.clientY - ((timer.y / 100) * rect.height + rect.top),
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const rect = containerRef.current?.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const x =
      ((e.clientX - dragOffsetRef.current.x - rect.left) / rect.width) * 100;
    const y =
      ((e.clientY - dragOffsetRef.current.y - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    onPositionChange(clampedX, clampedY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className="absolute pointer-events-auto"
      style={{
        left: `${timer.x}%`,
        top: `${timer.y}%`,
        transform: "translate(-50%, -100%)",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-1 rounded-xl px-3 py-2 shadow-lg backdrop-blur-md cursor-grab",
          "border transition-all duration-200",
          isExpired
            ? "animate-pulse border-red-400 bg-red-900/80 text-red-100"
            : timer.isLost
              ? "border-dashed border-yellow-400/60 bg-black/40 text-yellow-200/60"
              : "border-white/20 bg-black/70 text-white",
          isDragging && "cursor-grabbing opacity-90 scale-105",
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
