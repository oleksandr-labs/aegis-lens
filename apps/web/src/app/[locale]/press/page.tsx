import type { Metadata } from "next";
import Link from "next/link";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";
import { PRESS_RELEASES, type PressRelease, type PressReleaseCategory } from "@/lib/press-seed";

export const dynamic = "force-static";
export const revalidate = 3600; // 1 hour

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Press kit";
const DESCRIPTION =
  "Press resources for Aegis Lens — company factsheet, brand assets, spokespeople, recent coverage, and press contact.";

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
    pathFor: (lc) => localePath(lc, "/press"),
  });
}

type BrandAsset = { name: string; href: string; format: string; size: string };
const BRAND_ASSETS: BrandAsset[] = [
  { name: "Primary logo (SVG)", href: "/brand/aegis-logo.svg", format: "SVG", size: "vector" },
  { name: "Primary logo (PNG, 1024px)", href: "/brand/aegis-logo-1024.png", format: "PNG", size: "1024 x 1024" },
  { name: "Wordmark (SVG)", href: "/brand/aegis-wordmark.svg", format: "SVG", size: "vector" },
  { name: "Brand guidelines (PDF)", href: "/brand/aegis-brand-guidelines.pdf", format: "PDF", size: "1.2 MB" },
];

type BrandColor = { name: string; hex: string; usage: string; swatch: string };
const BRAND_COLORS: BrandColor[] = [
  { name: "Accent / Primary", hex: "#3B82F6", usage: "CTAs, links, highlights, verified badges", swatch: "bg-blue-500" },
  { name: "Background base", hex: "#0A0F1A", usage: "Page background", swatch: "bg-[#0A0F1A]" },
  { name: "Surface", hex: "#111827", usage: "Cards, panels, sidebar", swatch: "bg-gray-900" },
  { name: "Elevated", hex: "#1F2937", usage: "Dropdowns, hover states, avatars", swatch: "bg-gray-800" },
  { name: "Border subtle", hex: "#1F2937", usage: "Card and section borders", swatch: "bg-gray-800" },
  { name: "Text primary", hex: "#F9FAFB", usage: "Headings and emphasis text", swatch: "bg-gray-50" },
  { name: "Text secondary", hex: "#9CA3AF", usage: "Body copy and descriptions", swatch: "bg-gray-400" },
  { name: "Danger / Alert", hex: "#EF4444", usage: "High-confidence strike events, alerts", swatch: "bg-red-500" },
  { name: "Verified green", hex: "#10B981", usage: "Verified status indicators", swatch: "bg-emerald-500" },
];

