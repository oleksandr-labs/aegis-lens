import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Aegis Lens for defense and military";
const DESCRIPTION =
  "Situational awareness, target development, battle damage assessment, and force protection — backed by verified, citable event data with transparent methodology.";

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
    pathFor: (lc) => localePath(lc, "/use-cases/defense"),
  });
}

const USE_CASES = [
  {
    name: "Situational awareness",
    body: "A single, deconflicted operating picture across kinetic events, EW activity, and infrastructure strikes — refreshed continuously and traceable to source.",
  },
  {
    name: "Target development",
    body: "Pattern-of-life and recurrence analysis on adversary fires, supply nodes, and command locations, with structured exports into existing analyst tooling.",
  },
  {
    name: "Battle damage assessment",
    body: "Post-strike corroboration across imagery, eyewitness, and official statements with confidence bands rather than single-source claims.",
  },
  {
    name: "Force protection",
    body: "Geofenced alerts for routes, FOBs, and friendly-civilian sites — built on the same danger model that scores threat to civilians in real time.",
  },
];

const FEATURES = [
  {
    name: "Map",
    body: "Layered tactical map with classification, severity, danger, and confidence filters. Time-slider replay for after-action review.",
  },
  {
    name: "API",
    body: "Versioned REST and streaming endpoints. Stable IDs, full source URLs, ISO timestamps, and accuracy classes on every record.",
  },
  {
    name: "Alerts",
    body: "Geofenced webhooks and email alerts on event class, severity threshold, or specified AOIs with sub-minute median latency.",
  },
];

export default async function DefenseUseCasePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: locale,
    provider: { "@type": "Organization", name: "Aegis Lens" },
    audience: {
      "@type": "Audience",
      audienceType: "Defense ministries and military operational staff",
    },
    areaServed: "Worldwide",
  };

  return (
    <>
      <PageHeader eyebrow="Use case · Defense" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-10">
        <section className="flex items-start gap-5">
          <svg
            aria-hidden="true"
            viewBox="0 0 48 48"
            className="h-12 w-12 shrink-0 text-accent"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
          >
            <path d="M24 4 L42 12 V26 C42 36 34 42 24 44 C14 42 6 36 6 26 V12 Z" />
            <path d="M24 18 V30 M18 24 H30" />
          </svg>
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Decisions at operational tempo</h2>
            <p className="mt-3 text-text-secondary">
              Defense staffs do not need another raw feed. They need a verified, deconflicted record
              of what happened, where, and how reliably it is known — fast enough to brief and
              defensible enough to cite. Aegis Lens delivers that record with explicit confidence
              and danger scores, full source provenance, and integration paths that match how
              military analysts already work.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Where it fits</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {USE_CASES.map((u) => (
              <li
                key={u.name}
                className="rounded border border-border-subtle bg-bg-surface p-4"
              >
                <p className="font-mono text-xs uppercase tracking-widest text-accent">
                  {u.name}
                </p>
                <p className="mt-2 text-sm text-text-secondary">{u.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <div className="rounded border border-border-subtle bg-bg-surface p-5">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">
              Featured customer · Example
            </p>
            <blockquote className="mt-3 text-text-secondary">
              “Aegis Lens replaced four overlapping feeds in our J2 cell. The confidence bands and
              source trails are what made it briefable up the chain.”
            </blockquote>
            <p className="mt-2 text-sm text-text-muted">— Allied ministry analyst, illustrative.</p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Product highlights</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {FEATURES.map((f) => (
              <article
                key={f.name}
                className="rounded border border-border-subtle bg-bg-surface p-4"
              >
                <p className="font-mono text-xs uppercase tracking-widest text-accent">
                  {f.name}
                </p>
                <p className="mt-2 text-sm text-text-secondary">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Next step</h2>
          <p className="mt-3 text-text-secondary">
            Defense deployments are scoped under NDA. Reach out for a classified-friendly briefing
            and reference architecture, or start with the public API.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              className="inline-block rounded border border-accent px-4 py-2 font-mono text-sm text-accent hover:bg-accent hover:text-bg-base"
              href="mailto:sales@aegislens.example?subject=Defense%20deployment%20inquiry"
            >
              Talk to sales
            </a>
            <a
              className="inline-block rounded border border-border-default px-4 py-2 font-mono text-sm text-text-primary hover:border-accent hover:text-accent"
              href={localePath(locale, "/api")}
            >
              Try the API
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
