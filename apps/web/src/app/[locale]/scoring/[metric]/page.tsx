import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SCORE_METRICS, getScoreMetric } from "@/lib/scores-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; metric: string };

// ─── Supported metrics (seed slugs + severity page) ──────────────────────────

const EXTENDED_METRICS = ["confidence", "danger", "severity"] as const;
type ExtendedMetric = (typeof EXTENDED_METRICS)[number];

function isExtendedMetric(s: string): s is ExtendedMetric {
  return (EXTENDED_METRICS as readonly string[]).includes(s);
}

// ─── generateStaticParams ────────────────────────────────────────────────────

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  // Existing seed-driven slugs
  for (const m of SCORE_METRICS) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, metric: m.slug });
  }
  // severity is not in scores-seed yet — add it manually
  for (const lc of ACTIVE_LOCALES) {
    if (!out.find((p) => p.locale === lc && p.metric === "severity")) {
      out.push({ locale: lc, metric: "severity" });
    }
  }
  return out;
}

// ─── generateMetadata ────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, metric } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const seedMetric = getScoreMetric(metric);
  if (seedMetric) {
    return buildMetadata({
      locale,
      title: `${seedMetric.label} score — Aegis Lens scoring methodology`,
      description: `${seedMetric.oneLiner} Inputs, worked examples, FAQ, and methodology cross-link.`,
      pathFor: (lc) => localePath(lc, `/scoring/${seedMetric.slug}`),
    });
  }
  if (metric === "severity") {
    return buildMetadata({
      locale,
      title: "Severity — Aegis Lens scoring methodology",
      description:
        "How Aegis Lens assigns severity (0–5) to events: scale definitions, relationship to danger score, and worked examples.",
      pathFor: (lc) => localePath(lc, "/scoring/severity"),
    });
  }
  return { robots: { index: false } };
}

// ─── Rich content blocks per metric ──────────────────────────────────────────

