export interface Timer {
  id: string;
  /** Current display position as percentage of container (0-100) */
  x: number;
  y: number;
  /** Total duration in seconds */
  duration: number;
  /** Remaining time in seconds */
  remaining: number;
  isRunning: boolean;
  label: string;
  /** Whether optical flow tracking has been lost */
  isLost: boolean;
}

export type TimerAction =
  | {
      type: "ADD_TIMER";
      payload: {
        id: string;
        x: number;
        y: number;
        duration: number;
        label: string;
      };
    }
  | { type: "REMOVE_TIMER"; payload: { id: string } }
  | { type: "TOGGLE_TIMER"; payload: { id: string } }
  | { type: "RESET_TIMER"; payload: { id: string } }
  | {
      type: "UPDATE_POSITION";
      payload: { id: string; x: number; y: number; isLost: boolean };
    }
  | { type: "TICK" };
