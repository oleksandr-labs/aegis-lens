"use client";

import { useState } from "react";

export function CopyEventIdButton({ eventId }: { eventId: string }) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(eventId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignored
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full items-center justify-between gap-2 rounded border border-border-default px-3 py-1.5 text-xs text-text-primary hover:bg-bg-elevated"
    >
      <span className="font-mono truncate text-text-muted">{eventId}</span>
      <span className="flex-shrink-0">
        {copied ? (
          <span className="text-success">✓ Copied</span>
        ) : (
          <span>Copy ID</span>
        )}
      </span>
    </button>
  );
}