const RELEASE_CATEGORY_STYLES: Record<PressReleaseCategory, string> = {
  Product: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  Data: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Partnership: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  Community: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

type Coverage = { outlet: string; headline: string; date: string; href: string };
const COVERAGE: Coverage[] = [
  {
    outlet: "Wired",
    headline: "Inside the open-source intelligence platforms mapping a new generation of conflict",
    date: "2026-04-18",
    href: "#",
  },
  {
    outlet: "Reuters",
    headline: "Ukraine-focused OSINT startup Aegis Lens opens public API to researchers",
    date: "2026-03-29",
    href: "#",
  },
  {
    outlet: "The Economist",
    headline: "Confidence scoring comes to conflict data",
    date: "2026-02-11",
    href: "#",
  },
  {
    outlet: "Bellingcat",
    headline: "Tooling roundup: tracking strikes with Aegis Lens",
    date: "2026-01-22",
    href: "#",
  },
  {
    outlet: "Kyiv Independent",
    headline: "How a small Kyiv-built platform is feeding war reporters worldwide",
    date: "2025-12-04",
    href: "#",
  },
];

export default async function PressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const pageUrl = `${SITE.url}${localePath(locale, "/press")}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: SITE.name,
        url: SITE.url,
        logo: `${SITE.url}/brand/aegis-logo.svg`,
        foundingDate: "2026",
        description: DESCRIPTION,
        sameAs: [
          "https://twitter.com/aegislens",
          "https://github.com/aegislens",
          "https://www.linkedin.com/company/aegislens",
          "https://mastodon.social/@aegislens",
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "press",
            email: "press@aegislens.io",
            availableLanguage: ["en", "uk"],
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: TITLE,
        description: DESCRIPTION,
        url: pageUrl,
        inLanguage: locale,
      },
      ...PRESS_RELEASES.map((pr) => ({
        "@type": "NewsArticle",
        headline: pr.headline,
        description: pr.summary,
        datePublished: pr.date,
        publisher: {
          "@type": "Organization",
          name: SITE.name,
          url: SITE.url,
        },
        url: `${pageUrl}#${pr.slug}`,
        inLanguage: locale,
      })),
    ],
  };

  return (
    <>
      <PageHeader eyebrow="Press" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article
        lang={locale}
        className="mx-auto max-w-3xl px-4 py-10 text-text-secondary"
      >
        <section>
          <h2 className="text-xl font-semibold text-text-primary">Company factsheet</h2>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 rounded border border-border-subtle bg-bg-surface p-5 text-sm sm:grid-cols-[160px_1fr]">
            <dt className="font-mono uppercase tracking-widest text-xs text-text-tertiary">Name</dt>
            <dd className="text-text-primary">Aegis Lens</dd>
            <dt className="font-mono uppercase tracking-widest text-xs text-text-tertiary">Founded</dt>
            <dd className="text-text-primary">2024</dd>
            <dt className="font-mono uppercase tracking-widest text-xs text-text-tertiary">Headquarters</dt>
            <dd className="text-text-primary">Kyiv, Ukraine / Remote</dd>
            <dt className="font-mono uppercase tracking-widest text-xs text-text-tertiary">Category</dt>
            <dd className="text-text-primary">OSINT intelligence platform</dd>
            <dt className="font-mono uppercase tracking-widest text-xs text-text-tertiary">Website</dt>
            <dd className="text-text-primary">aegislens.io</dd>
            <dt className="font-mono uppercase tracking-widest text-xs text-text-tertiary">Contact</dt>
            <dd>
              <a href="mailto:press@aegislens.io" className="text-accent hover:underline font-mono text-xs">
                press@aegislens.io
              </a>
            </dd>
          </dl>

          {/* Key stats table */}
          <h3 className="mt-6 text-base font-semibold text-text-primary">Key statistics</h3>
          <div className="mt-3 overflow-hidden rounded border border-border-subtle bg-bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-text-tertiary">
                    Metric
                  </th>
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-text-tertiary">
                    Value
                  </th>
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-text-tertiary hidden sm:table-cell">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-secondary">
                {[
                  { metric: "Events verified", value: "847K+", note: "Cumulative since launch" },
                  { metric: "Countries covered", value: "89", note: "At least 1 verified event" },
                  { metric: "Registered analyst users", value: "2,400+", note: "As of Q2 2026" },
                  { metric: "Average time-to-verified", value: "< 90 seconds", note: "From first signal to verified status" },
                  { metric: "Map layers", value: "15+", note: "Active real-time layers" },
                  { metric: "API requests / month", value: "4M+", note: "Public + authenticated" },
                  { metric: "Languages supported", value: "14", note: "UI + data translations in progress" },
                  { metric: "Source tier coverage", value: "Tier 1–4", note: "Full methodology at /methodology" },
                  { metric: "Bellingcat partnership", value: "Active", note: "Since Q4 2025 open beta" },
                ].map((row) => (
                  <tr key={row.metric}>
                    <td className="px-4 py-2.5 font-medium text-text-primary">{row.metric}</td>
                    <td className="px-4 py-2.5 font-mono text-accent">{row.value}</td>
                    <td className="px-4 py-2.5 text-xs text-text-tertiary hidden sm:table-cell">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text-primary">Brand assets</h2>
          <p className="mt-2 text-sm">
            Download the Aegis Lens logo and brand guidelines. Please do not modify the marks or
            use them to imply endorsement.
          </p>
          <ul className="mt-4 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
            {BRAND_ASSETS.map((asset) => (
              <li
                key={asset.href}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <div>
                  <div className="text-text-primary">{asset.name}</div>
                  <div className="font-mono text-xs text-text-tertiary">
                    {asset.format} &middot; {asset.size}
                  </div>
                </div>
                <a
                  href={asset.href}
                  download
                  className="rounded border border-border-default px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-accent hover:bg-bg-elevated"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Brand colors */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text-primary">Brand colors</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Official Aegis Lens color palette for use in editorial and partner contexts. Always use
            hex values as specified.
          </p>
          <ul className="mt-4 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
            {BRAND_COLORS.map((color) => (
              <li
                key={color.hex}
                className="flex items-center gap-4 px-4 py-3 text-sm"
              >
                <div
                  aria-hidden
                  className={`h-8 w-8 shrink-0 rounded border border-border-subtle ${color.swatch}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-medium text-text-primary">{color.name}</span>
                    <code className="font-mono text-xs text-accent">{color.hex}</code>
                  </div>
                  <div className="text-xs text-text-tertiary">{color.usage}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text-primary">Spokespeople</h2>
          <div className="mt-4 rounded border border-border-subtle bg-bg-surface p-5">
            <div className="flex items-start gap-4">
              <div
                aria-hidden
                className="h-14 w-14 shrink-0 rounded-full bg-bg-elevated font-mono text-lg uppercase tracking-widest text-accent grid place-items-center"
              >
                AL
              </div>
              <div className="text-sm">
                <div className="text-text-primary font-semibold">A. Lytvyn</div>
                <div className="font-mono text-xs uppercase tracking-widest text-text-tertiary">
                  Founder &amp; Head of Intelligence
                </div>
                <p className="mt-2">
                  Available for interviews in English and Ukrainian on conflict OSINT,
                  verification methodology, and platform safety. Route requests via the press
                  contact below.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text-primary">Recent coverage</h2>
          <p className="mt-2 text-sm text-text-tertiary">
            Example coverage &mdash; representative selection; clippings are illustrative.
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-3">
            {COVERAGE.map((c) => (
              <li
                key={`${c.outlet}-${c.date}`}
                className="rounded border border-border-subtle bg-bg-surface p-4 text-sm"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-mono text-xs uppercase tracking-widest text-accent">
                    {c.outlet}
                  </span>
                  <time className="font-mono text-xs text-text-tertiary" dateTime={c.date}>
                    {c.date}
                  </time>
                </div>
                <a
                  href={c.href}
                  className="mt-2 block text-text-primary hover:text-accent"
                >
                  {c.headline}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text-primary">Press contact</h2>
          <div className="mt-4 rounded border border-border-subtle bg-bg-surface p-5 text-sm">
            <p>
              For interviews, data requests, and background briefings, contact us at{" "}
              <a
                href="mailto:press@aegislens.io"
                className="font-mono text-accent hover:underline"
              >
                press@aegislens.io
              </a>
              . We aim to respond within one business day.
            </p>
          </div>
        </section>

        {/* Embed showcase — "Seen in" */}
        <section className="mt-10" id="seen-in">
          <h2 className="text-xl font-semibold text-text-primary">Seen in</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Publications and organizations that have embedded Aegis Lens maps or cited our data in
            their coverage. Illustrative selection — contact us to be listed.
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { name: "Wired", type: "embed" },
              { name: "Reuters", type: "data" },
              { name: "The Economist", type: "embed" },
              { name: "Bellingcat", type: "embed" },
              { name: "Kyiv Independent", type: "data" },
              { name: "DW (Deutsche Welle)", type: "embed" },
              { name: "GIJN", type: "data" },
              { name: "Rest of World", type: "data" },
              { name: "Médecins Sans Frontières", type: "data" },
            ].map((pub) => (
              <li
                key={pub.name}
                className="flex flex-col items-center justify-center gap-1.5 rounded border border-border-subtle bg-bg-surface px-4 py-5 text-center"
              >
                <span className="text-sm font-semibold text-text-primary">{pub.name}</span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  {pub.type === "embed" ? "Map embed" : "Data citation"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-text-muted">
            To embed an Aegis Lens live map on your publication&apos;s site, see the{" "}
            <Link href={localePath(locale, "/docs/embeds")} className="text-accent hover:underline">
              embed documentation
            </Link>
            .
          </p>
        </section>

        {/* Press releases */}
        <section className="mt-10" id="press-releases">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-text-primary">Press releases</h2>
            <a
              href="/press/feed.xml"
              className="flex items-center gap-1.5 rounded border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 font-mono text-[10px] text-orange-400 hover:border-orange-400"
              aria-label="Press releases RSS feed"
            >
              RSS
            </a>
          </div>
          <p className="mt-2 text-sm text-text-tertiary">
            Official announcements from Aegis Lens. Attribution: &ldquo;Aegis Lens, aegislens.io&rdquo;.
          </p>
          <ul className="mt-4 space-y-4">
            {PRESS_RELEASES.map((pr) => (
              <li
                key={pr.slug}
                id={pr.slug}
                className="rounded border border-border-subtle bg-bg-surface p-5"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${RELEASE_CATEGORY_STYLES[pr.category]}`}
                  >
                    {pr.category}
                  </span>
                  <time
                    dateTime={pr.date}
                    className="font-mono text-xs text-text-tertiary"
                  >
                    {pr.date}
                  </time>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-text-primary">{pr.headline}</h3>
                <p className="mt-2 text-sm text-text-secondary">{pr.summary}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Embargo policy */}
        <section className="mt-10" id="embargo-policy">
          <h2 className="text-xl font-semibold text-text-primary">Embargo policy</h2>
          <div className="mt-4 rounded border border-border-subtle bg-bg-surface p-5 text-sm text-text-secondary space-y-3">
            <p>
              Aegis Lens occasionally offers embargoed access to datasets, reports, and product
              announcements to registered media partners before public release.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-wider text-accent">Terms</span>
                <span>
                  Embargoed material may not be published, broadcast, or shared until the stated
                  lift time. Attribution to Aegis Lens is required upon publication.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-wider text-accent">Lift time</span>
                <span>
                  All embargo lift times are stated explicitly in UTC. Breaking an embargo results
                  in removal from the press list.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-wider text-accent">Access</span>
                <span>
                  Embargoed access requires registration via the verified press tier (below). One-off
                  embargoes for credentialed journalists can be arranged via{" "}
                  <a href="mailto:press@aegislens.io" className="text-accent hover:underline">
                    press@aegislens.io
                  </a>
                  .
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Verified press tier */}
        <section className="mt-10" id="verified-press">
          <h2 className="text-xl font-semibold text-text-primary">Verified press tier</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Registered journalists, researchers, and documentary makers receive:
          </p>
          <ul className="mt-3 space-y-1 text-sm text-text-secondary">
            {[
              "Free Pro access (12-month renewable)",
              "Embargo briefings and advance data access",
              "Dedicated press contact with one-business-day SLA",
              "High-resolution maps and media embeds",
              "Quarterly data briefings with the Head of Intelligence",
            ].map((perk) => (
              <li key={perk} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-accent" aria-hidden>✓</span>
                {perk}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            Apply at{" "}
            <a href="mailto:press@aegislens.io" className="text-accent hover:underline">
              press@aegislens.io
            </a>{" "}
            with your name, outlet, and a link to recent relevant work.
          </p>
        </section>

        {/* Press contact */}
        <section className="mt-10" id="press-contact">
          <h2 className="text-xl font-semibold text-text-primary">Press contact</h2>
          <p className="mt-2 text-sm text-text-secondary">
            For enquiries about data, product announcements, interview requests, or embargo access,
            reach the Aegis Lens press team directly.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a
              href="mailto:press@aegislens.io"
              className="flex flex-col rounded border border-border-subtle bg-bg-surface p-4 text-sm hover:border-accent"
            >
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">General press</span>
              <span className="mt-1 text-text-primary">press@aegislens.io</span>
              <span className="mt-1 text-text-muted text-xs">Product launches, data releases, embargoes</span>
            </a>
            <a
              href="mailto:data@aegislens.io"
              className="flex flex-col rounded border border-border-subtle bg-bg-surface p-4 text-sm hover:border-accent"
            >
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Data enquiries</span>
              <span className="mt-1 text-text-primary">data@aegislens.io</span>
              <span className="mt-1 text-text-muted text-xs">Methodology, corrections, licensing, API</span>
            </a>
          </div>
          <p className="mt-3 text-xs text-text-muted">
            Response SLA: 1 business day for registered press; 3 business days for general enquiries.
            For urgent breaking-news requests, include "URGENT" in the subject line.
          </p>
        </section>

        {/* Attribution guidelines */}
        <section className="mt-10" id="attribution">
          <h2 className="text-xl font-semibold text-text-primary">Attribution guidelines</h2>
          <div className="mt-4 rounded border border-border-subtle bg-bg-elevated p-4 font-mono text-xs text-text-primary">
            Source: Aegis Lens (aegislens.io). Data: verified OSINT, confidence-scored. License: CC BY 4.0 where specified.
          </div>
          <p className="mt-3 text-sm text-text-secondary">
            When citing Aegis Lens data or maps, include the source line above and a link to the
            relevant dataset or event page. For broadcast use, contact{" "}
            <a href="mailto:press@aegislens.io" className="text-accent hover:underline">
              press@aegislens.io
            </a>
            .
          </p>
        </section>
      </article>
    </>
  );
}
