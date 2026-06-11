"use client";

import { useState, useEffect } from "react";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[]; // heights in px [200, 400, 600]
  defaultSnap?: number;  // index into snapPoints
};

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  snapPoints = [300, 500],
  defaultSnap = 0,
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(defaultSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // Reset snap index when opened
  useEffect(() => {
    if (open) setCurrentSnap(defaultSnap);
  }, [open, defaultSnap]);

  // Prevent body scroll while sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Bottom sheet"}
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border-subtle bg-bg-surface shadow-2xl"
        style={{
          height: snapPoints[currentSnap],
          transform: `translateY(${Math.max(0, offsetY)}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease, height 0.3s ease",
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          setStartY(e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          setOffsetY(e.touches[0].clientY - startY);
        }}
        onTouchEnd={() => {
          if (offsetY > 100) {
            onClose();
          } else if (offsetY < -100 && currentSnap < snapPoints.length - 1) {
            setCurrentSnap((s) => s + 1);
          }
          setIsDragging(false);
          setOffsetY(0);
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-border-default" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-4 pb-2">
            <h2 className="font-semibold text-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-text-muted hover:bg-bg-elevated hover:text-text-primary"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}

        {/* Snap point buttons (when multiple snap points) */}
        {snapPoints.length > 1 && (
          <div className="absolute right-4 top-3 flex gap-1">
            {snapPoints.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSnap(i)}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === currentSnap ? "bg-accent" : "bg-border-default"
                }`}
                aria-label={`Snap to height ${snapPoints[i]}px`}
              />
            ))}
          </div>
        )}

        <div
          className="overflow-y-auto px-4 pb-safe"
          style={{ height: "calc(100% - 60px)" }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
