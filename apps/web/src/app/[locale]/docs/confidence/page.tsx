import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Confidence scoring — developer guide";
const DESCRIPTION =
  "How to use the confidence score in your application: thresholds, filter parameters, anti-patterns, and TypeScript helpers for classifying confidence levels.";

const PRE_CLASS =
  "rounded border border-border-subtle bg-bg-elevated p-4 font-mono text-xs text-text-secondary overflow-x-auto whitespace-pre";

const INLINE = "rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-[11px] text-text-primary";

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
    pathFor: (lc) => localePath(lc, "/docs/confidence"),
  });
}

export default async function ConfidenceDevGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: TITLE,
    description: DESCRIPTION,
    inLanguage: locale,
    author: { "@type": "Organization", name: "Aegis Lens" },
    publisher: { "@type": "Organization", name: "Aegis Lens" },
  };

  return (
    <>
      <PageHeader eyebrow="Docs" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-4xl px-4 py-10 text-text-secondary">
        <p>
          The <strong className="text-text-primary">confidence</strong> field on every Aegis Lens
          event is a float between 0 and 1 expressing how certain we are that the event occurred
          as described. This guide shows you how to use it effectively in your application —
          filtering, routing, and display — and explains the anti-patterns that trip up most
          integrations.
        </p>

        {/* ── Score range thresholds ── */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Score range thresholds</h2>
          <p className="mt-3">
            Confidence is returned as a float 0–1 in event objects but accepted as an integer
            0–100 in filter query parameters. The table below maps ranges to recommended use
            cases:
          </p>
          <div className="mt-4 overflow-x-auto rounded border border-border-subtle">
            <table className="w-full text-sm">
              <thead className="bg-bg-elevated">
                <tr className="border-b border-border-subtle">
                  <th className="px-4 py-2 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
                    Range (0–1)
                  </th>
                  <th className="px-4 py-2 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
                    Label
                  </th>
                  <th className="px-4 py-2 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
                    Recommended use
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {[
                  ["0.80 – 1.00", "High", "Operational decision-making, real-time alerts, public dashboards."],
                  ["0.60 – 0.79", "Good", "Recommended minimum for alert routing. Cross-check before action."],
                  ["0.40 – 0.59", "Moderate", "Situational awareness and internal monitoring. Not for public display."],
                  ["0.30 – 0.39", "Low", "Research / analyst tools only. Hidden from public map by default."],
                  ["0.00 – 0.29", "Very low", "Available only to licensed data partners via ?include_low=true."],
                ].map(([range, label, use]) => (
                  <tr key={range} className="bg-bg-surface">
                    <td className="w-32 px-4 py-2 font-mono text-[11px] text-text-primary align-top whitespace-nowrap">
                      {range}
                    </td>
                    <td className="w-24 px-4 py-2 text-text-muted align-top">{label}</td>
                    <td className="px-4 py-2 text-text-secondary">{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-8 text-lg font-semibold text-text-primary">Filtering by confidence</h3>
          <p className="mt-2">
            Use <code className={INLINE}>minConfidence</code> (integer 0–100) to exclude low-signal
            events. Filter for only high-confidence events:
          </p>
          <pre className={`mt-3 ${PRE_CLASS}`}>
            <code>{`GET https://aegislens.io/api/events?country=ua&minConfidence=70

# Returns events with confidence ≥ 0.70.
# Pair with minDanger for operational alert feeds:

GET https://aegislens.io/api/events?country=ua&minConfidence=60&minDanger=40`}</code>
          </pre>
        </section>

        {/* ── How confidence changes over time ── */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            How confidence changes over time
          </h2>
          <p className="mt-3">
            Confidence is not static. It is recalculated whenever a new source cites the event or
            an existing source is re-evaluated. The typical lifecycle looks like this:
          </p>

          {/* CSS timeline diagram */}
          <div className="mt-6 space-y-0">
            {[
              {
                label: "T+0 — First report",
                bar: "w-1/5",
                note: "Single tier-3 source. Score: ~0.30. Visible only in API.",
                color: "bg-text-muted",
              },
              {
                label: "T+1 h — Corroboration",
                bar: "w-2/5",
                note: "Second independent source confirms. Score rises to ~0.55.",
                color: "bg-yellow-500",
              },
              {
                label: "T+3 h — Imagery match",
                bar: "w-3/5",
                note: "Geolocation confirmed via satellite imagery. Score ~0.78.",
                color: "bg-orange-400",
              },
              {
                label: "T+6 h — Official ack",
                bar: "w-4/5",
                note: "Government body acknowledges event. Score reaches ~0.92.",
                color: "bg-accent",
              },
              {
                label: "T+12 h — Stabilised",
                bar: "w-full",
                note: "≥3 independent confirmations. Score stabilises; decay stops.",
                color: "bg-accent",
              },
            ].map(({ label, bar, note, color }) => (
              <div
                key={label}
                className="flex items-start gap-4 border-l-2 border-border-subtle py-4 pl-4"
              >
                <div className="w-40 shrink-0">
                  <span className="font-mono text-[11px] text-text-muted">{label}</span>
                </div>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-bg-elevated">
                    <div className={`h-2 rounded-full transition-all ${bar} ${color}`} />
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">{note}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm">
            Events that are not corroborated within 6 hours see a slow decay applied to the base
            score. Once three independent sources confirm, the decay stops and the score stabilises.
            Retracted events have their confidence floor-clamped to 0 regardless of prior history.
          </p>
        </section>

        {/* ── Anti-patterns ── */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Anti-patterns to avoid</h2>

          <div className="mt-6 space-y-6">
            <div className="rounded border border-border-subtle bg-bg-surface p-5">
              <h3 className="font-semibold text-text-primary">
                Don&apos;t use confidence as a proxy for severity
              </h3>
              <p className="mt-2 text-sm">
                A confirmed near-miss has high confidence (0.95) and low danger (15). An unconfirmed
                credible threat to a power hub has low confidence (0.42) and high danger (85). These
                are independent dimensions. Filter on both:{" "}
                <code className={INLINE}>minConfidence=60&minDanger=40</code>.
              </p>
            </div>

            <div className="rounded border border-border-subtle bg-bg-surface p-5">
              <h3 className="font-semibold text-text-primary">
                Don&apos;t hard-code confidence thresholds as permanent rules
              </h3>
              <p className="mt-2 text-sm">
                During a breaking event, the useful confidence floor may need to drop temporarily
                to <code className={INLINE}>0.40</code> to capture early intelligence. Make
                thresholds configurable in your application rather than constants in code.
              </p>
            </div>

            <div className="rounded border border-border-subtle bg-bg-surface p-5">
              <h3 className="font-semibold text-text-primary">
                Don&apos;t cache event objects indefinitely
              </h3>
              <p className="mt-2 text-sm">
                Confidence changes as new sources arrive. If you cache event objects, set a
                short TTL (5–15 minutes) and re-fetch on{" "}
                <code className={INLINE}>updatedAt</code> change. Webhooks are the preferred
                pattern for keeping your store fresh.
              </p>
            </div>

            <div className="rounded border border-border-subtle bg-bg-surface p-5">
              <h3 className="font-semibold text-text-primary">
                Don&apos;t display raw confidence floats to end users
              </h3>
              <p className="mt-2 text-sm">
                A confidence of 0.78 means nothing to most users. Map it to a human label
                (High / Good / Moderate / Low) before display. The TypeScript helper below
                does this.
              </p>
            </div>
          </div>
        </section>

        {/* ── TypeScript helper ── */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            TypeScript: classify confidence level
          </h2>
          <p className="mt-3">
            Drop this helper into your codebase to map the raw float to a display label and
            routing tier:
          </p>
          <pre className={`mt-4 ${PRE_CLASS}`}>
            <code>{`export type ConfidenceLevel =
  | "high"
  | "good"
  | "moderate"
  | "low"
  | "very_low";

export interface ConfidenceInfo {
  level: ConfidenceLevel;
  label: string;
  /** Suitable for public display? */
  isPublic: boolean;
  /** Suitable for operational alert routing? */
  isActionable: boolean;
}

export function classifyConfidence(confidence: number): ConfidenceInfo {
  // confidence is a float 0–1 from the API
  if (confidence >= 0.8) {
    return {
      level: "high",
      label: "High confidence",
      isPublic: true,
      isActionable: true,
    };
  }
  if (confidence >= 0.6) {
    return {
      level: "good",
      label: "Good confidence",
      isPublic: true,
      isActionable: true,
    };
  }
  if (confidence >= 0.4) {
    return {
      level: "moderate",
      label: "Moderate confidence",
      isPublic: false,
      isActionable: false,
    };
  }
  if (confidence >= 0.3) {
    return {
      level: "low",
      label: "Low confidence",
      isPublic: false,
      isActionable: false,
    };
  }
  return {
    level: "very_low",
    label: "Very low confidence",
    isPublic: false,
    isActionable: false,
  };
}

// Usage:
// const info = classifyConfidence(event.confidence);
// if (info.isActionable) sendAlert(event);`}</code>
          </pre>
        </section>

        {/* ── Further reading ── */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Further reading</h2>
          <ul className="mt-4 space-y-2">
            <li>
              <Link
                href={localePath(locale, "/methodology")}
                className="text-text-primary underline underline-offset-2"
              >
                Full scoring methodology
              </Link>{" "}
              — inputs, weights, and the full formula for both confidence and danger score.
            </li>
            <li>
              <Link
                href={localePath(locale, "/docs/schema")}
                className="text-text-primary underline underline-offset-2"
              >
                Event schema reference
              </Link>{" "}
              — all fields on the event object, including{" "}
              <code className={INLINE}>verificationState</code> and{" "}
              <code className={INLINE}>dangerScore</code>.
            </li>
            <li>
              <Link
                href={localePath(locale, "/docs/osint-guide")}
                className="text-text-primary underline underline-offset-2"
              >
                OSINT methodology guide
              </Link>{" "}
              — source tiers, the 7-step verification pipeline, and editorial independence.
            </li>
            <li>
              <Link
                href={localePath(locale, "/scoring/confidence")}
                className="text-text-primary underline underline-offset-2"
              >
                Confidence scoring explainer (non-technical)
              </Link>{" "}
              — the user-facing version of this page, suitable for sharing with non-developer
              stakeholders.
            </li>
          </ul>
        </section>
      </article>
    </>
  );
}
