"use client";

import { useState } from "react";
import Link from "next/link";
import { urls } from "@aegis/url-builder";
import type { AegisEvent } from "@aegis/types";
import { CLASS_COLOR } from "@/lib/filter-config";
import { BottomSheet } from "./BottomSheet";

type Props = {
  event: AegisEvent | null;
  onClose: () => void;
};

export function MobileEventInspector({ event, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  if (!event) return null;

  const color = CLASS_COLOR[event.class];

  function handleShare() {
    const url = window.location.origin + urls.event("en", event!.eventId);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleGetSummary() {
    if (summary !== null) {
      setSummaryExpanded(true);
      return;
    }
    setSummaryExpanded(true);
    setSummaryLoading(true);
    fetch("/api/copilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Briefly explain this event in 2 sentences: " + event!.summary.en,
        country: "ua",
        hours: 24,
      }),
    })
      .then((r) => r.json())
      .then((j) => setSummary(j.result ?? j.text ?? j.summary ?? JSON.stringify(j)))
      .catch(() => setSummary("Unable to load summary."))
      .finally(() => setSummaryLoading(false));
  }

  return (
    <BottomSheet
      open={!!event}
      onClose={onClose}
      snapPoints={[250, 450]}
    >
      {/* Color accent bar */}
      <div
        className="-mx-4 mb-3 h-1"
        style={{ background: color, marginTop: "-4px" }}
      />

      {/* Class badge */}
      <div className="mb-2 flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: color }}
        />
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
          {event.class.replace(/_/g, " ")} · {event.subclass ?? "—"}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-text-primary leading-snug">
        {event.summary.en}
      </h3>

      {/* 3-column stats */}
      <dl className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <MobileStat label="Severity" value={`${event.severity}/5`} />
        <MobileStat label="Confidence" value={`${Math.round(event.confidence * 100)}%`} />
        <MobileStat label="Danger" value={`${event.dangerScore}`} />
      </dl>

      {/* Verification */}
      <div className="mt-3 text-[11px] text-text-muted">
        Verification:{" "}
        <span className="text-text-secondary">{event.verificationState}</span>
      </div>

      <div className="mt-1 text-[11px] text-text-muted">
        Occurred: <span className="text-text-secondary">{event.occurredAt}</span>
      </div>

      {/* AI Summary */}
      <div className="mt-3">
        {!summaryExpanded ? (
          <button
            onClick={handleGetSummary}
            className="flex items-center gap-1 rounded border border-border-subtle px-2 py-1 text-xs text-text-secondary hover:bg-bg-elevated"
          >
            <span>✦</span> Get AI summary
          </button>
        ) : (
          <div>
            <button
              onClick={() => setSummaryExpanded(false)}
              className="flex items-center gap-1 rounded border border-border-subtle px-2 py-1 text-xs text-text-secondary hover:bg-bg-elevated"
            >
              <span>✦</span> AI summary ▲
            </button>
            {summaryLoading ? (
              <span className="mt-2 block animate-pulse text-xs text-text-muted">Analyzing…</span>
            ) : summary !== null ? (
              <div className="mt-2 rounded bg-bg-base p-2 text-xs text-text-secondary leading-relaxed">
                {summary}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-2 pb-2">
        <button
          onClick={handleShare}
          className="flex items-center gap-1 rounded border border-border-subtle px-3 py-2 text-xs text-text-secondary hover:bg-bg-elevated"
        >
          <span>⎘</span> {copied ? "Copied!" : "Share"}
        </button>
        <button
          onClick={() => setPinned((p) => !p)}
          title="Pin to dashboard"
          className={`flex items-center gap-1 rounded border border-border-subtle px-3 py-2 text-xs hover:bg-bg-elevated ${
            pinned ? "text-accent" : "text-text-muted"
          }`}
        >
          {pinned ? "★" : "☆"}
        </button>
        <Link
          href={urls.event("en", event.eventId)}
          className="ml-auto rounded bg-accent px-4 py-2 text-xs font-semibold text-black hover:bg-accent-hover"
        >
          View full →
        </Link>
      </div>
    </BottomSheet>
  );
}

function MobileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border-subtle bg-bg-elevated px-2 py-2">
      <div className="font-mono text-[9px] uppercase tracking-wider text-text-muted">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-text-primary">{value}</div>
    </div>
  );
}
