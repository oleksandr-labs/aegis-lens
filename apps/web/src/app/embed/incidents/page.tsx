// Embeddable widget: top 10 high-severity incidents (danger >= 70, confidence >= 0.7).
import Link from "next/link";
import type { Metadata } from "next";
import { listEvents, eventsInCountry } from "@/lib/events-seed";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { timeAgo } from "@/lib/format";
import type { EventClass } from "@aegis/types";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Aegis Lens — Incidents widget",
};

const DANGER_MIN = 70;
const CONFIDENCE_MIN = 0.7;

const CLASS_LABEL = Object.fromEntries(ALL_CLASSES.map((c) => [c.id, c.label])) as Record<
  string,
  string
>;

function dangerTier(score: number): string {
  if (score >= 90) return "border-red-500/50 bg-red-500/10 text-red-300";
  if (score >= 80) return "border-orange-500/50 bg-orange-500/10 text-orange-300";
  return "border-yellow-500/50 bg-yellow-500/10 text-yellow-200";
}

export default async function EmbedIncidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; class?: string; theme?: string }>;
}) {
  const sp = await searchParams;
  const light = sp.theme === "light";

  let pool = sp.country ? eventsInCountry(sp.country) : listEvents();
  if (sp.class) pool = pool.filter((e) => e.class === (sp.class as EventClass));

  const incidents = pool
    .filter((e) => e.dangerScore >= DANGER_MIN && e.confidence >= CONFIDENCE_MIN)
    .sort((a, b) => b.dangerScore - a.dangerScore)
    .slice(0, 10);

  const shell = light
    ? "min-h-screen bg-white text-neutral-900 p-3 font-sans text-sm"
    : "min-h-screen bg-bg-base text-text-primary p-3 font-sans text-sm";
  const card = light
    ? "block rounded border border-neutral-200 bg-neutral-50 p-3 hover:bg-neutral-100"
    : "block rounded border border-border-subtle bg-bg-surface p-3 hover:bg-bg-elevated";
  const muted = light ? "text-neutral-500" : "text-text-muted";

  return (
    <main className={shell}>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="font-mono text-[11px] uppercase tracking-wider">Top incidents</h1>
        <span className={`font-mono text-[10px] ${muted}`}>{incidents.length} active</span>
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {incidents.map((e) => (
          <li key={e.eventId}>
            <Link href="/" target="_top" className={card}>
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider">
                <span className={`inline-flex items-center rounded border px-1.5 py-0.5 ${dangerTier(e.dangerScore)}`}>
                  danger {e.dangerScore}
                </span>
                <span className={`inline-flex items-center gap-1 ${muted}`}>
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: CLASS_COLOR[e.class] }}
                  />
                  {CLASS_LABEL[e.class]}
                </span>
              </div>
              <div className="mt-1.5 text-xs leading-snug">{e.summary.en}</div>
              <div className={`mt-1.5 font-mono text-[10px] ${muted}`}>
                conf {Math.round(e.confidence * 100)}% · {timeAgo(e.occurredAt, "en")}
              </div>
            </Link>
          </li>
        ))}
        {incidents.length === 0 && (
          <li className={`col-span-full rounded border border-dashed p-4 text-center text-xs ${muted}`}>
            All clear.
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
