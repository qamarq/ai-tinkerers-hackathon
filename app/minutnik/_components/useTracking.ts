"use client";

import { useCallback, useEffect, useRef } from "react";

// jsfeat is a CommonJS module with no types
// eslint-disable-next-line @typescript-eslint/no-require-imports
let jsfeat: any = null;

interface TrackedPoint {
  timerId: string;
  /** Points in pixel coords at tracking resolution */
  prevXY: Float32Array;
  currXY: Float32Array;
  pointCount: number;
  status: Uint8Array;
}

interface TrackingCallbacks {
  onPositionUpdate: (
    timerId: string,
    x: number,
    y: number,
    isLost: boolean,
  ) => void;
}

const TRACK_WIDTH = 320;
const TRACK_HEIGHT = 240;
const WIN_SIZE = 20;
const MAX_ITERATIONS = 30;
const POINT_GRID_SIZE = 4; // 4x4 grid = 16 points around click
const POINT_RADIUS = 30; // radius in tracking pixels

export function useTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  callbacks: TrackingCallbacks,
) {
  const trackedPointsRef = useRef<TrackedPoint[]>([]);
  const prevGrayRef = useRef<any>(null);
  const currGrayRef = useRef<any>(null);
  const prevPyrRef = useRef<any>(null);
  const currPyrRef = useRef<any>(null);
  const initializedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Initialize jsfeat structures
  const initJsfeat = useCallback(() => {
    if (initializedRef.current || !jsfeat) return;

    prevGrayRef.current = new jsfeat.matrix_t(
      TRACK_WIDTH,
      TRACK_HEIGHT,
      jsfeat.U8_t | jsfeat.C1_t,
    );
    currGrayRef.current = new jsfeat.matrix_t(
      TRACK_WIDTH,
      TRACK_HEIGHT,
      jsfeat.U8_t | jsfeat.C1_t,
    );

    prevPyrRef.current = new jsfeat.pyramid_t(3);
    prevPyrRef.current.allocate(
      TRACK_WIDTH,
      TRACK_HEIGHT,
      jsfeat.U8_t | jsfeat.C1_t,
    );

    currPyrRef.current = new jsfeat.pyramid_t(3);
    currPyrRef.current.allocate(
      TRACK_WIDTH,
      TRACK_HEIGHT,
      jsfeat.U8_t | jsfeat.C1_t,
    );

    initializedRef.current = true;
  }, []);

  // Add a new tracked point for a timer
  const addTrackedPoint = useCallback(
    (timerId: string, clickXPercent: number, clickYPercent: number) => {
      if (!jsfeat) return;
      initJsfeat();

      // Convert percentage to tracking resolution pixels
      const cx = (clickXPercent / 100) * TRACK_WIDTH;
      const cy = (clickYPercent / 100) * TRACK_HEIGHT;

      // Create a grid of points around the click
      const points: [number, number][] = [];
      for (let gy = 0; gy < POINT_GRID_SIZE; gy++) {
        for (let gx = 0; gx < POINT_GRID_SIZE; gx++) {
          const px = cx + ((gx / (POINT_GRID_SIZE - 1)) * 2 - 1) * POINT_RADIUS;
          const py = cy + ((gy / (POINT_GRID_SIZE - 1)) * 2 - 1) * POINT_RADIUS;
          // Clamp to image bounds
          if (px >= 0 && px < TRACK_WIDTH && py >= 0 && py < TRACK_HEIGHT) {
            points.push([px, py]);
          }
        }
      }

      const count = points.length;
      const prevXY = new Float32Array(count * 2);
      const currXY = new Float32Array(count * 2);

      for (let i = 0; i < count; i++) {
        prevXY[i * 2] = points[i][0];
        prevXY[i * 2 + 1] = points[i][1];
        currXY[i * 2] = points[i][0];
        currXY[i * 2 + 1] = points[i][1];
      }

      trackedPointsRef.current.push({
        timerId,
        prevXY,
        currXY,
        pointCount: count,
        status: new Uint8Array(count),
      });
    },
    [initJsfeat],
  );

  // Remove tracking for a timer
  const removeTrackedPoint = useCallback((timerId: string) => {
    trackedPointsRef.current = trackedPointsRef.current.filter(
      (tp) => tp.timerId !== timerId,
    );
  }, []);

  // Main tracking loop
  useEffect(() => {
    let running = true;

    async function loadJsfeat() {
      if (!jsfeat) {
        try {
          const mod = await import("jsfeat");
          jsfeat = mod.default || mod;
        } catch {
          console.error("Failed to load jsfeat");
          return;
        }
      }
      initJsfeat();
      loop();
    }

    function loop() {
      if (!running) return;
      rafRef.current = requestAnimationFrame(processFrame);
    }

    function processFrame() {
      if (!running) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (
        !video ||
        !canvas ||
        video.readyState < 2 ||
        !jsfeat ||
        !initializedRef.current
      ) {
        loop();
        return;
      }

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        loop();
        return;
      }

      // Draw video to canvas at tracking resolution
      canvas.width = TRACK_WIDTH;
      canvas.height = TRACK_HEIGHT;
      ctx.drawImage(video, 0, 0, TRACK_WIDTH, TRACK_HEIGHT);

      const imageData = ctx.getImageData(0, 0, TRACK_WIDTH, TRACK_HEIGHT);

      // Swap prev and curr
      const temp = prevGrayRef.current;
      prevGrayRef.current = currGrayRef.current;
      currGrayRef.current = temp;

      const tempPyr = prevPyrRef.current;
      prevPyrRef.current = currPyrRef.current;
      currPyrRef.current = tempPyr;

      // Convert to grayscale
      jsfeat.imgproc.grayscale(
        imageData.data,
        TRACK_WIDTH,
        TRACK_HEIGHT,
        currGrayRef.current,
      );

      // Build pyramid
      currPyrRef.current.data[0] = currGrayRef.current;
      // Build lower levels
      for (let i = 1; i < currPyrRef.current.levels; i++) {
        jsfeat.imgproc.pyrdown(
          currPyrRef.current.data[i - 1],
          currPyrRef.current.data[i],
        );
      }

      // Track each set of points
      const tracked = trackedPointsRef.current;
      for (let t = 0; t < tracked.length; t++) {
        const tp = tracked[t];

        // Copy curr to prev for next frame
        for (let i = 0; i < tp.pointCount * 2; i++) {
          tp.prevXY[i] = tp.currXY[i];
        }

        // Run optical flow
        jsfeat.optical_flow_lk.track(
          prevPyrRef.current,
          currPyrRef.current,
          tp.prevXY,
          tp.currXY,
          tp.pointCount,
          WIN_SIZE,
          MAX_ITERATIONS,
          tp.status,
          0.01,
          0.0001,
        );

        // Compute centroid of surviving points
        let sumX = 0;
        let sumY = 0;
        let alive = 0;

        for (let i = 0; i < tp.pointCount; i++) {
          if (tp.status[i] === 1) {
            sumX += tp.currXY[i * 2];
            sumY += tp.currXY[i * 2 + 1];
            alive++;
          }
        }

        const isLost = alive < 3;

        if (!isLost) {
          const centroidX = sumX / alive;
          const centroidY = sumY / alive;

          // Convert to percentage
          const xPercent = (centroidX / TRACK_WIDTH) * 100;
          const yPercent = (centroidY / TRACK_HEIGHT) * 100;

          callbacksRef.current.onPositionUpdate(
            tp.timerId,
            xPercent,
            yPercent,
            false,
          );
        } else {
          callbacksRef.current.onPositionUpdate(tp.timerId, -1, -1, true);
        }
      }

      loop();
    }

    loadJsfeat();

    return () => {
      running = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [videoRef, canvasRef, initJsfeat]);

  return { addTrackedPoint, removeTrackedPoint };
}
