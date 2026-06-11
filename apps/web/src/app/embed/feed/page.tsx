// Embeddable widget: compact vertical feed of last 10 events. Iframe-friendly.
import Link from "next/link";
import type { Metadata } from "next";
import { listEvents, eventsInCountry } from "@/lib/events-seed";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { timeAgo } from "@/lib/format";
import type { EventClass } from "@aegis/types";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Aegis Lens — Feed widget",
};

const CLASS_LABEL = Object.fromEntries(ALL_CLASSES.map((c) => [c.id, c.label])) as Record<
  string,
  string
>;

export default async function EmbedFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; class?: string; theme?: string }>;
}) {
  const sp = await searchParams;
  const light = sp.theme === "light";

  let events = sp.country ? eventsInCountry(sp.country) : listEvents();
  if (sp.class) {
    events = events.filter((e) => e.class === (sp.class as EventClass));
  }
  events = events
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, 10);

  const shell = light
    ? "min-h-screen bg-white text-neutral-900 p-3 font-sans text-sm"
    : "min-h-screen bg-bg-base text-text-primary p-3 font-sans text-sm";
  const card = light
    ? "block rounded border border-neutral-200 bg-neutral-50 p-2.5 hover:bg-neutral-100"
    : "block rounded border border-border-subtle bg-bg-surface p-2.5 hover:bg-bg-elevated";
  const muted = light ? "text-neutral-500" : "text-text-muted";

  return (
    <main className={shell}>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="font-mono text-[11px] uppercase tracking-wider">Live feed</h1>
        <span className={`font-mono text-[10px] ${muted}`}>{events.length} events</span>
      </div>
      <ul className="space-y-2">
        {events.map((e) => (
          <li key={e.eventId}>
            <Link href="/" target="_top" className={card}>
              <div className={`flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${muted}`}>
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: CLASS_COLOR[e.class] }}
                />
                <span>{CLASS_LABEL[e.class]}</span>
                <span>·</span>
                <span>danger {e.dangerScore}</span>
                <span>·</span>
                <span>{timeAgo(e.occurredAt, "en")}</span>
              </div>
              <div className="mt-1 text-xs leading-snug">{e.summary.en}</div>
            </Link>
          </li>
        ))}
        {events.length === 0 && (
          <li className={`rounded border border-dashed p-4 text-center text-xs ${muted}`}>
            No events.
          </li>
        )}
      </ul>
      <div className={`mt-3 text-right font-mono text-[10px] ${muted}`}>
        <Link href="/" target="_top" className="hover:underline">
          powered by Aegis Lens
        </Link>
      </div>
    </main>
  );
}
