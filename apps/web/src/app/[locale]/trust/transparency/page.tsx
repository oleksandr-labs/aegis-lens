import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Transparency report — Q1 2026";
const DESCRIPTION =
  "Quarterly numbers on government requests, takedowns, content moderation, verification pipeline, AI tooling, and uptime for 1 January – 31 March 2026.";

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
    pathFor: (lc) => localePath(lc, "/trust/transparency"),
  });
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded border border-border-subtle bg-bg-surface p-5">
      <div className="text-xs uppercase tracking-widest text-text-muted">{label}</div>
      <div className="mt-2 font-mono text-3xl text-text-primary">{value}</div>
      {sub ? <div className="mt-1 text-xs text-text-secondary">{sub}</div> : null}
    </div>
  );
}

const SOURCES = [
  {
    name: "Reuters / AP / AFP wire",
    tier: "Tier 1",
    events: 142_310,
    reliability: "98.7%",
  },
  {
    name: "Ukrainian armed forces (official channels)",
    tier: "Tier 1",
    events: 87_440,
    reliability: "96.2%",
  },
  {
    name: "ISW (Institute for the Study of War)",
    tier: "Tier 1",
    events: 34_900,
    reliability: "97.1%",
  },
  {
    name: "DeepState / established OSINT collectives",
    tier: "Tier 2",
    events: 201_540,
    reliability: "89.4%",
  },
  {
    name: "Regional Telegram channels (verified)",
    tier: "Tier 2",
    events: 178_220,
    reliability: "81.0%",
  },
  {
    name: "Eyewitness social posts / raw feeds",
    tier: "Tier 3",
    events: 202_824,
    reliability: "61.3%",
  },
];

const TIER_STYLES: Record<string, string> = {
  "Tier 1": "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  "Tier 2": "border-amber-500/40 bg-amber-500/10 text-amber-400",
  "Tier 3": "border-zinc-500/40 bg-zinc-500/10 text-zinc-400",
};

const PIPELINE_STEPS = [
  { label: "Events ingested", value: "847,234", pct: "100%" },
  { label: "After deduplication", value: "798,535", pct: "94.2%" },
  { label: "Geolocated", value: "738,082", pct: "87.1%" },
  { label: "Cross-referenced ≥ 2 sources", value: "604,925", pct: "71.4%" },
  { label: "AI-verified", value: "493,949", pct: "58.3%" },
  { label: "Human-reviewed", value: "195,711", pct: "23.1%" },
];

const REMOVAL_REQUESTS = [
  {
    date: "2026-02-14",
    requester: "Commercial entity",
    reason: "Alleges event description commercially damaging",
    eventsAffected: 1,
    decision: "Denied",
    decisionNote: "Public-interest journalism exemption; no personal data involved.",
  },
  {
    date: "2026-03-01",
    requester: "Individual (private person)",
    reason: "Event inadvertently identifies private individual by location",
    eventsAffected: 1,
    decision: "Granted",
    decisionNote: "Coordinates rounded to district level; identifying detail removed.",
  },
  {
    date: "2026-03-19",
    requester: "NGO",
    reason: "Duplicate event — already published under corrected record",
    eventsAffected: 1,
    decision: "Granted",
    decisionNote: "Duplicate confirmed; original record merged into corrected entry.",
  },
];

const AI_MODELS = [
  {
    model: "Claude (Anthropic)",
    purpose: "AI copilot + report generation",
    hosting: "API (cloud)",
    dataShared: "Public event text, user query",
    dpa: "Yes — Anthropic DPA on file",
  },
  {
    model: "Mistral 7B",
    purpose: "Event classification",
    hosting: "Self-hosted (EU)",
    dataShared: "Event text only",
    dpa: "N/A — self-hosted",
  },
  {
    model: "YOLOv8",
    purpose: "Object detection in imagery",
    hosting: "Self-hosted (EU)",
    dataShared: "Public imagery only",
    dpa: "N/A — self-hosted",
  },
  {
    model: "Tesseract + PaddleOCR",
    purpose: "OCR on source documents",
    hosting: "Self-hosted (EU)",
    dataShared: "Public document images",
    dpa: "N/A — self-hosted",
  },
];

