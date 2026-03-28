'use client';

import { Camera, ImageIcon, X } from '@phosphor-icons/react';
import Image from 'next/image';
import React, { useCallback, useRef } from 'react';

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
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
      <div className="flex gap-4 flex-wrap justify-center">
        <Button
          disabled={disabled}
          onClick={() => cameraInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 h-auto py-6 px-8"
        >
          <Camera className="h-8 w-8" />
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

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      <p className="text-sm text-muted-foreground text-center">
        Take a photo of your fridge or upload an existing image
      </p>
    </div>
  );
};
