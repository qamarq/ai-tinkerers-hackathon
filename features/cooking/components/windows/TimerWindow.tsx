"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";

import { timerAtom } from "../../atoms/cookingAtoms";

export function TimerWindow() {
  const [timer, setTimer] = useAtom(timerAtom);

  useEffect(() => {
    if (!timer.isRunning) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev.remainingSeconds <= 1) {
          return { ...prev, remainingSeconds: 0, isRunning: false };
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.isRunning, setTimer]);

  const minutes = Math.floor(timer.remainingSeconds / 60);
  const seconds = timer.remainingSeconds % 60;
  const progress =
    timer.totalSeconds > 0 ? timer.remainingSeconds / timer.totalSeconds : 0;
  const isDone = timer.totalSeconds > 0 && timer.remainingSeconds === 0;

  const circumference = 2 * Math.PI * 36;

  return (
    <div className="flex flex-col items-center justify-center p-5 h-full gap-3">
      {/* Circular progress */}
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="5"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={
              isDone
                ? "#ef4444"
                : timer.isRunning
                  ? "#f97316"
                  : "rgba(255,255,255,0.3)"
            }
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-xl font-mono font-bold tabular-nums ${isDone ? "text-red-400" : "text-white"}`}
          >
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      {timer.label && (
        <p className="text-white/50 text-xs text-center max-w-40 leading-snug truncate">
          {isDone ? "✅ Done!" : timer.label}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setTimer((p) => ({ ...p, isRunning: !p.isRunning }))}
          disabled={timer.totalSeconds === 0}
          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg text-white text-xs transition-all"
        >
          {timer.isRunning ? "⏸" : "▶"}
        </button>
        <button
          onClick={() =>
            setTimer((p) => ({
              ...p,
              remainingSeconds: p.totalSeconds,
              isRunning: false,
            }))
          }
          disabled={timer.totalSeconds === 0}
          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg text-white text-xs transition-all"
        >
          ↺
        </button>
      </div>
    </div>
  );
}
