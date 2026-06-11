"use client";

import { useEffect, useRef, useCallback, type KeyboardEvent } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  width?: string;
  title?: string;
  children: React.ReactNode;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function Drawer({
  open,
  onClose,
  side = "right",
  width = "320px",
  title,
  children,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Scroll lock
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Auto-focus when opened
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => panelRef.current?.focus(), 0);
      return () => clearTimeout(id);
    }
  }, [open]);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      }
    },
    [],
  );

  // Determine transform for slide animation
  const translateClass =
    side === "left"
      ? open
        ? "translate-x-0"
        : "-translate-x-full"
      : open
        ? "translate-x-0"
        : "translate-x-full";

  const positionClass = side === "left" ? "left-0" : "right-0";

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={[
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm",
          "transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Drawer"}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        style={{ width }}
        className={[
          "fixed top-0 z-50 flex h-full flex-col border-border-subtle bg-bg-surface shadow-2xl outline-none",
          positionClass,
          side === "left" ? "border-r" : "border-l",
          "transition-transform duration-300 ease-in-out",
          translateClass,
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          {title ? (
            <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="rounded p-1 text-text-muted opacity-70 hover:opacity-100 hover:bg-bg-elevated transition-all"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </>
  );
}
