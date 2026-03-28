"use client";

import { useEffect, useRef, useState } from "react";

interface DeviceInfo {
  deviceId: string;
  label: string;
}

interface CookingSetupProps {
  onStart: (cameraId: string, micId: string) => void;
}

export function CookingSetup({ onStart }: CookingSetupProps) {
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

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-orange-600/20 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/3 w-100 h-100 bg-amber-500/15 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-2/3 left-1/2 w-75 h-75 bg-red-700/10 rounded-full blur-[80px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 drop-shadow-2xl">👨‍🍳</div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Chef <span className="text-orange-400">AI</span>
          </h1>
          <p className="text-white/40 mt-2 text-sm tracking-wide">
            Twój asystent kulinarny z AI
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/60">
          {/* Camera preview */}
          <div className="relative mb-5 rounded-2xl overflow-hidden aspect-video bg-black/40 border border-white/8">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white/40 text-sm">Ładowanie kamery...</div>
              </div>
            )}
            {!loading && !permissionGranted && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="text-center">
                  <div className="text-3xl mb-2">🚫</div>
                  <p className="text-white/60 text-sm">
                    Brak dostępu do kamery
                  </p>
                </div>
              </div>
            )}
            {permissionGranted && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-full px-2.5 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white/70 text-xs font-medium">LIVE</span>
              </div>
            )}
          </div>

          {/* Device selectors */}
          {permissionGranted && (
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5 px-1">
                  📹 Kamera
                </label>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full bg-white/8 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400/50 transition-colors appearance-none cursor-pointer"
                >
                  {cameras.map((cam) => (
                    <option
                      key={cam.deviceId}
                      value={cam.deviceId}
                      className="bg-gray-900 text-white"
                    >
                      {cam.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5 px-1">
                  🎤 Mikrofon
                </label>
                <select
                  value={selectedMic}
                  onChange={(e) => setSelectedMic(e.target.value)}
                  className="w-full bg-white/8 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400/50 transition-colors appearance-none cursor-pointer"
                >
                  {microphones.map((mic) => (
                    <option
                      key={mic.deviceId}
                      value={mic.deviceId}
                      className="bg-gray-900 text-white"
                    >
                      {mic.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Recipe preview */}
          <div className="mb-5 bg-orange-500/8 border border-orange-400/15 rounded-2xl px-4 py-3">
            <p className="text-orange-300/70 text-xs uppercase tracking-widest mb-1">
              Przepis
            </p>
            <p className="text-white/80 text-sm font-medium">
              🍝 Spaghetti Carbonara
            </p>
            <p className="text-white/35 text-xs mt-0.5">
              8 kroków · ok. 30 minut
            </p>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={!permissionGranted || !selectedCamera}
            className="w-full relative overflow-hidden bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-base transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10">🍳 Let&apos;s Cook!</span>
          </button>

          {!permissionGranted && !loading && (
            <p className="text-center text-white/30 text-xs mt-3">
              Wymagany dostęp do kamery i mikrofonu
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
