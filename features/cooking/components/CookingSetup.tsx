"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, ChefHat, Mic, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface DeviceInfo {
  deviceId: string;
  label: string;
}

interface CookingSetupProps {
  onStart: (cameraId: string, micId: string) => void;
  recipeInfo?: {
    title: string;
    stepsCount: number;
    timeMinutes?: number;
  } | null;
}

export function CookingSetup({ onStart, recipeInfo }: CookingSetupProps) {
  const [cameras, setCameras] = useState<DeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<DeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices
          .filter((d) => d.kind === "videoinput")
          .map((d, i) => ({
            deviceId: d.deviceId,
            label: d.label || `Kamera ${i + 1}`,
          }));
        const mics = devices
          .filter((d) => d.kind === "audioinput")
          .map((d, i) => ({
            deviceId: d.deviceId,
            label: d.label || `Mikrofon ${i + 1}`,
          }));

        setCameras(cams);
        setMicrophones(mics);
        setSelectedCamera(cams[0]?.deviceId ?? "");
        setSelectedMic(mics[0]?.deviceId ?? "");
        setPermissionGranted(true);
      } catch (err) {
        console.error("Permission denied:", err);
      } finally {
        setLoading(false);
      }
    }
    init();

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Switch camera preview when selection changes
  useEffect(() => {
    if (!selectedCamera || !selectedMic || !permissionGranted) return;

    async function switchStream() {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedCamera } },
          audio: { deviceId: { exact: selectedMic } },
        });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = newStream;
        if (videoRef.current) videoRef.current.srcObject = newStream;
      } catch (err) {
        console.error("Error switching device:", err);
      }
    }
    switchStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCamera, selectedMic]);

  const handleStart = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onStart(selectedCamera, selectedMic);
  };

  const stepsLabel =
    recipeInfo?.stepsCount === 1
      ? "krok"
      : recipeInfo && recipeInfo.stepsCount < 5
        ? "kroki"
        : "krokow";

  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 via-background to-background">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Gotownik.love
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <ChefHat className="h-3.5 w-3.5" />
            Cooking setup
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <Card className="overflow-hidden border-border/70 shadow-xl">
            <CardHeader className="border-b bg-muted/35">
              <CardTitle className="text-xl">Podglad kamery</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="relative overflow-hidden rounded-xl border bg-black aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />

                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <p className="text-sm text-white/80">Ladowanie kamery...</p>
                  </div>
                )}

                {!loading && !permissionGranted && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/75 px-4">
                    <div className="text-center text-white/90">
                      <ShieldAlert className="mx-auto mb-2 h-7 w-7" />
                      <p className="text-sm">
                        Brak dostepu do kamery i mikrofonu
                      </p>
                    </div>
                  </div>
                )}

                {permissionGranted && (
                  <div className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    LIVE
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-xl">
            <CardHeader className="space-y-2 border-b bg-muted/30">
              <CardTitle className="text-xl">
                <span className="inline-flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  Gotownik.love
                </span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Wybierz urzadzenia i rozpocznij gotowanie.
              </p>
            </CardHeader>
            <CardContent className="space-y-5 p-4 sm:p-6">
              {permissionGranted ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="camera-select"
                      className="text-sm font-medium"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Kamera
                      </span>
                    </Label>
                    <select
                      id="camera-select"
                      value={selectedCamera}
                      onChange={(e) => setSelectedCamera(e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring"
                    >
                      {cameras.map((cam) => (
                        <option key={cam.deviceId} value={cam.deviceId}>
                          {cam.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mic-select" className="text-sm font-medium">
                      <span className="inline-flex items-center gap-2">
                        <Mic className="h-4 w-4" />
                        Mikrofon
                      </span>
                    </Label>
                    <select
                      id="mic-select"
                      value={selectedMic}
                      onChange={(e) => setSelectedMic(e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring"
                    >
                      {microphones.map((mic) => (
                        <option key={mic.deviceId} value={mic.deviceId}>
                          {mic.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                !loading && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    Wymagany dostep do kamery i mikrofonu.
                  </div>
                )
              )}

              {recipeInfo && (
                <div className="rounded-lg border bg-muted/35 p-4">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Przepis
                  </p>
                  <p className="text-sm font-semibold leading-snug">
                    {recipeInfo.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {recipeInfo.stepsCount} {stepsLabel}
                    {recipeInfo.timeMinutes &&
                      ` · ok. ${recipeInfo.timeMinutes} minut`}
                  </p>
                </div>
              )}

              <Button
                onClick={handleStart}
                disabled={!permissionGranted || !selectedCamera}
                className="h-11 w-full"
              >
                Rozpocznij gotowanie
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
