import type { Metadata } from "next";
import { urls } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { eventsInCountry } from "@/lib/events-seed";
import { DashboardClient } from "./DashboardClient";
import type { EventClass } from "@aegis/types";

// ─── Static params ──────────────────────────────────────────────────────────

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

// ─── Metadata ────────────────────────────────────────────────────────────────

const TITLE = "Analyst Dashboard";
const DESCRIPTION =
  "Bloomberg Terminal-style workspace: real-time event feed, class breakdown, AI briefs and alert rules for Ukraine.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: TITLE,
    description: DESCRIPTION,
    pathFor: (lc) => urls.dashboard(lc),
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  // Seed data — replace with DB once Postgres + PostGIS lands
  const allEvents = eventsInCountry("ua");
  const recentEvents = allEvents.slice(0, 10);

  // Compute class breakdown
  const classCounts = new Map<EventClass, number>();
  for (const ev of allEvents) {
    classCounts.set(ev.class, (classCounts.get(ev.class) ?? 0) + 1);
  }
  const totalEvents = allEvents.length;

  const classBreakdown = ALL_CLASSES.map((c) => ({
    ...c,
    count: classCounts.get(c.id) ?? 0,
    pct: totalEvents > 0 ? ((classCounts.get(c.id) ?? 0) / totalEvents) * 100 : 0,
    color: CLASS_COLOR[c.id],
  })).sort((a, b) => b.count - a.count);

  // KPI values
  const avgDanger =
    allEvents.length > 0
      ? Math.round(allEvents.reduce((s, e) => s + e.dangerScore, 0) / allEvents.length)
      : 0;
  const topClass = classBreakdown[0]?.label ?? "—";
  const topClassCount = classBreakdown[0]?.count ?? 0;

  // Static alert rules
  const alertRules = [
    { id: 1, name: "Military UA",   cls: "military_action" as EventClass, active: true  },
    { id: 2, name: "Cyber attacks", cls: "cyber"           as EventClass, active: true  },
    { id: 3, name: "Civilian Kyiv", cls: "civilian_alert"  as EventClass, active: false },
  ];

  return (
    <DashboardClient
      events={allEvents}
      recentEvents={recentEvents}
      classBreakdown={classBreakdown}
      totalEvents={totalEvents}
      avgDanger={avgDanger}
      topClass={topClass}
      topClassCount={topClassCount}
      alertRules={alertRules}
      locale={locale}
    />
  );
}
