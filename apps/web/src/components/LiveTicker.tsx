"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AegisEvent } from "@aegis/types";
import { urls } from "@aegis/url-builder";
import { CLASS_COLOR, ALL_CLASSES } from "@/lib/filter-config";
import { timeAgo } from "@/lib/format";
import type { Locale } from "@aegis/i18n-config";

const LABEL = Object.fromEntries(ALL_CLASSES.map((c) => [c.id, c.label])) as Record<string, string>;

export function LiveTicker({ locale }: { locale: Locale }) {
  const [events, setEvents] = useState<AegisEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/api/events?country=ua&hours=24&limit=12")
        .then((r) => r.json())
        .then((j) => {
          if (!cancelled) setEvents(j.data ?? []);
        })
        .catch(() => {});
    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="overflow-hidden border-y border-border-subtle bg-bg-elevated">
      <div className="flex items-center gap-6 overflow-x-auto px-4 py-3 text-xs">
        <span className="flex-none font-mono uppercase tracking-widest text-accent">
          ● live · last 24h
        </span>
        <ul className="flex items-center gap-6 whitespace-nowrap">
          {events.map((e) => (
            <li key={e.eventId} className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: CLASS_COLOR[e.class] }}
              />
              <Link
                href={urls.event(locale, e.eventId)}
                className="text-text-secondary hover:text-text-primary"
              >
                <span className="font-mono uppercase text-text-muted">{LABEL[e.class]}</span>
                {" "}
                <span>{e.summary[locale] ?? e.summary.en}</span>
                {" "}
                <span className="text-text-muted">· {timeAgo(e.occurredAt, locale)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
