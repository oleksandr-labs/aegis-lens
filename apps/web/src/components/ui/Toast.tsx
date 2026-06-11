"use client";

import { useEffect, useRef } from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
};

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-green-500/30 bg-green-500/10 text-green-400",
  error:   "border-red-500/30   bg-red-500/10   text-red-400",
  warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  info:    "border-accent/30     bg-accent/10     text-accent",
};

const VARIANT_ICONS: Record<ToastVariant, string> = {
  success: "✓",
  error:   "✕",
  warning: "⚠",
  info:    "ℹ",
};

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const delay = toast.duration ?? 4000;
    timerRef.current = setTimeout(() => onDismiss(toast.id), delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "flex items-start gap-3 rounded border px-4 py-3 shadow-lg",
        "text-sm font-medium",
        "animate-[toast-enter_0.2s_ease-out_both]",
        VARIANT_STYLES[toast.variant],
      ].join(" ")}
    >
      <span className="mt-px shrink-0 text-base leading-none" aria-hidden="true">
        {VARIANT_ICONS[toast.variant]}
      </span>
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="ml-2 shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}
