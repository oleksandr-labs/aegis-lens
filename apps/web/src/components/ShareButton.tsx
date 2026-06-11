"use client";

import { useState } from "react";

export function ShareButton({ url, title }: { url: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user cancelled or unsupported — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignored
    }
  }

  return (
    <button
      onClick={onClick}
      type="button"
      className="inline-flex items-center gap-1.5 rounded border border-border-default px-3 py-1.5 text-xs text-text-primary hover:bg-bg-surface"
      aria-label="Share permalink"
    >
      {copied ? (
        <>
          <span className="text-success">✓</span>
          <span>Copied</span>
        </>
      ) : (
        <>
          <span>↗</span>
          <span>Share permalink</span>
        </>
      )}
    </button>
  );
}
