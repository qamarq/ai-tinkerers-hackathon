"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSetAtom } from "jotai";

import type {
  ConnectionState,
  LiveChatMessage,
} from "@/features/live/types/live";
import { AudioProcessor } from "@/features/live/utils/audioUtils";
import {
  GeminiLiveClient,
  type GeminiLiveConfig,
} from "@/features/live/utils/geminiLiveClient";

import { ingredientsAtom, stepsAtom, timerAtom } from "../atoms/cookingAtoms";
import { COOKING_SYSTEM_PROMPT, cookingTools } from "../tools/cookingTools";

const MODEL = "gemini-3.1-flash-live-preview";

export function useCookingSession({
  cameraId,
  micId,
  onSessionEnd,
}: {
  cameraId: string;
  micId: string;
  onSessionEnd?: () => void;
}) {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const geminiClientRef = useRef<GeminiLiveClient | null>(null);
  const audioProcessorRef = useRef<AudioProcessor | null>(null);
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const setIngredients = useSetAtom(ingredientsAtom);
  const setSteps = useSetAtom(stepsAtom);
  const setTimer = useSetAtom(timerAtom);

  const handleToolCall = useCallback(
    (
      name: string,
      args: Record<string, unknown>,
      respond: (result: unknown) => void,
    ) => {
      switch (name) {
        case "check_ingredient":
          setIngredients((prev) =>
            prev.map((ing) =>
              ing.id === String(args.ingredient_id)
                ? { ...ing, checked: Boolean(args.checked) }
                : ing,
            ),
          );
          respond("ok");
          break;
        case "check_step":
          setSteps((prev) =>
            prev.map((step) =>
              step.id === Number(args.step_id)
                ? { ...step, checked: Boolean(args.checked) }
                : step,
            ),
          );
          respond("ok");
          break;
        case "start_timer":
          setTimer({
            totalSeconds: Number(args.seconds),
            remainingSeconds: Number(args.seconds),
            isRunning: true,
            label: typeof args.label === "string" ? args.label : "Timer",
          });
          respond("Timer started");
          break;
        case "pause_timer":
          setTimer((prev) => ({ ...prev, isRunning: !prev.isRunning }));
          respond("ok");
          break;
        case "reset_timer":
          setTimer((prev) => ({
            ...prev,
            remainingSeconds: prev.totalSeconds,
            isRunning: false,
          }));
          respond("ok");
          break;
        case "end_session":
          respond("Session ended successfully");
          setTimeout(() => {
            onSessionEnd?.();
          }, 1000);
          break;
        default:
          respond("unknown tool");
      }
    },
    [setIngredients, setSteps, setTimer, onSessionEnd],
  );

  const captureVideoFrame = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current) return null;
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const maxW = 640,
        maxH = 480;
      let w = videoRef.current.videoWidth;
      let h = videoRef.current.videoHeight;
      const ratio = w / h;
      if (w > maxW) {
        w = maxW;
        h = w / ratio;
      }
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(videoRef.current, 0, 0, w, h);

      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob(res, "image/jpeg", 0.7),
      );
      if (!blob) return null;
      const ab = await blob.arrayBuffer();
      return btoa(String.fromCharCode(...new Uint8Array(ab)));
    } catch {
      return null;
    }
  }, []);

  const startAudioCapture = useCallback((stream: MediaStream) => {
    if (!audioProcessorRef.current || !geminiClientRef.current) return;

    audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    const source = audioContextRef.current.createMediaStreamSource(stream);
    processorRef.current = audioContextRef.current.createScriptProcessor(
      4096,
      1,
      1,
    );

    processorRef.current.onaudioprocess = (e) => {
      if (geminiClientRef.current?.isActive()) {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = audioProcessorRef.current!.float32ToPCM16(inputData);
        const base64 = audioProcessorRef.current!.arrayBufferToBase64(pcm16);
        geminiClientRef.current!.sendAudio(base64);
        setIsProcessing(true);
      }
    };

    source.connect(processorRef.current);
    processorRef.current.connect(audioContextRef.current.destination);
  }, []);

  const connect = useCallback(async () => {
    try {
      setConnectionState("connecting");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: cameraId
          ? { deviceId: { exact: cameraId }, width: 1280, height: 720 }
          : { width: 1280, height: 720 },
        audio: micId
          ? {
              deviceId: { exact: micId },
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 16000,
            }
          : {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 16000,
            },
      });

      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      if (!audioProcessorRef.current) {
        audioProcessorRef.current = new AudioProcessor();
        await audioProcessorRef.current.initialize();
      }

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";
      if (!apiKey) throw new Error("NEXT_PUBLIC_GEMINI_API_KEY not set");

      const clientConfig: GeminiLiveConfig = {
        model: MODEL,
        apiKey,
        voiceName: "Kore",
        systemInstruction: COOKING_SYSTEM_PROMPT,
        tools: [cookingTools],
        onConnected: () => {
          setConnectionState("connected");
          videoIntervalRef.current = setInterval(async () => {
            const frame = await captureVideoFrame();
            if (frame && geminiClientRef.current) {
              geminiClientRef.current.sendVideo(frame);
            }
          }, 1000);
          startAudioCapture(stream);
        },
        onDisconnected: () => {
          setConnectionState("disconnected");
        },
        onAudioData: (base64Audio) => {
          audioProcessorRef.current?.playAudio(base64Audio);
        },
        onInputTranscription: (text) => {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "user") {
              return [...prev.slice(0, -1), { ...last, content: text }];
            }
            return [
              ...prev,
              { role: "user", content: text, timestamp: new Date() },
            ];
          });
        },
        onOutputTranscription: (text, isPartial) => {
          if (!isPartial) setIsProcessing(false);
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "model") {
              return [...prev.slice(0, -1), { ...last, content: text }];
            }
            return [
              ...prev,
              { role: "model", content: text, timestamp: new Date() },
            ];
          });
        },
        onInterrupted: () => {
          audioProcessorRef.current?.stopPlayback();
          setIsProcessing(false);
        },
        onToolCall: handleToolCall,
        onError: (err) => {
          console.error("Cooking session error:", err);
          setConnectionState("error");
        },
      };

      geminiClientRef.current = new GeminiLiveClient(clientConfig);
      await geminiClientRef.current.connect();
    } catch (error) {
      console.error("Connect error:", error);
      setConnectionState("error");
    }
  }, [cameraId, micId, captureVideoFrame, startAudioCapture, handleToolCall]);

  const disconnect = useCallback(() => {
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (geminiClientRef.current) {
      geminiClientRef.current.disconnect();
      geminiClientRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioProcessorRef.current) {
      audioProcessorRef.current.cleanup();
      audioProcessorRef.current = null;
    }
    setConnectionState("disconnected");
    setIsProcessing(false);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    videoRef,
    connectionState,
    messages,
    isProcessing,
    connect,
    disconnect,
  };
}
