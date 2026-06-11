"use client";

import { useState } from "react";

export function PinToDashboardButton() {
  const [pinned, setPinned] = useState(false);

  function onClick() {
    window.dispatchEvent(
      new CustomEvent("aegis:palette-action", {
        detail: { action: "create-case" },
      }),
    );
    setPinned(true);
    setTimeout(() => setPinned(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full items-center justify-center gap-1.5 rounded border border-border-default px-3 py-1.5 text-xs text-text-primary hover:bg-bg-elevated"
    >
      {pinned ? (
        <>
          <span className="text-success">✓</span>
          <span>Pinned to dashboard</span>
        </>
      ) : (
        <>
          <span>📌</span>
          <span>Pin to dashboard</span>
        </>
      )}
    </button>
  );
}
