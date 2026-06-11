import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 3600; // 1 hour

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "How Aegis Lens Scores Events";
const DESCRIPTION =
  "Every number on our platform has an explanation. Transparency is non-negotiable.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Scoring Methodology",
    description: DESCRIPTION,
    pathFor: (lc) => localePath(lc, "/scoring"),
  });
}

// ─── Verification state grid ──────────────────────────────────────────────────

const VERIFICATION_STATES = [
  {
    id: "unverified",
    label: "Unverified",
    color: "text-amber-400",
    dot: "bg-amber-400",
    description: "Received, not yet checked. Visible internally; not exposed on public surfaces until confidence ≥ 0.5.",
  },
  {
    id: "corroborated",
    label: "Corroborated",
    color: "text-green-400",
    dot: "bg-green-400",
    description: "2+ independent sources, geocheck passed, and no contradictions found. Confidence boost applied.",
  },
  {
    id: "disputed",
    label: "Disputed",
    color: "text-orange-400",
    dot: "bg-orange-400",
    description: "Contradicting information found from at least one independent source. Confidence reduced; analyst triage required.",
  },
  {
    id: "retracted",
    label: "Retracted",
    color: "text-red-400",
    dot: "bg-red-400",
    description: "Previously verified, later shown false. Confidence zeroed; event remains in corpus with retraction flag.",
  },
];

export default async function ScoringIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/scoring")}`,
    inLanguage: locale,
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader eyebrow="Methodology" title={TITLE} description={DESCRIPTION} />

      <section className="mx-auto max-w-5xl px-4 py-10 space-y-14">

        {/* ── Three main metric cards ─────────────────────────────────────── */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Core scoring metrics</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

            {/* Confidence */}
            <div className="rounded border border-border-subtle bg-bg-surface p-6 flex flex-col gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">
                  Confidence
                </div>
                <div className="font-mono text-2xl text-text-primary">0 – 1</div>
                <p className="mt-2 text-sm text-text-secondary">
                  Our certainty that the event occurred as described.
                </p>
              </div>

              <div>
                <div className="text-xs font-medium text-text-muted mb-1 uppercase tracking-wider">Formula</div>
                <code className="block rounded bg-bg-elevated px-3 py-2 font-mono text-[11px] text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {`(source_count × 0.4)\n+ (cross_ref × 0.3)\n+ (media_verify × 0.2)\n+ (geo_check × 0.1)`}
                </code>
              </div>

              <div>
                <div className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">Scale</div>
                <div className="space-y-1">
                  {[
                    { range: "0 – 0.3", label: "Low", color: "bg-red-500" },
                    { range: "0.3 – 0.7", label: "Medium", color: "bg-amber-500" },
                    { range: "0.7 – 1.0", label: "High", color: "bg-green-500" },
                  ].map((tier) => (
                    <div key={tier.label} className="flex items-center gap-2 text-xs">
                      <span className={`h-2 w-2 rounded-full ${tier.color}`} />
                      <span className="font-mono text-text-muted w-20">{tier.range}</span>
                      <span className="text-text-secondary">{tier.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={urls.scoring(locale, "confidence")}
                className="mt-auto inline-flex items-center gap-1 text-xs text-accent hover:underline underline-offset-2"
              >
                Full explainer →
              </Link>
            </div>

            {/* Danger */}
            <div className="rounded border border-border-subtle bg-bg-surface p-6 flex flex-col gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">
                  Danger Score
                </div>
                <div className="font-mono text-2xl text-text-primary">0 – 100</div>
                <p className="mt-2 text-sm text-text-secondary">
                  Estimated risk to civilians and infrastructure.
                </p>
              </div>

              <div>
                <div className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">Factors</div>
                <ul className="space-y-1 text-xs text-text-secondary">
                  <li className="flex gap-2"><span className="text-accent shrink-0">·</span>Event class weight</li>
                  <li className="flex gap-2"><span className="text-accent shrink-0">·</span>Severity multiplier</li>
                  <li className="flex gap-2"><span className="text-accent shrink-0">·</span>Population proximity</li>
                  <li className="flex gap-2"><span className="text-accent shrink-0">·</span>Active conflict zone modifier</li>
                </ul>
              </div>

              <div>
                <div className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">Scale</div>
                <div className="space-y-1">
                  {[
                    { range: "0 – 30", label: "Low", color: "bg-green-500" },
                    { range: "30 – 60", label: "Medium", color: "bg-amber-500" },
                    { range: "60 – 80", label: "High", color: "bg-orange-500" },
                    { range: "80 – 100", label: "Critical", color: "bg-red-500" },
                  ].map((tier) => (
                    <div key={tier.label} className="flex items-center gap-2 text-xs">
                      <span className={`h-2 w-2 rounded-full ${tier.color}`} />
                      <span className="font-mono text-text-muted w-20">{tier.range}</span>
                      <span className="text-text-secondary">{tier.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={urls.scoring(locale, "danger")}
                className="mt-auto inline-flex items-center gap-1 text-xs text-accent hover:underline underline-offset-2"
              >
                Full explainer →
              </Link>
            </div>

            {/* Severity */}
            <div className="rounded border border-border-subtle bg-bg-surface p-6 flex flex-col gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">
                  Severity
                </div>
                <div className="font-mono text-2xl text-text-primary">0 – 5</div>
                <p className="mt-2 text-sm text-text-secondary">
                  Tactical and operational scale of the event.
                </p>
              </div>

              <div>
                <div className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">Scale</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-text-muted text-[10px] uppercase tracking-wider">
                        <th className="pb-1 text-left font-medium">Level</th>
                        <th className="pb-1 text-left font-medium">Meaning</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-0.5">
                      {[
                        [0, "Minimal"],
                        [1, "Local"],
                        [2, "Moderate"],
                        [3, "Significant"],
                        [4, "Severe"],
                        [5, "Strategic"],
                      ].map(([lvl, meaning]) => (
                        <tr key={lvl} className="border-t border-border-subtle/50">
                          <td className="py-0.5 pr-2 font-mono text-accent">{lvl}</td>
                          <td className="py-0.5 text-text-secondary">{meaning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Link
                href={urls.scoring(locale, "severity")}
                className="mt-auto inline-flex items-center gap-1 text-xs text-accent hover:underline underline-offset-2"
              >
                Full explainer →
              </Link>
            </div>
          </div>
        </div>

        {/* ── Verification states ─────────────────────────────────────────── */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">Verification states</h2>
          <p className="text-sm text-text-muted mb-4">
            Every event carries a categorical state that reflects the current evidence review.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {VERIFICATION_STATES.map((vs) => (
              <div
                key={vs.id}
                className="rounded border border-border-subtle bg-bg-surface p-4 flex gap-3"
              >
                <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${vs.dot}`} aria-hidden="true" />
                <div>
                  <div className={`text-sm font-semibold ${vs.color}`}>{vs.label}</div>
                  <p className="mt-1 text-xs text-text-secondary">{vs.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer note ─────────────────────────────────────────────────── */}
        <p className="text-xs text-text-muted border-t border-border-subtle pt-6">
          All scores are recomputed continuously as new signals arrive. Score definitions are
          versioned — breaking changes are announced in the{" "}
          <Link href={localePath(locale, "/changelog")} className="text-accent hover:underline">
            changelog
          </Link>
          .
        </p>

      </section>
    </>
  );
}