function ConfidenceContent({ locale }: { locale: Locale }) {
  return (
    <>
      {/* Formula */}
      <section>
        <h2 className="text-base font-semibold text-text-primary">Formula</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Confidence is a weighted sum of four component scores, each normalized to [0, 1]:
        </p>
        <div className="mt-3 rounded border border-border-subtle bg-bg-elevated px-5 py-4">
          <code className="block font-mono text-sm text-text-primary leading-8">
            confidence = (source_count × <span className="text-accent">0.4</span>)
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (cross_ref × <span className="text-accent">0.3</span>)
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (media_verification × <span className="text-accent">0.2</span>)
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (geo_check × <span className="text-accent">0.1</span>)
          </code>
        </div>
        <div className="mt-4 overflow-x-auto rounded border border-border-subtle bg-bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-text-muted border-b border-border-subtle">
                <th className="px-4 py-3 font-medium">Component</th>
                <th className="px-4 py-3 font-medium">Weight</th>
                <th className="px-4 py-3 font-medium">What it measures</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["source_count", "0.4", "Number of independent sources corroborating the event, log-normalized"],
                ["cross_ref", "0.3", "Whether the event appears in cross-referenced databases (e.g. ISW, GenStaff)"],
                ["media_verification", "0.2", "Presence of geolocated photos, video, or satellite imagery"],
                ["geo_check", "0.1", "Coordinate plausibility against known conflict zones and infrastructure maps"],
              ].map(([comp, w, desc]) => (
                <tr key={comp as string} className="border-t border-border-subtle">
                  <td className="px-4 py-2.5 font-mono text-accent text-xs">{comp}</td>
                  <td className="px-4 py-2.5 font-mono text-text-primary">{w}</td>
                  <td className="px-4 py-2.5 text-text-secondary text-xs">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* How it changes over time */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-text-primary">How confidence evolves over time</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Confidence is not static. It is recomputed on every new signal:
        </p>
        <ul className="mt-3 space-y-2">
          {[
            { t: "T+0 min", desc: "First report ingested. source_count = 1, all other components at prior. Confidence ≈ 0.15–0.30." },
            { t: "T+5 min", desc: "Second independent source corroborates. cross_ref kicks in. Confidence climbs to 0.45–0.60." },
            { t: "T+20 min", desc: "Geolocated photo found. media_verification component fires. Confidence may reach 0.70+." },
            { t: "T+60 min", desc: "Cross-referenced with GenStaff sitrep. Confidence stabilizes at final value unless retraction received." },
          ].map(({ t, desc }) => (
            <li key={t} className="flex gap-3 text-sm">
              <span className="font-mono text-[11px] text-accent w-20 shrink-0 pt-0.5">{t}</span>
              <span className="text-text-secondary">{desc}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Visual scale bar */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-text-primary">Scale</h2>
        <div className="mt-3 rounded border border-border-subtle bg-bg-surface p-4">
          <div className="flex rounded-full overflow-hidden h-3">
            <div className="flex-1 bg-red-500 opacity-80" title="Low: 0–0.3" />
            <div className="flex-[2] bg-amber-500 opacity-80" title="Medium: 0.3–0.7" />
            <div className="flex-[1.5] bg-green-500 opacity-80" title="High: 0.7–1.0" />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-text-muted">
            <span>0.0</span>
            <span>0.3</span>
            <span>0.7</span>
            <span>1.0</span>
          </div>
          <div className="mt-1 flex text-[10px] text-text-muted">
            <span className="flex-1 text-red-400">Low</span>
            <span className="flex-[2] text-center text-amber-400">Medium</span>
            <span className="flex-[1.5] text-right text-green-400">High</span>
          </div>
        </div>
      </section>

      {/* Examples */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-text-primary">Worked examples</h2>
        <div className="mt-3 space-y-3">
          {[
            {
              label: "Tweet with no corroboration",
              value: "0.20",
              color: "text-red-400",
              explanation:
                "One anonymous source, no cross-reference, no media, geo plausible. source_count contribution is minimal at single-source weight. Not exposed on public map.",
            },
            {
              label: "Two regional outlets agree within 15 minutes",
              value: "0.61",
              color: "text-amber-400",
              explanation:
                "Two independent sources (source_count ≈ 0.6), no cross-ref database hit yet, no verified media, geo plausible. Eligible for public map but not incident feed.",
            },
            {
              label: "3 independent sources + geolocated satellite imagery",
              value: "0.94",
              color: "text-green-400",
              explanation:
                "Full component score: source_count saturated, cross_ref confirmed, media_verification = satellite, geo_check passes. Qualifies for incident feed and syndication.",
            },
          ].map((ex) => (
            <div
              key={ex.label}
              className="rounded border border-border-subtle bg-bg-surface p-4 flex gap-4"
            >
              <div className={`font-mono text-2xl font-semibold shrink-0 ${ex.color}`}>
                {ex.value}
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">{ex.label}</div>
                <p className="mt-1 text-xs text-text-secondary">{ex.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GitHub placeholder */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-text-primary">Source code</h2>
        <p className="mt-2 text-sm text-text-secondary">
          The confidence scorer is implemented in{" "}
          <a
            href="https://github.com/aegis-lens/platform/blob/main/packages/scorer/src/confidence.ts"
            className="text-accent hover:underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            packages/scorer/src/confidence.ts
          </a>{" "}
          (placeholder — repository will be made public in Q3 2025).
        </p>
      </section>
    </>
  );
}

function DangerContent({ locale }: { locale: Locale }) {
  return (
    <>
      {/* Component factors table */}
      <section>
        <h2 className="text-base font-semibold text-text-primary">Component factors</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Danger is a multiplicative model. The base score comes from the event class; severity,
          population proximity, and zone modifiers are applied sequentially.
        </p>
        <div className="mt-3 overflow-x-auto rounded border border-border-subtle bg-bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-text-muted border-b border-border-subtle">
                <th className="px-4 py-3 font-medium">Factor</th>
                <th className="px-4 py-3 font-medium">Range</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Class weight", "5 – 40", "Base points by event class. military_action starts at 40; political at 5."],
                ["Severity multiplier", "×0.5 – ×2.5", "Severity 0 halves the class weight; severity 5 multiplies by 2.5."],
                ["Population multiplier", "×0.8 – ×1.8", "Events within 5km of a settlement with 10k+ population score higher."],
                ["Zone modifier", "×0.7 – ×1.5", "Active frontline zones (within 30km) receive a 1.5× modifier; deep rear ×0.7."],
              ].map(([factor, range, desc]) => (
                <tr key={factor as string} className="border-t border-border-subtle">
                  <td className="px-4 py-2.5 font-medium text-text-primary text-xs">{factor}</td>
                  <td className="px-4 py-2.5 font-mono text-accent text-xs">{range}</td>
                  <td className="px-4 py-2.5 text-text-secondary text-xs">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Civilian vs infrastructure vs military */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-text-primary">
          Civilian · Infrastructure · Military implications
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              label: "Civilian",
              color: "text-blue-400",
              dot: "bg-blue-400",
              points: [
                "Population density within event radius",
                "Time-of-day modifier (residential areas score higher overnight)",
                "Shelter availability in the area",
              ],
            },
            {
              label: "Infrastructure",
              color: "text-amber-400",
              dot: "bg-amber-400",
              points: [
                "Infrastructure class (energy > water > transport > comms)",
                "Estimated population served",
                "Season modifier (energy events score higher in winter)",
              ],
            },
            {
              label: "Military",
              color: "text-red-400",
              dot: "bg-red-400",
              points: [
                "Distance from known front lines",
                "Military asset class (strategic vs tactical)",
                "Escalation potential based on recent event patterns",
              ],
            },
          ].map((col) => (
            <div
              key={col.label}
              className="rounded border border-border-subtle bg-bg-surface p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
              </div>
              <ul className="space-y-1.5">
                {col.points.map((p) => (
                  <li key={p} className="flex gap-2 text-xs text-text-secondary">
                    <span className="text-accent shrink-0">·</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Use-case section */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-text-primary">
          How different users interpret danger
        </h2>
        <div className="mt-3 space-y-3">
          {[
            {
              user: "Traders & Insurers",
              threshold: "≥ 60",
              usage:
                "Trigger risk-limit reviews or commodity position adjustments. Danger ≥ 60 on energy infrastructure events feeds automated agricultural/energy pricing models.",
            },
            {
              user: "NGOs & Humanitarian",
              threshold: "≥ 50",
              usage:
                "Alert field teams to escalation zones. Danger ≥ 50 on civilian_alert class triggers logistics pre-positioning in our partner integrations.",
            },
            {
              user: "Governments & Analysts",
              threshold: "≥ 80",
              usage:
                "Diplomatic and operational escalation. Danger ≥ 80 is included in the daily sitrep digest; ≥ 90 triggers immediate notification to subscribed government endpoints.",
            },
          ].map((row) => (
            <div
              key={row.user}
              className="rounded border border-border-subtle bg-bg-surface p-4 flex gap-4"
            >
              <div className="shrink-0">
                <div className="font-mono text-xs text-text-muted">threshold</div>
                <div className="font-mono text-xl text-accent">{row.threshold}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">{row.user}</div>
                <p className="mt-1 text-xs text-text-secondary">{row.usage}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function SeverityContent({ locale }: { locale: Locale }) {
  const LEVELS = [
    { level: 0, label: "Minimal", danger: "0–15", examples: ["Routine patrol activity", "Weather-related road closure", "Minor border incident with no casualties"] },
    { level: 1, label: "Local", danger: "10–30", examples: ["Small drone incursion over rural area", "Single explosion, no confirmed damage", "Localized power outage < 1h"] },
    { level: 2, label: "Moderate", danger: "25–55", examples: ["Artillery exchange near populated village", "Substation damage, 5k–20k affected", "Air raid alert covering 1–2 oblasts"] },
    { level: 3, label: "Significant", danger: "45–70", examples: ["Missile strike on district infrastructure", "Bridge or rail line severed", "Mass-casualty incident < 10 confirmed"] },
    { level: 4, label: "Severe", danger: "65–85", examples: ["Multi-missile salvo on regional capital", "Energy grid failure affecting > 500k people", "Large-scale evacuation order issued"] },
    { level: 5, label: "Strategic", danger: "80–100", examples: ["Cross-border incursion by armoured formation", "Critical national infrastructure destroyed", "Mass-casualty event > 50 confirmed"] },
  ];

  return (
    <>
      {/* Scale table */}
      <section>
        <h2 className="text-base font-semibold text-text-primary">0–5 scale with examples</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Severity is assigned by analysts at ingestion time and reviewed during the verification
          pipeline. It reflects the tactical and operational scale — not the civilian impact (that
          is measured by danger score).
        </p>
        <div className="mt-4 space-y-3">
          {LEVELS.map((lvl) => (
            <div
              key={lvl.level}
              className="rounded border border-border-subtle bg-bg-surface p-4 flex gap-4"
            >
              <div className="shrink-0 flex flex-col items-center">
                <div className="font-mono text-3xl font-semibold text-accent">{lvl.level}</div>
                <div className="font-mono text-[10px] text-text-muted mt-0.5">{lvl.label}</div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1.5">
                  Typical danger range: {lvl.danger}
                </div>
                <ul className="space-y-0.5">
                  {lvl.examples.map((ex) => (
                    <li key={ex} className="flex gap-2 text-xs text-text-secondary">
                      <span className="text-accent shrink-0">·</span>
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Relationship to danger */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-text-primary">Relationship to danger score</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Severity is an input to the danger score — it acts as a multiplier on the class base
          weight. A severity-5 event with class <code className="font-mono text-accent">military_action</code> would
          start with a danger score around 80–100 before population and zone modifiers.
        </p>
        <div className="mt-3 rounded border border-border-subtle bg-bg-elevated px-4 py-3 font-mono text-sm text-text-secondary">
          danger ≈ class_weight × severity_multiplier × population_mod × zone_mod
        </div>
      </section>

      {/* Why severity ≠ danger */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-text-primary">Why severity ≠ danger</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded border border-border-subtle bg-bg-surface p-4">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Example A
            </div>
            <p className="text-sm text-text-secondary">
              A severity-4 missile strike on a deserted industrial zone at night, far from the front
              line, may produce a danger score of only 45 — because population proximity and zone
              modifiers are both low.
            </p>
          </div>
          <div className="rounded border border-border-subtle bg-bg-surface p-4">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Example B
            </div>
            <p className="text-sm text-text-secondary">
              A severity-2 substation hit in a dense urban area in winter may produce a danger score
              of 72 — because infrastructure class, population multiplier, and seasonal modifier all
              push the score up despite the lower tactical scale.
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs text-text-muted">
          In short: severity describes the scale of the action; danger describes the risk to people.
          Both matter — for different use cases.
        </p>
      </section>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ScoringExplainerPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, metric } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  // Resolve metadata from seed (for confidence/danger/anomaly/reliability)
  const seedMetric = getScoreMetric(metric);

  // For unknown slugs that are also not "severity", 404
  if (!seedMetric && metric !== "severity") notFound();

  const title =
    metric === "severity"
      ? "Severity"
      : seedMetric
        ? seedMetric.label
        : "Score";

  const oneLiner =
    metric === "severity"
      ? "Tactical and operational scale of the event, from 0 (minimal) to 5 (strategic)."
      : seedMetric?.oneLiner ?? "";

  const range =
    metric === "severity" ? "0 – 5" : seedMetric?.range ?? "";

  // Other metrics for the footer nav
  const otherSeedMetrics = SCORE_METRICS.filter((m) => m.slug !== metric);

  const pageUrl = `${SITE.url}${localePath(locale, `/scoring/${metric}`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${title} — Aegis Lens scoring methodology`,
    description: oneLiner,
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    inLanguage: locale,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-3xl px-4 py-10">
        {/* Breadcrumb */}
        <nav className="font-mono text-[11px] text-text-muted mb-2" aria-label="Breadcrumb">
          <Link href={localePath(locale, "/scoring")} className="hover:text-text-primary">
            Scoring
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{title}</span>
        </nav>

        <PageHeader eyebrow="Score explainer" title={title} description={oneLiner} />

        {range && (
          <div className="mt-2 font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Range: {range}
          </div>
        )}

        {/* Seed metric plain paragraphs (confidence / danger / anomaly / reliability) */}
        {seedMetric && (
          <section className="mt-6 space-y-3 text-sm text-text-secondary">
            {seedMetric.plain.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>
        )}

        {/* Rich content section — metric-specific */}
        <div className="mt-8">
          {metric === "confidence" && <ConfidenceContent locale={locale} />}
          {metric === "danger" && <DangerContent locale={locale} />}
          {metric === "severity" && <SeverityContent locale={locale} />}

          {/* Fallback for anomaly / reliability: use seed data */}
          {!isExtendedMetric(metric) && seedMetric && (
            <>
              <section className="mt-8">
                <h2 className="text-base font-semibold text-text-primary">Inputs</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-text-secondary">
                  {seedMetric.inputs.map((inp, i) => (
                    <li key={i}>{inp}</li>
                  ))}
                </ul>
              </section>

              <section className="mt-8">
                <h2 className="text-base font-semibold text-text-primary">Worked examples</h2>
                <ul className="mt-3 space-y-2">
                  {seedMetric.examples.map((ex, i) => (
                    <li
                      key={i}
                      className="rounded border border-border-subtle bg-bg-surface p-3 text-sm"
                    >
                      <div className="font-mono text-[10px] uppercase tracking-wider text-accent">
                        {ex.label}
                      </div>
                      <p className="mt-1 text-text-secondary">{ex.explanation}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-8">
                <h2 className="text-base font-semibold text-text-primary">FAQ</h2>
                <div className="mt-3 space-y-3">
                  {seedMetric.faqs.map((f, i) => (
                    <details
                      key={i}
                      className="group rounded border border-border-subtle bg-bg-surface p-4"
                    >
                      <summary className="cursor-pointer text-sm font-medium text-text-primary">
                        {f.q}
                      </summary>
                      <p className="mt-2 text-sm text-text-secondary">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>

        {/* ── Other scores footer nav ──────────────────────────────────────── */}
        <section className="mt-10 border-t border-border-subtle pt-6">
          <h2 className="text-base font-semibold text-text-primary">Other scores</h2>
          <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {/* Severity link (always show unless we're on severity) */}
            {metric !== "severity" && (
              <li>
                <Link
                  href={urls.scoring(locale, "severity")}
                  className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                >
                  <div className="text-text-primary">Severity</div>
                  <p className="mt-1 text-xs text-text-secondary">
                    Tactical and operational scale, 0–5.
                  </p>
                </Link>
              </li>
            )}
            {otherSeedMetrics.map((o) => (
              <li key={o.slug}>
                <Link
                  href={urls.scoring(locale, o.slug)}
                  className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                >
                  <div className="text-text-primary">{o.label} score</div>
                  <p className="mt-1 text-xs text-text-secondary">{o.oneLiner}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-8 text-xs text-text-muted">
          Full methodology disclosure at{" "}
          <Link href={localePath(locale, "/methodology")} className="text-accent hover:underline">
            /methodology
          </Link>
          .
        </p>
      </article>
    </>
  );
}
