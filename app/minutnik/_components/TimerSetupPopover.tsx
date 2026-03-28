"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface TimerSetupPopoverProps {
  position: { x: number; y: number };
  onConfirm: (duration: number, label: string) => void;
  onCancel: () => void;
}

const PRESETS = [
  { label: "1m", seconds: 60 },
  { label: "3m", seconds: 180 },
  { label: "5m", seconds: 300 },
  { label: "10m", seconds: 600 },
  { label: "15m", seconds: 900 },
  { label: "30m", seconds: 1800 },
];

export function TimerSetupPopover({ position, onConfirm, onCancel }: TimerSetupPopoverProps) {
  const [label, setLabel] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onCancel();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    // Delay adding click listener so the same click that opened the popover doesn't close it
    const timeout = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(timeout);
    };
  }, [onCancel]);

  return (
    <div
      ref={ref}
      className="absolute z-50 pointer-events-auto"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -100%) translateY(-16px)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-2 rounded-xl border border-white/20 bg-black/80 p-3 shadow-2xl backdrop-blur-lg">
        <input
          type="text"
          placeholder="Label (optional)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
          autoFocus
        />
        <div className="grid grid-cols-3 gap-1.5">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              className="border-white/20 bg-white/5 text-white hover:bg-white/20 hover:text-white"
              onClick={() => onConfirm(preset.seconds, label)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white hover:bg-white/10"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
