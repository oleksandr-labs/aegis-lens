import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Corrections & Retractions";
const DESCRIPTION =
  "Our commitment to accuracy means publicly documenting every correction. No exceptions.";

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
    pathFor: (lc) => localePath(lc, "/trust/corrections"),
  });
}

type CorrectionType =
  | "geolocation_correction"
  | "source_reliability"
  | "retraction"
  | "attribution"
  | "casualty_figure";

type Severity = "minor" | "major";

type Correction = {
  id: string;
  date: string;
  originalEvent: string | null;
  type: CorrectionType;
  original: string;
  correction: string;
  severity: Severity;
  discoveredBy: string;
  status: "resolved" | "pending";
};

const CORRECTIONS: Correction[] = [
  {
    id: "COR-2026-007",
    date: "2026-05-28",
    originalEvent: "01HXKHARKIVDRONE001",
    type: "geolocation_correction",
    original: "Event geolocated to Kharkiv city center",
    correction:
      "Event occurred in Kharkiv Oblast (rural area NE of city), not city center. Coordinates updated from 49.9935,36.2304 to 49.9821,36.3102.",
    severity: "minor",
    discoveredBy: "Community analyst @OSINT_UA",
    status: "resolved",
  },
  {
    id: "COR-2026-003",
    date: "2026-05-10",
    originalEvent: null,
    type: "source_reliability",
    original: "Telegram source @UkraineNow_X treated as Tier 2",
    correction:
      "Source downgraded to Tier 3 following discovery of 3 fabricated events. All events sourced exclusively from this channel marked Disputed pending re-verification.",
    severity: "major",
    discoveredBy: "Internal review",
    status: "resolved",
  },
  {
    id: "COR-2026-001",
    date: "2026-04-22",
    originalEvent: "01HXKYIVALERT001",
    type: "retraction",
    original: "Reported missile strike on infrastructure in Kyiv",
    correction:
      "Event retracted. Cross-referenced with ground reports and satellite imagery — no strike occurred. Likely misidentified explosion elsewhere. Event marked Retracted.",
    severity: "major",
    discoveredBy: "ISW cross-reference",
    status: "resolved",
  },
  {
    id: "COR-2026-005",
    date: "2026-04-08",
    originalEvent: "evt_2026_04_07_odesa_77e2",
    type: "casualty_figure",
    original:
      "Two civilian fatalities reported following drone strike on port infrastructure, Odesa, 7 April 2026.",
    correction:
      "Casualty figure revised to one fatality and three injured after regional prosecutor's office statement.",
    severity: "minor",
    discoveredBy: "Odesa Regional Prosecutor's Office (official statement)",
    status: "resolved",
  },
  {
    id: "COR-2026-004",
    date: "2026-03-30",
    originalEvent: "evt_2026_03_28_zaporizhzhia_91bd",
    type: "geolocation_correction",
    original:
      "Glide-bomb impact on residential block, Zaporizhzhia, 28 March 2026, coordinates given at street accuracy.",
    correction:
      "Geolocation downgraded from street to district accuracy after initial coordinate was traced to an unrelated image; precise location remains unverified.",
    severity: "minor",
    discoveredBy: "Community report #3128",
    status: "resolved",
  },
  {
    id: "COR-2026-002",
    date: "2026-03-14",
    originalEvent: "evt_2026_03_11_donetsk_4c08",
    type: "attribution",
    original:
      "Artillery shelling attributed to Russian forces near Avdiivka direction, 11 March 2026.",
    correction:
      "Attribution removed; event retained as shelling of unclear origin pending corroboration. Confidence score lowered from 72 to 48.",
    severity: "major",
    discoveredBy: "Reuters wire correction (conflicting OSINT analyses)",
    status: "resolved",
  },
];

const TYPE_LABELS: Record<CorrectionType, string> = {
  geolocation_correction: "Geolocation",
  source_reliability: "Source reliability",
  retraction: "Retraction",
  attribution: "Attribution",
  casualty_figure: "Casualty figure",
};

