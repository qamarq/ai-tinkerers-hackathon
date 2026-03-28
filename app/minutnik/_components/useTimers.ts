"use client";

import { useReducer } from "react";

import type { Timer, TimerAction } from "./types";

function timerReducer(state: Timer[], action: TimerAction): Timer[] {
  switch (action.type) {
    case "ADD_TIMER":
      return [
        ...state,
        {
          id: action.payload.id,
          x: action.payload.x,
          y: action.payload.y,
          duration: action.payload.duration,
          remaining: action.payload.duration,
          isRunning: false,
          label: action.payload.label,
          isLost: false,
        },
      ];

    case "REMOVE_TIMER":
      return state.filter((t) => t.id !== action.payload.id);

    case "TOGGLE_TIMER":
      return state.map((t) =>
        t.id === action.payload.id ? { ...t, isRunning: !t.isRunning } : t,
      );

    case "RESET_TIMER":
      return state.map((t) =>
        t.id === action.payload.id
          ? { ...t, remaining: t.duration, isRunning: false }
          : t,
      );

    case "UPDATE_POSITION":
      return state.map((t) =>
        t.id === action.payload.id
          ? {
              ...t,
              x: action.payload.x,
              y: action.payload.y,
              isLost: action.payload.isLost,
            }
          : t,
      );

    case "TICK":
      return state.map((t) => {
        if (!t.isRunning || t.remaining <= 0) return t;
        const remaining = t.remaining - 1;
        return {
          ...t,
          remaining,
          isRunning: remaining > 0,
        };
      });

    default:
      return state;
  }
}

export function useTimers() {
  return useReducer(timerReducer, []);
}
