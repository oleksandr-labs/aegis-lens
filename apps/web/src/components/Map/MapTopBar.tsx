"use client";

import { useRef, useState } from "react";
import { useFilters } from "@/lib/use-filters";
import { COUNTRIES } from "@/lib/filter-config";

const COUNTRY_QUICK_JUMP = COUNTRIES as unknown as string[];

export function MapTopBar() {
  const f = useFilters();
  const searchRef = useRef<HTMLInputElement>(null);
  const [isLive, setIsLive] = useState(false);

  function handleToggleLive() {
    window.dispatchEvent(new CustomEvent("aegis:toggle-live-mode"));
    setIsLive((prev) => !prev);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchRef.current?.value.trim();
    if (q) {
      window.location.href = `/search?q=${encodeURIComponent(q)}`;
    }
  }

  function handleAlerts() {
    window.location.href = "/alerts";
  }

  function handleCommandPalette() {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
    );
  }

  return (
    <div className="flex h-10 shrink-0 items-center gap-3 border-b border-border-subtle bg-bg-elevated px-3 text-xs">
      {/* Left — branding + live status */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
          AEGIS MAP
        </span>
        <span className="text-border-default">|</span>
        <button
          onClick={handleToggleLive}
          aria-label={isLive ? "Pause live updates" : "Enable live updates"}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-bg-surface transition-colors"
          title={isLive ? "Click to pause live event stream" : "Click to start live event stream"}
        >
          <span className="relative flex h-2 w-2">
            {isLive ? (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </>
            ) : (
              <span className="relative inline-flex h-2 w-2 rounded-full bg-text-muted" />
            )}
          </span>
          <span
            className={`font-mono text-[10px] ${
              isLive ? "text-green-400" : "text-text-muted"
            }`}
          >
            {isLive ? "LIVE" : "PAUSED"}
          </span>
        </button>
      </div>

      {/* Center — search */}
      <form onSubmit={handleSearch} className="flex flex-1 justify-center">
        <input
          ref={searchRef}
          type="search"
          placeholder="Search events, regions, equipment…"
          className="w-full max-w-md rounded border border-border-subtle bg-bg-base px-3 py-1 text-text-primary outline-none focus:border-accent"
        />
      </form>

      {/* Right — country jump, alerts, command palette */}
      <div className="flex items-center gap-1">
        {/* Country quick-jump */}
        {COUNTRY_QUICK_JUMP.map((code) => (
          <button
            key={code}
            onClick={() => f.setCountry(code)}
            className={`rounded px-2 py-1 font-mono text-[10px] uppercase hover:bg-bg-surface ${
              f.country === code
                ? "bg-bg-surface text-text-primary"
                : "text-text-muted"
            }`}
          >
            {code}
          </button>
        ))}

        <span className="mx-1 text-border-default">|</span>

        {/* Alerts bell */}
        <button
          onClick={handleAlerts}
          aria-label="View alerts"
          className="relative rounded p-1 text-text-muted hover:bg-bg-surface hover:text-text-primary"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            3
          </span>
        </button>

        <span className="mx-1 text-border-default">|</span>

        {/* Command palette trigger */}
        <button
          onClick={handleCommandPalette}
          aria-label="Open command palette"
          className="rounded border border-border-subtle px-2 py-1 font-mono text-[10px] text-text-muted hover:bg-bg-surface hover:text-text-primary"
        >
          ⌘K
        </button>
      </div>
    </div>
  );
}
