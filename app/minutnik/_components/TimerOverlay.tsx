"use client";

import { TimerMarker } from "./TimerMarker";
import type { Timer, TimerAction } from "./types";

interface TimerOverlayProps {
  timers: Timer[];
  dispatch: React.Dispatch<TimerAction>;
}

export function TimerOverlay({ timers, dispatch }: TimerOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {timers.map((timer) => (
        <TimerMarker
          key={timer.id}
          timer={timer}
          onToggle={() =>
            dispatch({ type: "TOGGLE_TIMER", payload: { id: timer.id } })
          }
          onReset={() =>
            dispatch({ type: "RESET_TIMER", payload: { id: timer.id } })
          }
          onRemove={() =>
            dispatch({ type: "REMOVE_TIMER", payload: { id: timer.id } })
          }
        />
      ))}
    </div>
  );
}
