"use client";

import { useCallback, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DraggableWindowProps {
  title: string;
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  children: ReactNode;
  className?: string;
  zIndex?: number;
  onFocus?: () => void;
}

export function DraggableWindow({
  title,
  initialX = 100,
  initialY = 100,
  initialWidth = 280,
  initialHeight = 380,
  minWidth = 180,
  minHeight = 120,
  children,
  className,
  zIndex = 10,
  onFocus,
}: DraggableWindowProps) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ w: initialWidth, h: initialHeight });

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onFocus?.();
      // Capture position at mousedown to calculate delta
      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      let currentX = pos.x;
      let currentY = pos.y;

      // Read live element position directly so midway positions work correctly
      const el = (e.currentTarget as HTMLElement).closest(
        "[data-drag-window]",
      ) as HTMLElement | null;
      if (el) {
        currentX = parseInt(el.style.left || String(pos.x), 10);
        currentY = parseInt(el.style.top || String(pos.y), 10);
      }

      const onMove = (ev: MouseEvent) => {
        setPos({
          x: Math.max(0, currentX + ev.clientX - startMouseX),
          y: Math.max(0, currentY + ev.clientY - startMouseY),
        });
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [onFocus, pos.x, pos.y],
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      const startW = size.w;
      const startH = size.h;

      const onMove = (ev: MouseEvent) => {
        setSize({
          w: Math.max(minWidth, startW + ev.clientX - startMouseX),
          h: Math.max(minHeight, startH + ev.clientY - startMouseY),
        });
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [minWidth, minHeight, size.w, size.h],
  );

  return (
    <div
      data-drag-window
      className={cn(
        "absolute flex flex-col rounded-2xl overflow-hidden",
        "bg-black/50 backdrop-blur-2xl",
        "border border-white/15 shadow-2xl shadow-black/70",
        className,
      )}
      style={{ left: pos.x, top: pos.y, width: size.w, height: size.h, zIndex }}
      onMouseDown={onFocus}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/5 cursor-grab active:cursor-grabbing select-none shrink-0"
        onMouseDown={handleDragStart}
      >
        <span className="text-white/90 text-xs font-semibold tracking-wide uppercase">
          {title}
        </span>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 custom-scrollbar">
        {children}
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize opacity-20 hover:opacity-60 transition-opacity"
        onMouseDown={handleResizeStart}
      >
        <svg viewBox="0 0 10 10" className="w-full h-full">
          <path d="M 10 0 L 10 10 L 0 10 Z" fill="white" />
        </svg>
      </div>
    </div>
  );
}

interface DraggableWindowProps {
  title: string;
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  children: ReactNode;
  className?: string;
  zIndex?: number;
  onFocus?: () => void;
}
