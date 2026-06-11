"use client";

import { useEffect, useState } from "react";

const LS_KEY = "aegis_welcome_dismissed";

export function WelcomeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(LS_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="border-b border-accent/20 bg-accent/5 px-4 py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm">
          <span className="font-mono text-accent text-[10px] uppercase tracking-widest">
            New
          </span>
          <span className="text-text-primary">
            Aegis Lens is in open beta —{" "}
            <a href="/changelog" className="text-accent hover:underline">
              see what's new
            </a>
          </span>
        </div>
        <button
          onClick={() => {
            localStorage.setItem(LS_KEY, "1");
            setVisible(false);
          }}
          className="text-text-muted hover:text-text-primary text-xs"
          aria-label="Dismiss welcome banner"
        >
          Dismiss ✕
        </button>
      </div>
    </div>
  );
}
