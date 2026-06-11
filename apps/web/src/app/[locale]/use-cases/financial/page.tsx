import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Aegis Lens for financial services";
const DESCRIPTION =
  "Shipping disruption, commodity supply shocks, and insurance loss modeling for hedge funds, commodity traders, and underwriters. Structured event data with auditable confidence and provenance.";

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
    pathFor: (lc) => localePath(lc, "/use-cases/financial"),
  });
}

const USE_CASES = [
  {
    name: "Shipping disruption",
    body: "Real-time tracking of port strikes, choke-point incidents, and route closures with confidence-scored history for backtesting freight-rate models.",
  },
  {
    name: "Commodity supply",
    body: "Granular event records on energy infrastructure, grain corridors, and metals processing — clean exports for quant pipelines.",
  },
  {
    name: "Insurance loss modeling",
    body: "Spatial event density and damage-corroboration signals for war-risk, marine, and political-violence portfolios.",
  },
  {
    name: "Counterparty and ESG screening",
    body: "Asset-level exposure to incidents in conflict zones, with auditable source trails for compliance and disclosure.",
  },
];

const FEATURES = [
  {
    name: "Map",
    body: "Asset-overlay view with severity heatmaps, choke-point monitors, and configurable AOIs for trader and analyst desks.",
  },
  {
    name: "API",
    body: "Low-latency REST and streaming endpoints, point-in-time replays, and parquet snapshots for backtesting.",
  },
  {
    name: "Alerts",
    body: "Threshold-based webhooks for desks and risk teams — keyed by asset, AOI, or commodity class.",
  },
];

export default async function FinancialUseCasePage({
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
      audienceType: "Hedge funds, commodity traders, and insurance underwriters",
    },
    areaServed: "Worldwide",
  };

  return (
    <>
      <PageHeader eyebrow="Use case · Financial" title={TITLE} description={DESCRIPTION} />
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
            <path d="M6 38 L18 24 L26 32 L42 12" />
            <path d="M30 12 H42 V24" />
          </svg>
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Signal you can put into a model
            </h2>
            <p className="mt-3 text-text-secondary">
              Markets do not move on rumour; they move on structured, time-stamped, defensible
              events. Aegis Lens converts the noise of conflict reporting into a clean stream of
              classified events with confidence, location accuracy, and full source provenance —
              ready for the systems your quants, analysts, and underwriters already run.
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
              “Point-in-time replays were the unlock. We could backtest a freight-rate signal
              against the exact event picture the market saw on the day.”
            </blockquote>
            <p className="mt-2 text-sm text-text-muted">
              — Commodities portfolio manager, illustrative.
            </p>
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
            Commercial deployments come with point-in-time replay, SLA, and dedicated onboarding.
            We are happy to run a paid evaluation against your existing models.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              className="inline-block rounded border border-accent px-4 py-2 font-mono text-sm text-accent hover:bg-accent hover:text-bg-base"
              href="mailto:sales@aegislens.example?subject=Financial%20services%20inquiry"
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
