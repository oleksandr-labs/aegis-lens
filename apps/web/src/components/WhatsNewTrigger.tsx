"use client";

import { useState, useEffect, useCallback } from "react";
import { LATEST_VERSION } from "@/lib/changelog-data";
import { WhatsNewPanel } from "@/components/WhatsNewPanel";

const SEEN_KEY = `aegis_seen_v${LATEST_VERSION}`;

export function WhatsNewTrigger() {
  const [open, setOpen] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);

  useEffect(() => {
    try {
      setHasUnseen(!localStorage.getItem(SEEN_KEY));
    } catch {
      // localStorage unavailable (SSR / private browsing edge case)
    }
  }, []);

  const handleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleMarkRead = useCallback(() => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // ignore
    }
    setHasUnseen(false);
    setOpen(false);
  }, []);

  return (
    <>
      <button
        onClick={handleOpen}
        aria-label="What's new"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="What's new"
        className="relative rounded border border-border-subtle p-1.5 text-text-secondary hover:bg-bg-surface hover:text-text-primary"
      >
        {/* Sparkle / bell icon */}
        <span aria-hidden="true" className="text-sm leading-none">
          ✦
        </span>

        {/* Unread red dot */}
        {hasUnseen && (
          <span
            aria-label="Unread updates"
            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-1 ring-bg-base"
          />
        )}
      </button>

      {open && (
        <WhatsNewPanel onClose={handleClose} onMarkRead={handleMarkRead} />
      )}
    </>
  );
}
