"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ConnectionState, LiveChatMessage } from "../types/live";
import { AudioProcessor } from "../utils/audioUtils";
import {
  GeminiLiveClient,
  type GeminiLiveConfig,
} from "../utils/geminiLiveClient";

export function useGeminiLive() {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const geminiClientRef = useRef<GeminiLiveClient | null>(null);
  const audioProcessorRef = useRef<AudioProcessor | null>(null);
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      setConnectionState("error");
      throw error;
    }
  };

  const captureVideoFrame = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current) return null;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return null;

      // Reduce size to 640x480
      const maxWidth = 640;
      const maxHeight = 480;
      let width = videoRef.current.videoWidth;
      let height = videoRef.current.videoHeight;

      const aspectRatio = width / height;
      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(videoRef.current, 0, 0, width, height);

      // Convert to JPEG blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.7);
      });

      if (!blob) return null;

      // Convert to base64
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      return base64;
    } catch (error) {
      console.error("Error capturing frame:", error);
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

        // Convert Float32 to PCM16
        const pcm16 = audioProcessorRef.current!.float32ToPCM16(inputData);
        const base64 = audioProcessorRef.current!.arrayBufferToBase64(pcm16);

        // Send to Gemini
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

      // Start camera
      const stream = await startCamera();

      // Initialize audio processor
      if (!audioProcessorRef.current) {
        audioProcessorRef.current = new AudioProcessor();
        await audioProcessorRef.current.initialize();
      }

      // Get API key from environment
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY not found");
      }

      // Create Gemini Live client with official SDK
      const clientConfig: GeminiLiveConfig = {
        model: "gemini-3.1-flash-live-preview",
        apiKey,
        voiceName: "Kore", // Polish-friendly voice
        systemInstruction:
          "Jesteś pomocnym asystentem AI mówiącym po polsku. Odpowiadaj naturalnie i zwięźle. Widzisz użytkownika przez kamerę i możesz komentować to co widzisz. Gdy użytkownik zapyta o godzinę, użyj narzędzia get_current_time.",
        onConnected: () => {
          console.log("Connected to Gemini Live API");
          setConnectionState("connected");
          setIsListening(true);

          // Start sending video frames (1 FPS)
          videoIntervalRef.current = setInterval(async () => {
            const frame = await captureVideoFrame();
            if (frame && geminiClientRef.current) {
              geminiClientRef.current.sendVideo(frame);
            }
          }, 1000);

          // Start capturing and sending audio
          startAudioCapture(stream);
        },
        onDisconnected: () => {
          console.log("Disconnected from Gemini Live API");
          setConnectionState("disconnected");
          setIsListening(false);
        },
        onAudioData: (base64Audio) => {
          // Play received audio
          if (audioProcessorRef.current) {
            audioProcessorRef.current.playAudio(base64Audio);
          }
        },
        onInputTranscription: (text, isPartial) => {
          console.log(
            "User said:",
            text,
            isPartial ? "(partial)" : "(complete)",
          );

          if (isPartial) {
            // Update last user message or create new partial
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.role === "user") {
                // Update existing message
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, content: text },
                ];
              } else {
                // Create new partial message
                return [
                  ...prev,
                  {
                    role: "user",
                    content: text,
                    timestamp: new Date(),
                  },
                ];
              }
            });
          } else {
            // Complete message - finalize
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.role === "user") {
                // Just update to final content
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, content: text },
                ];
              } else {
                // Add new complete message
                return [
                  ...prev,
                  {
                    role: "user",
                    content: text,
                    timestamp: new Date(),
                  },
                ];
              }
            });
          }
        },
        onOutputTranscription: (text, isPartial) => {
          console.log("AI said:", text, isPartial ? "(partial)" : "(complete)");

          if (!isPartial) {
            setIsProcessing(false);
          }

          if (isPartial) {
            // Update last model message or create new partial
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.role === "model") {
                // Update existing message
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, content: text },
                ];
              } else {
                // Create new partial message
                return [
                  ...prev,
                  {
                    role: "model",
                    content: text,
                    timestamp: new Date(),
                  },
                ];
              }
            });
          } else {
            // Complete message - finalize
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.role === "model") {
                // Just update to final content
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, content: text },
                ];
              } else {
                // Add new complete message
                return [
                  ...prev,
                  {
                    role: "model",
                    content: text,
                    timestamp: new Date(),
                  },
                ];
              }
            });
          }
        },
        onInterrupted: () => {
          console.log("Generation interrupted (user spoke)");
          // Stop playing audio when user interrupts
          if (audioProcessorRef.current) {
            audioProcessorRef.current.stopPlayback();
          }
          setIsProcessing(false);
        },
        onError: (error) => {
          console.error("Gemini Live Error:", error);
          setConnectionState("error");
        },
      };

      geminiClientRef.current = new GeminiLiveClient(clientConfig);
      await geminiClientRef.current.connect();
    } catch (error) {
      console.error("Connection error:", error);
      setConnectionState("error");
    }
  }, [captureVideoFrame, startAudioCapture]);

  const disconnect = useCallback(() => {
    // Stop video sending
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }

    // Stop audio processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Disconnect Gemini client
    if (geminiClientRef.current) {
      geminiClientRef.current.disconnect();
      geminiClientRef.current = null;
    }

    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Cleanup audio processor
    if (audioProcessorRef.current) {
      audioProcessorRef.current.cleanup();
      audioProcessorRef.current = null;
    }

    setConnectionState("disconnected");
    setIsListening(false);
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
    isListening,
    isProcessing,
    connect,
    disconnect,
  };
}
