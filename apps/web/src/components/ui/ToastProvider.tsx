"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Toast, type ToastItem, type ToastVariant } from "./Toast";

// ── Context ──────────────────────────────────────────────────────────────────

type ToastContextValue = {
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider />");
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────────────────────

let _counter = 0;
function uid() {
  return `toast-${++_counter}-${Date.now()}`;
}

export function ToastProvider({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info", duration = 4000) => {
      setToasts((prev) => [...prev, { id: uid(), message, variant, duration }]);
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Listen for fire-and-forget events from toast-store.ts
  useEffect(() => {
    function handler(e: Event) {
      const { message, variant, duration } = (e as CustomEvent).detail ?? {};
      if (typeof message === "string") addToast(message, variant, duration);
    }
    window.addEventListener("aegis:toast", handler);
    return () => window.removeEventListener("aegis:toast", handler);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast viewport */}
      <div
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
