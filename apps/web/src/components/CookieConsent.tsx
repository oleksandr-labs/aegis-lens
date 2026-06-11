"use client";

import { useCallback, useEffect, useState } from "react";
import { getConsent, setConsent, type ConsentValue } from "@/lib/consent";

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existing = getConsent();
    setVisible(existing === null);
  }, []);

  const decide = useCallback((value: ConsentValue) => {
    setConsent(value);
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        decide("essential");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, decide]);

  if (!mounted || !visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
    >
      <div className="rounded border border-border-subtle bg-bg-elevated p-4 shadow-xl">
        <p className="text-sm text-text-secondary leading-snug">
          We use essential cookies. Analytics cookies are optional.{" "}
          <a
            href="/legal/cookies"
            className="underline hover:text-text-primary"
          >
            Learn more
          </a>
          .
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => decide("all")}
            className="bg-accent text-bg-base px-3 py-1.5 rounded text-sm"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => decide("essential")}
            className="border border-border-default text-text-secondary hover:text-text-primary px-3 py-1.5 rounded text-sm"
          >
            Essential only
          </button>
        </div>
      </div>
    </div>
  );
}
