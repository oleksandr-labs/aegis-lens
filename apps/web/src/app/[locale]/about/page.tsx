import type { Metadata } from "next";
import Link from "next/link";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";

const TITLE = "Built to make verified intelligence accessible to everyone";
const EYEBROW = "About Aegis Lens";
const DESCRIPTION =
  "We started Aegis Lens because the world's most important events were being misrepresented — and the tools to verify them were locked behind expensive enterprise contracts.";

export const dynamic = "force-static";
export const revalidate = 3600; // 1 hour

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: `About — ${SITE.name}`,
    description: DESCRIPTION,
    pathFor: (lc) => urls.about(lc),
  });
}

type ValueCard = { title: string; body: string };
const VALUES: ValueCard[] = [
  {
    title: "Verification first",
    body: "Every event must be independently corroborated before it reaches verified status.",
  },
  {
    title: "Source transparency",
    body: "We publish our methodology. Every confidence score is explainable.",
  },
  {
    title: "No agenda",
    body: "We report what the data shows. Editorial independence is non-negotiable.",
  },
];

type Milestone = { year: string; title: string; body: string };
const STORY: Milestone[] = [
  {
    year: "2024",
    title: "The idea",
    body: "Founded after the Kharkiv counteroffensive revealed how fragmented conflict intelligence had become — 40 Telegram channels, no single source of truth.",
  },
  {
    year: "2025 Q1",
    title: "Building the engine",
    body: "First AI verification pipeline: image geolocation, cross-source corroboration, danger scoring. 50K events processed.",
  },
  {
    year: "2025 Q4",
    title: "Open beta",
    body: "Public launch. 2,400+ analysts, journalists and researchers from 89 countries. Partnership with Bellingcat.",
  },
  {
    year: "2026",
    title: "Scale",
    body: "Real-time coverage of 15+ map layers. AI Copilot launched. 14 languages in progress.",
  },
];

type Stat = { value: string; label: string };
const NUMBERS: Stat[] = [
  { value: "847K+", label: "Events verified" },
  { value: "89", label: "Countries covered" },
  { value: "2,400+", label: "Analyst users" },
  { value: "< 90s", label: "Average time-to-verified" },
];

const BACKERS = [
  "Open Future Foundation",
  "OSINT Alliance Fund",
  "Kyiv Digital",
  "Press Freedom Trust",
];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const pageUrl = `${SITE.url}${localePath(locale, "/about")}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        name: TITLE,
        description: DESCRIPTION,
        url: pageUrl,
        inLanguage: locale,
        isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
      },
      organizationJsonLd(),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader eyebrow={EYEBROW} title={TITLE} description={DESCRIPTION} />

      <div className="mx-auto max-w-5xl px-4 py-12 space-y-16">

        {/* Mission + Values */}
        <section id="mission">
          <h2 className="text-xl font-semibold text-text-primary">Our mission</h2>
          <p className="mt-3 text-lg text-text-secondary leading-relaxed max-w-2xl">
            Aegis Lens exists to democratize intelligence. We build tools that let journalists,
            humanitarian workers, governments, and informed citizens see the world as it actually is —
            not as it&apos;s reported.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded border border-border-subtle bg-bg-surface p-5"
              >
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent">
                  {v.title}
                </div>
                <p className="mt-2 text-sm text-text-secondary">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story timeline */}
        <section id="story">
          <h2 className="text-xl font-semibold text-text-primary">Our story</h2>
          <p className="mt-2 text-sm text-text-secondary max-w-2xl">
            From a post-counteroffensive frustration to a platform used by thousands of analysts worldwide.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STORY.map((m, i) => (
              <div
                key={m.year}
                className="relative rounded border border-border-subtle bg-bg-surface p-5"
              >
                {/* connector line for desktop */}
                {i < STORY.length - 1 && (
                  <div
                    aria-hidden
                    className="absolute right-0 top-1/2 hidden h-px w-4 -translate-y-1/2 translate-x-4 bg-border-subtle lg:block"
                  />
                )}
                <div className="font-mono text-xs text-accent">{m.year}</div>
                <div className="mt-1 text-sm font-semibold text-text-primary">{m.title}</div>
                <p className="mt-2 text-xs text-text-secondary leading-relaxed">{m.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* By the numbers */}
        <section id="numbers">
          <h2 className="text-xl font-semibold text-text-primary">By the numbers</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {NUMBERS.map((n) => (
              <div
                key={n.label}
                className="rounded border border-border-subtle bg-bg-surface p-5 text-center"
              >
                <div className="text-3xl font-semibold text-text-primary">{n.value}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  {n.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Methodology (condensed) */}
        <section id="methodology">
          <h2 className="text-xl font-semibold text-text-primary">How we verify</h2>
          <ul className="mt-4 space-y-3 text-sm text-text-secondary">
            {[
              {
                label: "Sources",
                body: "All events derive from publicly available sources — official channels, satellite imagery, ground video, credible media. No dark-web or restricted intelligence.",
              },
              {
                label: "Verification",
                body: "Minimum two independent sources per event. Geolocation checked against satellite imagery. Timestamps cross-referenced with known metadata.",
              },
              {
                label: "AI role",
                body: "AI assists with aggregation, translation, and anomaly detection. All AI outputs carry uncertainty labels and require human review before publication.",
              },
              {
                label: "Corrections",
                body: "Errors are corrected publicly with a dated log. Source reliability scores update when a source publishes false or manipulated content.",
              },
            ].map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-wider text-accent w-20">
                  {item.label}
                </span>
                <span>{item.body}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            <Link
              href={localePath(locale, "/methodology")}
              className="text-accent underline-offset-2 hover:underline"
            >
              Full methodology documentation →
            </Link>
          </p>
        </section>

        {/* Backers / Partners */}
        <section id="backers">
          <h2 className="text-xl font-semibold text-text-primary">Backed by</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Supported by organizations committed to press freedom, open data, and civilian safety.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BACKERS.map((name) => (
              <li
                key={name}
                className="flex items-center justify-center rounded border border-border-subtle bg-bg-surface px-4 py-5 text-center text-sm font-medium text-text-primary"
              >
                {name}
              </li>
            ))}
          </ul>
        </section>

        {/* CTA: Careers + Press */}
        <section id="cta">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
            <div className="rounded border border-border-subtle bg-bg-surface p-6">
              <h3 className="text-base font-semibold text-text-primary">Work with us</h3>
              <p className="mt-2 text-sm text-text-secondary">
                We&apos;re hiring engineers, OSINT analysts, and designers. Remote-first, mission-driven.
              </p>
              <Link
                href={localePath(locale, "/careers")}
                className="mt-4 inline-block text-sm font-medium text-accent hover:underline underline-offset-2"
              >
                See open roles →
              </Link>
            </div>
            <div className="rounded border border-border-subtle bg-bg-surface p-6">
              <h3 className="text-base font-semibold text-text-primary">Press inquiries</h3>
              <p className="mt-2 text-sm text-text-secondary">
                For media inquiries, partnerships, or speaking engagements, reach our press team.
              </p>
              <Link
                href={localePath(locale, "/press")}
                className="mt-4 inline-block text-sm font-medium text-accent hover:underline underline-offset-2"
              >
                Press kit →
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
