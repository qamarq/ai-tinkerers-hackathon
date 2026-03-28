"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, CameraRotate, ImageIcon, X } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

interface FridgeCaptureProps {
  onImageCapture: (file: File) => void;
  imagePreview: string | null;
  onClearImage: () => void;
  disabled?: boolean;
}

type CameraSourceSelection = `device:${string}`;

export const FridgeCapture: React.FC<FridgeCaptureProps> = ({
  onImageCapture,
  imagePreview,
  onClearImage,
  disabled = false,
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraSource, setCameraSource] = useState<CameraSourceSelection | "">(
    "",
  );
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const previousCameraSourceRef = useRef<CameraSourceSelection | "">("");

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  }, []);

  const loadCameraDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return;
    }

    try {
      setIsLoadingDevices(true);
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameraDevices(
        devices.filter((device) => device.kind === "videoinput"),
      );
    } finally {
      setIsLoadingDevices(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    void loadCameraDevices();
  }, [loadCameraDevices]);

  useEffect(() => {
    if (!navigator.mediaDevices?.addEventListener) {
      return;
    }

    const handleDeviceChange = () => {
      void loadCameraDevices();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange,
      );
    };
  }, [loadCameraDevices]);

  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !streamRef.current) {
      return;
    }

    const videoElement = videoRef.current;
    videoElement.srcObject = streamRef.current;

    void videoElement.play().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setCameraError("Unable to start camera preview. Please try again.");
    });
  }, [cameraOpen]);

  useEffect(() => {
    if (!disabled || !cameraOpen) {
      return;
    }

    setCameraOpen(false);
    stopCamera();
  }, [cameraOpen, disabled, stopCamera]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    if (cameraDevices.length === 0) {
      setCameraSource("");
      return;
    }

    const preferredDevice =
      cameraDevices.find((device) =>
        device.label.toLowerCase().includes("iphone"),
      ) ?? cameraDevices[0];
    const preferredDeviceSource =
      `device:${preferredDevice.deviceId}` as CameraSourceSelection;

    if (!cameraSource) {
      setCameraSource(preferredDeviceSource);
      return;
    }

    const deviceId = cameraSource.replace("device:", "");
    const deviceStillAvailable = cameraDevices.some(
      (device) => device.deviceId === deviceId,
    );

    if (!deviceStillAvailable) {
      setCameraSource(preferredDeviceSource);
      return;
    }

    const selectedDevice = cameraDevices.find(
      (device) => device.deviceId === deviceId,
    );
    const selectedLooksLikeIPhone = selectedDevice?.label
      .toLowerCase()
      .includes("iphone");
    const preferredLooksLikeIPhone = preferredDevice.label
      .toLowerCase()
      .includes("iphone");

    if (!selectedLooksLikeIPhone && preferredLooksLikeIPhone) {
      setCameraSource(preferredDeviceSource);
    }
  }, [cameraDevices, cameraSource, isMounted]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        onImageCapture(file);
      }
      event.target.value = "";
    },
    [onImageCapture],
  );

  const handleOpenCamera = useCallback(async () => {
    if (disabled || isStartingCamera) {
      return;
    }

    if (!cameraSource) {
      setCameraError("No camera source detected. Connect a camera and retry.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("This browser does not support camera capture.");
      return;
    }

    try {
      setIsStartingCamera(true);
      setCameraError(null);

      stopCamera();

      const videoConstraint = {
        deviceId: { exact: cameraSource.replace("device:", "") },
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraint,
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);
      await loadCameraDevices();
    } catch {
      setCameraError(
        "Unable to access selected camera source. Try another source.",
      );
      stopCamera();
    } finally {
      setIsStartingCamera(false);
    }
  }, [cameraSource, disabled, isStartingCamera, loadCameraDevices, stopCamera]);

  const handleCloseCamera = useCallback(() => {
    setCameraOpen(false);
    stopCamera();
  }, [stopCamera]);

  const handleCaptureFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("Camera is not ready yet. Please try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Unable to capture image from camera.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.9);
    });

    if (!blob) {
      setCameraError("Unable to process captured image.");
      return;
    }

    const capturedFile = new File([blob], `fridge-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    onImageCapture(capturedFile);
    handleCloseCamera();
  }, [handleCloseCamera, onImageCapture]);

  const handleCameraSourceChange = useCallback(
    (source: CameraSourceSelection | "") => {
      setCameraSource(source);
      setCameraError(null);
    },
    [],
  );

  useEffect(() => {
    if (previousCameraSourceRef.current === cameraSource) {
      return;
    }

    previousCameraSourceRef.current = cameraSource;

    if (!cameraOpen || isStartingCamera || disabled) {
      return;
    }

    void handleOpenCamera();
  }, [cameraOpen, cameraSource, disabled, handleOpenCamera, isStartingCamera]);

  if (imagePreview) {
    return (
      <div className="flex flex-col gap-4">
        <div className="relative w-full max-w-md mx-auto">
          <Image
            src={imagePreview}
            alt="Fridge preview"
            width={600}
            height={400}
            unoptimized
            className="w-full h-auto rounded-lg border-2 border-border shadow-md"
          />
          <Button
            variant="destructive"
            size="icon"
            onClick={onClearImage}
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-md"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      {cameraOpen ? (
        <div className="w-full max-w-md space-y-3">
          <div className="overflow-hidden rounded-xl border bg-black">
            <video
              ref={videoRef}
              className="h-auto w-full"
              autoPlay
              muted
              playsInline
            />
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleCaptureFrame}
              disabled={disabled}
            >
              <Camera className="h-4 w-4 mr-2" />
              Capture
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCloseCamera}
              disabled={disabled}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Position the fridge in frame, then tap capture.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="w-full max-w-md space-y-1">
            <p className="text-sm font-medium">Camera Source</p>
            <select
              value={cameraSource}
              onChange={(event) =>
                handleCameraSourceChange(
                  event.target.value as CameraSourceSelection | "",
                )
              }
              disabled={
                !isMounted ||
                disabled ||
                isLoadingDevices ||
                cameraDevices.length === 0
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {!isMounted && (
                <option value="">Loading camera sources...</option>
              )}
              {isMounted && cameraDevices.length === 0 && (
                <option value="">No camera devices found</option>
              )}
              {cameraDevices.map((device, index) => (
                <option
                  key={device.deviceId}
                  value={`device:${device.deviceId}`}
                >
                  {device.label || `Camera ${index + 1}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <Button
              disabled={disabled}
              onClick={handleOpenCamera}
              className="flex flex-col items-center justify-center gap-2 h-auto py-6 px-8"
            >
              <CameraRotate className="h-8 w-8" />
              <span className="font-medium">Take Photo</span>
            </Button>

            <Button
              variant="outline"
              disabled={disabled}
              onClick={() => galleryInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 h-auto py-6 px-8"
            >
              <ImageIcon className="h-8 w-8" />
              <span className="font-medium">Upload Photo</span>
            </Button>
          </div>
        </div>
      )}

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {cameraError && (
        <p className="text-sm text-destructive text-center">{cameraError}</p>
      )}

      <p className="text-sm text-muted-foreground text-center">
        Pick a specific camera source (for example iPhone Continuity Camera),
        then capture or upload from your photo library.
      </p>
    </div>
  );
};
