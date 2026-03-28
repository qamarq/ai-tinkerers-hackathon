'use client';

import { Camera, CameraRotate, ImageIcon, X } from '@phosphor-icons/react';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

interface FridgeCaptureProps {
  onImageCapture: (file: File) => void;
  imagePreview: string | null;
  onClearImage: () => void;
  disabled?: boolean;
}

export const FridgeCapture: React.FC<FridgeCaptureProps> = ({
  onImageCapture,
  imagePreview,
  onClearImage,
  disabled = false,
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !streamRef.current) {
      return;
    }

    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play();
  }, [cameraOpen]);

  useEffect(() => {
    if (!disabled || !cameraOpen) {
      return;
    }

    setCameraOpen(false);
    stopCamera();
  }, [cameraOpen, disabled, stopCamera]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        onImageCapture(file);
      }
      event.target.value = '';
    },
    [onImageCapture]
  );

  const handleOpenCamera = useCallback(async () => {
    if (disabled || isStartingCamera) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('This browser does not support camera capture.');
      return;
    }

    try {
      setIsStartingCamera(true);
      setCameraError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setCameraError('Unable to access camera. Check browser permission settings.');
      stopCamera();
    } finally {
      setIsStartingCamera(false);
    }
  }, [disabled, isStartingCamera, stopCamera]);

  const handleCloseCamera = useCallback(() => {
    setCameraOpen(false);
    stopCamera();
  }, [stopCamera]);

  const handleCaptureFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError('Camera is not ready yet. Please try again.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      setCameraError('Unable to capture image from camera.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });

    if (!blob) {
      setCameraError('Unable to process captured image.');
      return;
    }

    const capturedFile = new File([blob], `fridge-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });

    onImageCapture(capturedFile);
    handleCloseCamera();
  }, [handleCloseCamera, onImageCapture]);

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
            <Button className="flex-1" onClick={handleCaptureFrame} disabled={disabled}>
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
      <div className="flex gap-4 flex-wrap justify-center">
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
        Use camera capture for a live shot, or upload from your photo library.
      </p>
    </div>
  );
};
