import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Partner Program";
const DESCRIPTION =
  "Work with Aegis Lens — strategic partners, implementation partners, and OSINT research collaborators. Tiered partnerships with shared values around verification and open data.";

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
    pathFor: (lc) => localePath(lc, "/partners"),
  });
}

type Tier = {
  name: string;
  tagline: string;
  bullets: string[];
};

const TIERS: Tier[] = [
  {
    name: "Strategic",
    tagline: "Long-term joint initiatives, co-marketing, and roadmap alignment.",
    bullets: [
      "Quarterly roadmap syncs and named partner manager",
      "Co-branded research and joint publications",
      "Priority access to new data products before public release",
    ],
  },
  {
    name: "Implementation",
    tagline: "Integrators and consultancies who deploy Aegis Lens for end customers.",
    bullets: [
      "Technical onboarding, certification, and reference architectures",
      "Reseller margin and deal-registration protection",
      "Sandbox API tier for development and demos",
    ],
  },
  {
    name: "OSINT Research",
    tagline: "Newsrooms, NGOs, and academic teams contributing to the open record.",
    bullets: [
      "Free or discounted access for non-commercial research",
      "Two-way attribution and tip-sharing workflow",
      "Co-authored case studies and shared verification standards",
    ],
  },
];

type Partner = {
  name: string;
  tier: string;
  blurb: string;
};

const DIRECTORY: Partner[] = [
  {
    name: "Northwind Geospatial",
    tier: "Strategic",
    blurb:
      "Commercial satellite imagery analysis. Joint product on high-cadence damage assessment.",
  },
  {
    name: "Kyiv Open Data Lab",
    tier: "OSINT Research",
    blurb:
      "Independent civic-tech collective. Shared verification standards and tipline integration.",
  },
  {
    name: "Meridian Risk Advisory",
    tier: "Implementation",
    blurb:
      "Enterprise risk and duty-of-care platform. Deploys Aegis Lens feeds for client portfolios.",
  },
  {
    name: "Lighthouse Reports Network",
    tier: "OSINT Research",
    blurb:
      "Cross-border investigative journalism cooperative. Co-published verification dossiers.",
  },
  {
    name: "Atlas Field Systems",
    tier: "Implementation",
    blurb:
      "Field-operations integrator for humanitarian logistics. Embeds danger scoring into routing.",
  },
];

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: locale,
  };

  return (
    <>
      <PageHeader eyebrow="Partners" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-10">
        <section>
          <h2 className="text-xl font-semibold text-text-primary">Why partner with us</h2>
          <p className="mt-3 text-text-secondary">
            Aegis Lens combines structured event data, transparent methodology, and an active
            verification team. Partners gain a defensible data backbone and a collaborator that
            takes attribution, ethics, and operational security seriously — not a black-box vendor.
          </p>
          <ul className="mt-4 grid gap-2 text-text-secondary md:grid-cols-2">
            <li className="rounded border border-border-subtle bg-bg-surface p-3">
              Citable, methodology-backed records — every claim traces to sources.
            </li>
            <li className="rounded border border-border-subtle bg-bg-surface p-3">
              Coverage built by analysts, not scraped feeds.
            </li>
            <li className="rounded border border-border-subtle bg-bg-surface p-3">
              Open data license for core event metadata.
            </li>
            <li className="rounded border border-border-subtle bg-bg-surface p-3">
              A team that ships — quarterly product releases, public changelog.
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Partner tiers</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {TIERS.map((t) => (
              <article
                key={t.name}
                className="rounded border border-border-subtle bg-bg-surface p-4"
              >
                <p className="font-mono text-xs uppercase tracking-widest text-accent">
                  {t.name}
                </p>
                <p className="mt-2 text-sm text-text-secondary">{t.tagline}</p>
                <ul className="mt-3 space-y-1 text-sm text-text-secondary">
                  {t.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span aria-hidden="true" className="text-accent">
                        ›
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Partner directory</h2>
          <p className="mt-2 text-sm text-text-muted">Example partners — directory is illustrative.</p>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {DIRECTORY.map((p) => (
              <li
                key={p.name}
                className="rounded border border-border-subtle bg-bg-surface p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-semibold text-text-primary">{p.name}</h3>
                  <span className="font-mono text-xs uppercase tracking-widest text-accent">
                    {p.tier}
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-secondary">{p.blurb}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">How to apply</h2>
          <p className="mt-3 text-text-secondary">
            Send a short note describing your organization, the tier you are interested in, and how
            you would like to collaborate. We respond to qualified inquiries within five business
            days.
          </p>
          <p className="mt-4">
            <a
              className="inline-block rounded border border-accent px-4 py-2 font-mono text-sm text-accent hover:bg-accent hover:text-bg-base"
              href="mailto:partners@aegislens.example?subject=Partner%20program%20inquiry"
            >
              partners@aegislens.example
            </a>
          </p>
        </section>
      </div>
    </>
  );
}
