import Link from "next/link";
import type { Metadata } from "next";
import { urls } from "@aegis/url-builder";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { eventsInCountry } from "@/lib/events-seed";
import type { EventClass } from "@aegis/types";

// ─── Topic metadata ───────────────────────────────────────────────────────────

type TopicMeta = {
  description: string;
  articles: number;
  icon: string;
};

const TOPIC_META: Record<string, TopicMeta> = {
  military_action: {
    description: "Strikes, troop movements, frontline changes, and tactical operations.",
    articles: 48,
    icon: "⚔",
  },
  civilian_alert: {
    description: "Air raid warnings, evacuation orders, and public safety notifications.",
    articles: 31,
    icon: "🚨",
  },
  infrastructure: {
    description: "Power grid, transport, water, and critical facility damage or disruption.",
    articles: 27,
    icon: "🏗",
  },
  humanitarian: {
    description: "Aid delivery, refugee movements, medical emergencies, and civilian needs.",
    articles: 22,
    icon: "🤝",
  },
  cyber: {
    description: "Digital attacks, data breaches, disinformation operations, and network disruptions.",
    articles: 19,
    icon: "💻",
  },
  maritime: {
    description: "Vessel movements, naval operations, and Black Sea corridor activity.",
    articles: 16,
    icon: "⚓",
  },
  aviation: {
    description: "Aircraft movements, airspace incidents, and aviation-related events.",
    articles: 14,
    icon: "✈",
  },
  environmental: {
    description: "Fire, flooding, pollution, and environmental impact from conflict operations.",
    articles: 11,
    icon: "🌿",
  },
  political: {
    description: "Diplomatic developments, government decisions, and geopolitical shifts.",
    articles: 24,
    icon: "🏛",
  },
  economic: {
    description: "Sanctions, market impacts, trade disruptions, and financial developments.",
    articles: 18,
    icon: "📊",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Topics — event-class hubs",
    description:
      "Browse intelligence by class: military action, infrastructure, cyber, maritime, humanitarian, and more.",
    pathFor: urls.topics,
  });
}

export default async function TopicsIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  // Event counts from seed (Ukraine bounding box)
  const uaEvents = eventsInCountry("ua");
  const eventCounts = uaEvents.reduce<Record<string, number>>((acc, e) => {
    acc[e.class] = (acc[e.class] ?? 0) + 1;
    return acc;
  }, {});

  const topics = ALL_CLASSES.map((c) => ({
    ...c,
    meta: TOPIC_META[c.id] ?? {
      description: `Recent ${c.label.toLowerCase()} events monitored by Aegis Lens.`,
      articles: 0,
      icon: "📋",
    },
    eventCount: eventCounts[c.id] ?? 0,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Topics"
        title="Intelligence Topics"
        description="Deep-dive hubs per event class. Each topic aggregates recent events, related trends, and field methodology."
      />
      <section className="mx-auto max-w-5xl px-4 py-10">
        {/* Summary row */}
        <div className="mb-6 flex items-center justify-between">
          <p className="font-mono text-[11px] text-text-muted">
            {topics.length} topic classes · {uaEvents.length} events in Ukraine seed
          </p>
        </div>

        {/* Card grid */}
        <ul className="grid gap-4 md:grid-cols-2">
          {topics.map((t) => (
            <li key={t.id}>
              <Link
                href={urls.topic(locale, t.id)}
                className="group flex h-full flex-col rounded border border-border-subtle bg-bg-surface p-5 transition-colors hover:border-accent/40 hover:bg-bg-elevated"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: CLASS_COLOR[t.id as EventClass] }}
                    />
                    <span className="text-base font-semibold text-text-primary">
                      {t.meta.icon} {t.label}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-accent opacity-0 transition-opacity group-hover:opacity-100">
                    Browse →
                  </span>
                </div>

                {/* Description */}
                <p className="mt-2 flex-1 text-sm text-text-secondary">
                  {t.meta.description}
                </p>

                {/* Stats footer */}
                <div className="mt-4 flex items-center gap-4 border-t border-border-subtle pt-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      Articles
                    </span>
                    <p className="mt-0.5 font-mono text-sm font-semibold text-text-primary">
                      {t.meta.articles}
                    </p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      Events (UA)
                    </span>
                    <p className="mt-0.5 font-mono text-sm font-semibold text-text-primary">
                      {t.eventCount}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-2 py-0.5 font-mono text-[10px] text-text-muted">
                      {t.id}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