export default async function TransparencyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: TITLE,
    description: DESCRIPTION,
    inLanguage: locale,
    datePublished: "2026-04-15",
    author: { "@type": "Organization", name: "Aegis Lens" },
    publisher: { "@type": "Organization", name: "Aegis Lens" },
  };

  return (
    <>
      <PageHeader eyebrow="Trust Center" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-4xl px-4 py-10 text-text-secondary">
        <p>
          This report covers the period{" "}
          <strong className="text-text-primary">1 January – 31 March 2026</strong>. Figures are
          exact counts at time of publication and will not be retroactively amended; subsequent
          activity appears in the Q2 2026 report.
        </p>

        {/* ── 1. Data sources ── */}
        <section className="mt-12" id="sources">
          <h2 className="text-2xl font-semibold text-text-primary">1. Data sources used</h2>
          <p className="mt-3 text-sm">
            The table below shows the top contributing source groups, their tier, the number of
            events they contributed in Q1, and the historical reliability score computed from
            cross-reference accuracy against Tier 1 sources.
          </p>
          <div className="mt-5 overflow-x-auto rounded border border-border-subtle">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-subtle bg-bg-elevated">
                <tr>
                  {["Source group", "Tier", "Events (Q1)", "Reliability"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {SOURCES.map((s) => (
                  <tr key={s.name} className="bg-bg-surface hover:bg-bg-elevated">
                    <td className="px-4 py-3 text-text-primary">{s.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${TIER_STYLES[s.tier]}`}
                      >
                        {s.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-text-primary">
                      {s.events.toLocaleString("en-GB")}
                    </td>
                    <td className="px-4 py-3 font-mono text-text-primary">{s.reliability}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 2. Verification pipeline ── */}
        <section className="mt-12" id="pipeline">
          <h2 className="text-2xl font-semibold text-text-primary">
            2. Verification pipeline stats
          </h2>
          <p className="mt-3 text-sm">
            The funnel below shows how many candidate reports were ingested and how many survived
            each successive verification gate. Only events that pass all applicable gates are
            published to the public map.
          </p>
          <div className="mt-5 space-y-2">
            {PIPELINE_STEPS.map((step, i) => (
              <div
                key={step.label}
                className="flex items-center gap-4 rounded border border-border-subtle bg-bg-surface px-4 py-3"
              >
                <span className="w-5 shrink-0 font-mono text-[10px] text-text-muted">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-text-primary">{step.label}</span>
                <span className="font-mono text-sm text-accent">{step.value}</span>
                <span className="w-14 text-right font-mono text-xs text-text-muted">
                  {step.pct}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. Content removal requests ── */}
        <section className="mt-12" id="removal">
          <h2 className="text-2xl font-semibold text-text-primary">
            3. Content removal requests
          </h2>
          <p className="mt-3 text-sm">
            Requests received from non-governmental parties to alter or remove published event
            records. Each request is evaluated against our public-interest criteria and data
            protection obligations.
          </p>
          <div className="mt-5 overflow-x-auto rounded border border-border-subtle">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-subtle bg-bg-elevated">
                <tr>
                  {["Date", "Requester type", "Reason", "Events", "Decision"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {REMOVAL_REQUESTS.map((r) => (
                  <tr key={r.date + r.requester} className="bg-bg-surface hover:bg-bg-elevated">
                    <td className="px-4 py-3 font-mono text-[11px] text-text-muted">{r.date}</td>
                    <td className="px-4 py-3 text-text-primary">{r.requester}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{r.reason}</td>
                    <td className="px-4 py-3 font-mono text-text-primary">{r.eventsAffected}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                          r.decision === "Granted"
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                            : "border-red-500/40 bg-red-500/10 text-red-400"
                        }`}
                      >
                        {r.decision}
                      </span>
                      <p className="mt-1 text-[10px] text-text-muted">{r.decisionNote}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 4. Government / LEA requests ── */}
        <section className="mt-12" id="government">
          <h2 className="text-2xl font-semibold text-text-primary">
            4. Government &amp; law-enforcement requests
          </h2>
          <p className="mt-3 text-sm">
            Formal requests from government, law-enforcement, or judicial authorities for user
            data, source identification, or content removal.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Stat label="Requests received" value="0" sub="Q1 2026" />
            <Stat label="Complied" value="0" />
            <Stat label="Denied or challenged" value="0" />
          </div>
          <p className="mt-4 text-xs text-text-muted">
            Zero government requests received during the reporting period. A warrant canary will
            be published in the Q2 report. We will resist any request that would require us to
            secretly suppress or alter published event records.
          </p>
        </section>

        {/* ── 5. DMCA ── */}
        <section className="mt-12" id="dmca">
          <h2 className="text-2xl font-semibold text-text-primary">5. DMCA notices</h2>
          <p className="mt-3 text-sm">
            Copyright takedown notices targeting embedded media, source quotations, or republished
            imagery.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Stat label="Notices received" value="2" />
            <Stat label="Honoured" value="1" sub="material removed" />
            <Stat label="Rejected" value="1" sub="fair-use determination" />
          </div>
        </section>

        {/* ── 6. Content moderation ── */}
        <section className="mt-12" id="moderation">
          <h2 className="text-2xl font-semibold text-text-primary">6. Content moderation</h2>
          <p className="mt-3 text-sm">
            Internal actions taken against published events for accuracy, safety, or policy
            reasons, independent of any external request.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Stat label="Events removed" value="12" />
            <Stat label="Events flagged" value="38" sub="under review or contested" />
            <Stat label="Corrections issued" value="9" />
          </div>
        </section>

        {/* ── 7. AI model usage disclosure ── */}
        <section className="mt-12" id="ai">
          <h2 className="text-2xl font-semibold text-text-primary">
            7. AI model usage disclosure
          </h2>
          <p className="mt-3 text-sm">
            All AI models used in production during Q1 2026 are listed below. AI outputs are
            never used as primary evidence without human review; all AI-generated summaries carry
            an explicit label in the UI and in exports.
          </p>
          <div className="mt-5 overflow-x-auto rounded border border-border-subtle">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-subtle bg-bg-elevated">
                <tr>
                  {["Model", "Purpose", "Hosting", "Data shared", "DPA"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {AI_MODELS.map((m) => (
                  <tr key={m.model} className="bg-bg-surface hover:bg-bg-elevated">
                    <td className="px-4 py-3 font-medium text-text-primary">{m.model}</td>
                    <td className="px-4 py-3 text-text-secondary">{m.purpose}</td>
                    <td className="px-4 py-3 text-text-secondary">{m.hosting}</td>
                    <td className="px-4 py-3 text-text-secondary">{m.dataShared}</td>
                    <td className="px-4 py-3 text-text-muted text-xs">{m.dpa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 8. Uptime ── */}
        <section className="mt-12" id="uptime">
          <h2 className="text-2xl font-semibold text-text-primary">8. Uptime</h2>
          <p className="mt-3 text-sm">
            Availability of the public map, API, and event feed, measured externally from three
            regions.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Stat label="Overall uptime" value="99.94%" />
            <Stat label="Unplanned downtime" value="26 min" sub="cumulative, Q1" />
            <Stat label="Incidents (sev 1–2)" value="1" />
          </div>
        </section>

        {/* ── 9. Bug bounty ── */}
        <section className="mt-12" id="bug-bounty">
          <h2 className="text-2xl font-semibold text-text-primary">9. Bug bounty program</h2>
          <p className="mt-3 text-sm">
            We operate a coordinated disclosure program. Security researchers are invited to
            report vulnerabilities responsibly; we acknowledge all reports within 48 hours and
            aim to resolve critical issues within 7 days.
          </p>
          <div className="mt-5 rounded border border-border-subtle bg-bg-surface p-5 space-y-2 text-sm">
            <div className="flex items-baseline gap-3">
              <span className="w-36 shrink-0 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Report to
              </span>
              <a
                href="mailto:security@aegislens.io"
                className="text-accent underline-offset-2 hover:underline"
              >
                security@aegislens.io
              </a>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="w-36 shrink-0 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Security policy
              </span>
              <a
                href="/.well-known/security.txt"
                className="text-accent underline-offset-2 hover:underline font-mono text-xs"
              >
                /.well-known/security.txt
              </a>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="w-36 shrink-0 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Rewards
              </span>
              <span className="text-text-secondary text-xs">
                Hall of fame recognition; financial rewards for critical/high severity findings
                (contact us for scope and amounts).
              </span>
            </div>
          </div>
        </section>

        {/* ── Notes ── */}
        <section className="mt-12" id="notes">
          <h2 className="text-2xl font-semibold text-text-primary">Notes</h2>
          <p className="mt-3 text-sm">
            This report is published within 30 days of the end of each quarter. Detailed
            per-incident postmortems for all corrections issued above are available in the{" "}
            <a
              href={localePath(locale, "/trust/corrections")}
              className="text-accent underline-offset-2 hover:underline"
            >
              corrections log
            </a>
            . Questions or challenges to figures published here should be directed to{" "}
            <a
              href="mailto:transparency@aegislens.io"
              className="text-accent underline-offset-2 hover:underline"
            >
              transparency@aegislens.io
            </a>
            .
          </p>
        </section>
      </article>
    </>
  );
}
