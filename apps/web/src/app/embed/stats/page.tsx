// Embeddable widget: 2x2 KPI tiles (total events, last 24h, avg danger, top class).
import Link from "next/link";
import type { Metadata } from "next";
import { listEvents, eventsInCountry } from "@/lib/events-seed";
import { ALL_CLASSES } from "@/lib/filter-config";
import type { EventClass } from "@aegis/types";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Aegis Lens — Stats widget",
};

const CLASS_LABEL = Object.fromEntries(ALL_CLASSES.map((c) => [c.id, c.label])) as Record<
  string,
  string
>;

export default async function EmbedStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; class?: string; theme?: string }>;
}) {
  const sp = await searchParams;
  const light = sp.theme === "light";

  let events = sp.country ? eventsInCountry(sp.country) : listEvents();
  if (sp.class) events = events.filter((e) => e.class === (sp.class as EventClass));

  const total = events.length;
  const cutoff = Date.now() - 24 * 3600 * 1000;
  const last24 = events.filter((e) => Date.parse(e.occurredAt) >= cutoff).length;
  const avgDanger =
    total === 0 ? 0 : Math.round(events.reduce((acc, e) => acc + e.dangerScore, 0) / total);

  const counts = new Map<EventClass, number>();
  for (const e of events) counts.set(e.class, (counts.get(e.class) ?? 0) + 1);
  let topClass: EventClass | null = null;
  let topN = 0;
  for (const [k, v] of counts) {
    if (v > topN) {
      topN = v;
      topClass = k;
    }
  }

  const shell = light
    ? "min-h-screen bg-white text-neutral-900 p-3 font-sans text-sm"
    : "min-h-screen bg-bg-base text-text-primary p-3 font-sans text-sm";
  const tile = light
    ? "rounded border border-neutral-200 bg-neutral-50 p-3"
    : "rounded border border-border-subtle bg-bg-surface p-3";
  const muted = light ? "text-neutral-500" : "text-text-muted";
  const accent = light ? "text-blue-600" : "text-accent";

  const tiles: { label: string; value: string; tone?: string }[] = [
    { label: "Total events", value: String(total) },
    { label: "Last 24h", value: String(last24), tone: accent },
    { label: "Avg danger", value: String(avgDanger), tone: accent },
    {
      label: "Top class",
      value: topClass ? `${CLASS_LABEL[topClass]} (${topN})` : "—",
    },
  ];

  return (
    <main className={shell}>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="font-mono text-[11px] uppercase tracking-wider">Stats</h1>
        <span className={`font-mono text-[10px] ${muted}`}>
          {sp.country ? sp.country.toUpperCase() : "global"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {tiles.map((t) => (
          <div key={t.label} className={tile}>
            <div className={`font-mono text-[10px] uppercase tracking-wider ${muted}`}>
              {t.label}
            </div>
            <div className={`mt-1 text-xl font-semibold ${t.tone ?? ""}`}>{t.value}</div>
          </div>
        ))}
      </div>
      <div className={`mt-3 text-right font-mono text-[10px] ${muted}`}>
        <Link href="/" target="_top" className="hover:underline">
          powered by Aegis Lens
        </Link>
      </div>
    </main>
  );
}