const TYPE_STYLES: Record<CorrectionType, string> = {
  geolocation_correction:
    "border-blue-500/40 bg-blue-500/10 text-blue-400",
  source_reliability:
    "border-purple-500/40 bg-purple-500/10 text-purple-400",
  retraction:
    "border-red-500/40 bg-red-500/10 text-red-400",
  attribution:
    "border-orange-500/40 bg-orange-500/10 text-orange-400",
  casualty_figure:
    "border-amber-500/40 bg-amber-500/10 text-amber-400",
};

const SEVERITY_STYLES: Record<Severity, string> = {
  minor: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
  major: "border-red-500/40 bg-red-500/10 text-red-400",
};

const retractionCount = CORRECTIONS.filter((c) => c.type === "retraction").length;
const totalCount = CORRECTIONS.length;

// Avg resolution days — hardcoded representative value
const AVG_RESOLUTION_DAYS = 4;

export default async function CorrectionsPage({
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
    author: { "@type": "Organization", name: "Aegis Lens" },
    publisher: { "@type": "Organization", name: "Aegis Lens" },
  };

  return (
    <>
      <PageHeader eyebrow="Trust" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Intro */}
        <p className="text-sm text-text-secondary max-w-2xl">
          Every published event in Aegis Lens that is materially amended after publication appears
          here in reverse chronological order. The original claim is preserved verbatim so the
          change is fully auditable. We treat transparency as a hard requirement, not a
          best-effort.
        </p>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { label: "Total corrections", value: String(totalCount) },
            { label: "Retractions", value: String(retractionCount) },
            { label: "Avg resolution", value: `${AVG_RESOLUTION_DAYS} days` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded border border-border-subtle bg-bg-surface p-4"
            >
              <div className="font-mono text-2xl text-text-primary">{value}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-text-muted">{label}</div>
            </div>
          ))}
        </div>

        {/* Corrections log */}
        <ol className="mt-10 space-y-6 list-none pl-0">
          {CORRECTIONS.map((c) => (
            <li
              key={c.id}
              className="rounded border border-border-subtle bg-bg-surface p-5"
            >
              {/* Header row */}
              <div className="flex flex-wrap items-center gap-2">
                {/* ID */}
                <span className="rounded border border-border-subtle bg-bg-elevated px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  {c.id}
                </span>
                {/* Date */}
                <time
                  dateTime={c.date}
                  className="font-mono text-[10px] uppercase tracking-widest text-accent"
                >
                  {c.date}
                </time>
                {/* Type badge */}
                <span
                  className={`rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${TYPE_STYLES[c.type]}`}
                >
                  {TYPE_LABELS[c.type]}
                </span>
                {/* Severity badge */}
                <span
                  className={`rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${SEVERITY_STYLES[c.severity]}`}
                >
                  {c.severity}
                </span>
                {/* Status badge */}
                <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald-400">
                  {c.status}
                </span>
              </div>

              {/* Event ref */}
              {c.originalEvent && (
                <p className="mt-2 font-mono text-[10px] text-text-muted">
                  Event: {c.originalEvent}
                </p>
              )}

              {/* Before / After comparison */}
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded bg-red-500/5 border border-red-500/20 p-3 text-xs">
                  <div className="font-mono text-[9px] uppercase text-red-400 mb-1">
                    Original (incorrect)
                  </div>
                  <p className="text-text-secondary">{c.original}</p>
                </div>
                <div className="rounded bg-green-500/5 border border-green-500/20 p-3 text-xs">
                  <div className="font-mono text-[9px] uppercase text-green-400 mb-1">
                    Correction
                  </div>
                  <p className="text-text-secondary">{c.correction}</p>
                </div>
              </div>

              {/* Discovered by */}
              <p className="mt-3 text-xs text-text-muted">
                <span className="uppercase tracking-wider">Discovered by:</span>{" "}
                <span className="text-text-secondary">{c.discoveredBy}</span>
              </p>
            </li>
          ))}
        </ol>

        {/* Footer note */}
        <p className="mt-10 text-xs text-text-muted border-t border-border-subtle pt-6">
          To report a potential error in a published event, email{" "}
          <a
            href="mailto:corrections@aegislens.io"
            className="text-accent underline-offset-2 hover:underline"
          >
            corrections@aegislens.io
          </a>{" "}
          with the event ID and supporting evidence. We acknowledge all reports within 48 hours and
          commit to a public resolution within 14 days.
        </p>
      </div>
    </>
  );
}
