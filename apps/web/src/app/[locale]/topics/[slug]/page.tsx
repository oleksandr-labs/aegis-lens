import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { urls } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import type { EventClass } from "@aegis/types";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { eventsInCountry } from "@/lib/events-seed";
import { timeAgo, formatDateTime } from "@/lib/format";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export const dynamicParams = false;
export const revalidate = 3600; // 1 hour — ISR for topic pages

export function generateStaticParams() {
  const out: Params[] = [];
  for (const c of ALL_CLASSES) {
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, slug: c.id });
    }
  }
  return out;
}

function classByIdSafe(slug: string): { id: EventClass; label: string } | null {
  return ALL_CLASSES.find((c) => c.id === slug) ?? null;
}

// ─── Topic metadata (mirrored from topics/page.tsx) ──────────────────────────

type TopicMeta = { description: string; articles: number; icon: string };

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

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const cls = classByIdSafe(slug);
  if (!cls) return { robots: { index: false } };
  const meta = TOPIC_META[slug];
  return buildMetadata({
    locale,
    title: `${cls.label} — topic hub`,
    description:
      meta?.description ??
      `Recent ${cls.label.toLowerCase()} events monitored by Aegis Lens.`,
    pathFor: (lc) => urls.topic(lc, slug),
    feeds: [
      {
        type: "application/rss+xml",
        href: urls.topicFeed(locale, slug),
        title: `${cls.label} — events (RSS)`,
      },
      {
        type: "application/atom+xml",
        href: urls.topicAtomLocale(locale, slug),
        title: `${cls.label} — events (Atom)`,
      },
      {
        type: "application/feed+json",
        href: urls.topicJsonLocale(locale, slug),
        title: `${cls.label} — events (JSON Feed)`,
      },
    ],
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TopicPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const cls = classByIdSafe(slug);
  if (!cls) notFound();

  const meta = TOPIC_META[slug] ?? {
    description: `Recent ${cls.label.toLowerCase()} events.`,
    articles: 0,
    icon: "📋",
  };

  // Events in Ukraine matching this class
  const events = eventsInCountry("ua")
    .filter((e) => e.class === cls.id)
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));

  // Related topics — adjacent classes (prev 2 + next 2)
  const classIndex = ALL_CLASSES.findIndex((c) => c.id === slug);
  const relatedTopics = ALL_CLASSES.filter((_, i) => {
    const dist = Math.abs(i - classIndex);
    return dist > 0 && dist <= 2;
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${cls.label} events`,
    description: meta.description,
    url: `${SITE.url}${urls.topic(locale, slug)}`,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: events.length,
      itemListElement: events.map((e, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: e.summary.en,
        url: `${SITE.url}${urls.event(locale, e.eventId)}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow="Topic"
        title={`${meta.icon} ${cls.label}`}
        description={meta.description}
      />

      <section className="mx-auto max-w-4xl px-4 py-10">
        {/* Identity + stats strip */}
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded border border-border-subtle bg-bg-surface p-4">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: CLASS_COLOR[cls.id] }}
            />
            <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
              {slug}
            </span>
          </div>

          <div className="flex gap-6">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Articles
              </span>
              <p className="font-mono text-base font-semibold text-text-primary">{meta.articles}</p>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Events (UA)
              </span>
              <p className="font-mono text-base font-semibold text-text-primary">{events.length}</p>
            </div>
          </div>

          {/* Subscribe to alerts CTA */}
          <div className="ml-auto">
            <Link
              href={`/${locale}/alerts?topic=${slug}`}
              className="inline-flex items-center gap-1.5 rounded border border-accent/30 bg-accent/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-accent hover:border-accent/60"
            >
              Subscribe to alerts →
            </Link>
          </div>
        </div>

        {/* Recent events */}
        {events.length === 0 ? (
          <div className="rounded border border-border-subtle bg-bg-surface p-6 text-sm text-text-muted">
            No events in this class right now.
          </div>
        ) : (
          <>
            <h2 className="mb-3 text-base font-semibold text-text-primary">Recent events</h2>
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.eventId}>
                  <Link
                    href={urls.event(locale, e.eventId)}
                    className="block rounded border border-border-subtle bg-bg-surface p-4 hover:bg-bg-elevated"
                  >
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      <span>{e.subclass}</span>
                      <span>·</span>
                      <span>{formatDateTime(e.occurredAt, locale)}</span>
                      <span>·</span>
                      <span>{timeAgo(e.occurredAt, locale)}</span>
                    </div>
                    <div className="mt-1 text-sm text-text-primary">
                      {e.summary[locale] ?? e.summary.en}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Open on map */}
        <div className="mt-8 text-xs">
          <Link
            href={`${urls.map(locale)}?class=${slug}`}
            className="rounded border border-border-default px-3 py-2 text-text-primary hover:bg-bg-surface"
          >
            Open on live map →
          </Link>
        </div>

        {/* Related topics */}
        {relatedTopics.length > 0 && (
          <div className="mt-12 border-t border-border-subtle pt-6">
            <h2 className="mb-3 text-base font-semibold text-text-primary">Related topics</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {relatedTopics.map((rt) => {
                const rtMeta = TOPIC_META[rt.id];
                return (
                  <li key={rt.id}>
                    <Link
                      href={urls.topic(locale, rt.id)}
                      className="flex items-center gap-3 rounded border border-border-subtle bg-bg-surface px-4 py-3 text-sm hover:bg-bg-elevated"
                    >
                      <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: CLASS_COLOR[rt.id as EventClass] }}
                      />
                      <div>
                        <span className="font-medium text-text-primary">
                          {rtMeta?.icon ?? ""} {rt.label}
                        </span>
                        {rtMeta && (
                          <p className="mt-0.5 text-xs text-text-muted line-clamp-1">
                            {rtMeta.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
