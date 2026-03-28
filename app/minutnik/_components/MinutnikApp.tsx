"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Timer as TimerIcon } from "@phosphor-icons/react";
import { useCamera } from "./useCamera";
import { useTimers } from "./useTimers";
import { useTracking } from "./useTracking";
import { TimerOverlay } from "./TimerOverlay";
import { TimerSetupPopover } from "./TimerSetupPopover";

export function MinutnikApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isReady, error } = useCamera(videoRef);
  const [timers, dispatch] = useTimers();
  const [pendingClick, setPendingClick] = useState<{ x: number; y: number } | null>(null);
  const beepedRef = useRef<Set<string>>(new Set());

  const onPositionUpdate = useCallback(
    (timerId: string, x: number, y: number, isLost: boolean) => {
      if (isLost) {
        dispatch({ type: "UPDATE_POSITION", payload: { id: timerId, x: -1, y: -1, isLost: true } });
      } else {
        dispatch({ type: "UPDATE_POSITION", payload: { id: timerId, x, y, isLost: false } });
      }
    },
    [dispatch]
  );

  const { addTrackedPoint, removeTrackedPoint } = useTracking(videoRef, canvasRef, {
    onPositionUpdate,
  });

  // Tick interval for countdown
  useEffect(() => {
    const hasRunning = timers.some((t) => t.isRunning && t.remaining > 0);
    if (!hasRunning) return;

    const interval = setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);

    return () => clearInterval(interval);
  }, [timers, dispatch]);

  // Beep when a timer expires
  useEffect(() => {
    for (const timer of timers) {
      if (timer.remaining === 0 && timer.duration > 0 && !beepedRef.current.has(timer.id)) {
        beepedRef.current.add(timer.id);
        playBeep();
      }
    }
  }, [timers]);

  function playBeep() {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      osc.type = "square";
      gain.gain.value = 0.3;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 300);
    } catch {
      // Audio not available
    }
  }

  function handleVideoClick(e: React.MouseEvent<HTMLDivElement>) {
    if (pendingClick) return; // Already showing popover

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingClick({ x, y });
  }

  function handleConfirmTimer(duration: number, label: string) {
    if (!pendingClick) return;

    const id = crypto.randomUUID();
    addTrackedPoint(id, pendingClick.x, pendingClick.y);
    dispatch({
      type: "ADD_TIMER",
      payload: { id, x: pendingClick.x, y: pendingClick.y, duration, label },
    });
    setPendingClick(null);
  }

  function handleRemoveTimer(id: string) {
    removeTrackedPoint(id);
    dispatch({ type: "REMOVE_TIMER", payload: { id } });
    beepedRef.current.delete(id);
  }

  const activeCount = timers.filter((t) => t.isRunning).length;

  return (
    <div ref={containerRef} className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Camera feed */}
      <div className="absolute inset-0" onClick={handleVideoClick}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>

      {/* Hidden canvas for frame processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Timer overlay */}
      <TimerOverlay
        timers={timers}
        dispatch={(action) => {
          if (action.type === "REMOVE_TIMER") {
            handleRemoveTimer(action.payload.id);
          } else {
            dispatch(action);
          }
        }}
      />

      {/* Setup popover */}
      {pendingClick && (
        <TimerSetupPopover
          position={pendingClick}
          onConfirm={handleConfirmTimer}
          onCancel={() => setPendingClick(null)}
        />
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 backdrop-blur-md pointer-events-auto">
            <TimerIcon size={20} weight="fill" className="text-white" />
            <span className="text-sm font-semibold text-white">Minutnik</span>
            {timers.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-xs font-medium text-white">
                {activeCount}/{timers.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Camera status */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl bg-black/80 px-6 py-4 text-center backdrop-blur-md">
            {error ? (
              <p className="text-red-400">{error}</p>
            ) : (
              <p className="text-white/80">Initializing camera...</p>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {isReady && timers.length === 0 && !pendingClick && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
          <div className="rounded-full bg-black/60 px-5 py-2.5 backdrop-blur-md">
            <p className="text-sm text-white/80">
              Tap anywhere on the video to place a cooking timer
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
