"use client";

import { useEffect, useRef, useState } from "react";

export function useCamera(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError("Camera access is not supported in this browser");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof DOMException && err.name === "NotAllowedError") {
            setError("Camera permission denied. Please allow camera access.");
          } else {
            setError("Failed to access camera");
          }
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [videoRef]);

  return { isReady, error };
}
