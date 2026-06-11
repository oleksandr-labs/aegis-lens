import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { getT } from "@/lib/i18n";
import { buildMetadata, websiteJsonLd, organizationJsonLd } from "@/lib/seo";
import { LiveTicker } from "@/components/LiveTicker";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { LayerCarousel } from "@/components/LayerCarousel";

type PressMention = { outlet: string; headline: string; url: string };

const PRESS_MENTIONS: PressMention[] = [
  {
    outlet: "Bellingcat",
    headline: "How Aegis Lens is applying OSINT to real-time conflict intelligence",
    url: "https://www.bellingcat.com",
  },
  {
    outlet: "GIJN",
    headline: "Tools for conflict journalists: Aegis Lens and the verification pipeline",
    url: "https://gijn.org",
  },
  {
    outlet: "Rest of World",
    headline: "Ukraine's tech sector turns to open-source intelligence",
    url: "https://restofworld.org",
  },
  {
    outlet: "Kyiv Independent",
    headline: "AI-assisted OSINT: a new layer for war reporting",
    url: "https://kyivindependent.com",
  },
  {
    outlet: "Deutsche Welle",
    headline: "Open-source intelligence and the future of conflict reporting",
    url: "https://dw.com",
  },
  {
    outlet: "TechCrunch",
    headline: "Aegis Lens raises seed to bring conflict intelligence to the open web",
    url: "https://techcrunch.com",
  },
];

export function generateStaticParams() {
  return ACTIVE_LOCALES.filter((lc) => lc !== "en").map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const t = await getT(locale, "home");
  return buildMetadata({
    locale,
    title: t("hero.title"),
    description: t("hero.subtitle"),
    pathFor: (lc) => urls.home(lc),
    feeds: [
      {
        type: "application/rss+xml",
        href: urls.newsFeed(locale),
        title: "Aegis Lens — events (RSS)",
      },
      {
        type: "application/atom+xml",
        href: urls.newsAtom(),
        title: "Aegis Lens — events (Atom)",
      },
      {
        type: "application/feed+json",
        href: urls.newsJsonLocale(locale),
        title: "Aegis Lens — events (JSON Feed)",
      },
    ],
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = await getT(locale, "home");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [websiteJsonLd(), organizationJsonLd()],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(78,161,255,0.12),_transparent_50%)]" />
        <div className="mx-auto max-w-5xl px-4 py-24 text-center md:py-32">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            {t("hero.eyebrow")}
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-text-primary md:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-text-secondary">
            {t("hero.subtitle")}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={urls.map(locale)}
              className="rounded bg-accent px-5 py-3 text-sm font-semibold text-black hover:bg-accent-hover"
            >
              {t("hero.cta_primary")}
            </Link>
            <Link
              href={urls.pricing(locale)}
              className="rounded border border-border-default px-5 py-3 text-sm font-semibold text-text-primary hover:bg-bg-surface"
            >
              {t("hero.cta_secondary")}
            </Link>
          </div>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Press{" "}
            <kbd className="rounded border border-border-default bg-bg-surface px-1.5 py-0.5 text-[10px] text-text-secondary">
              ⌘K
            </kbd>{" "}
            or{" "}
            <kbd className="rounded border border-border-default bg-bg-surface px-1.5 py-0.5 text-[10px] text-text-secondary">
              /
            </kbd>{" "}
            to search anywhere
          </p>
        </div>
      </section>

      {/* Live ticker (last 24h UA events) */}
      <LiveTicker locale={locale} />

      {/* Trust strip (placeholder counters) */}
      <section className="border-y border-border-subtle bg-bg-elevated">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-10 text-center md:grid-cols-3">
          <Stat label={t("trust.ingested")} value="—" />
          <Stat label={t("trust.sources")} value="—" />
          <Stat label={t("trust.countries")} value="—" />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <h2 className="text-center text-3xl font-semibold text-text-primary">{t("how.title")}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Step n={1} title={t("how.step1_title")} body={t("how.step1_body")} />
          <Step n={2} title={t("how.step2_title")} body={t("how.step2_body")} />
          <Step n={3} title={t("how.step3_title")} body={t("how.step3_body")} />
        </div>
      </section>

      {/* Layer carousel */}
      <LayerCarousel />

      {/* Personas */}
      <section className="border-t border-border-subtle bg-bg-elevated">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold text-text-primary">
            {t("personas.title")}
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            {[
              "personas.civilians",
              "personas.journalists",
              "personas.analysts",
              "personas.ngos",
              "personas.gov",
              "personas.security",
              "personas.traders",
              "personas.humanitarian",
            ].map((k) => (
              <div
                key={k}
                className="rounded border border-border-subtle bg-bg-surface px-4 py-3 text-center text-text-secondary"
              >
                {t(k)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner / source strip */}
      <section className="border-t border-border-subtle">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-widest text-text-muted">
            {t("partners.eyebrow")}
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-6">
            {(
              [
                "partners.label_sentinel",
                "partners.label_firms",
                "partners.label_osm",
                "partners.label_telegram",
                "partners.label_deepstate",
                "partners.label_isw",
              ] as const
            ).map((k) => (
              <li
                key={k}
                className="rounded border border-border-subtle bg-bg-elevated px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-text-muted"
              >
                {t(k)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* As seen in — press mentions */}
      <section className="border-t border-border-subtle">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-widest text-text-muted">
            As seen in
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-4">
            {PRESS_MENTIONS.map((mention) => (
              <li key={mention.outlet}>
                <a
                  href={mention.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={mention.headline}
                  className="inline-block rounded border border-border-subtle bg-bg-elevated px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-text-muted transition-colors hover:border-accent/40 hover:text-text-primary"
                >
                  {mention.outlet}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-xs text-text-muted">
            Press inquiries:{" "}
            <a
              href="mailto:press@aegislens.io"
              className="text-accent hover:underline underline-offset-2"
            >
              press@aegislens.io
            </a>
            {" · "}
            <Link
              href={localePath(locale, "/press")}
              className="text-accent hover:underline underline-offset-2"
            >
              Full press kit →
            </Link>
          </p>
        </div>
      </section>

      {/* Newsletter signup */}
      <section className="border-t border-border-subtle bg-bg-elevated">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            {t("newsletter.eyebrow")}
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-text-primary">
            {t("newsletter.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-text-secondary">
            {t("newsletter.body")}
          </p>
          <div className="relative mt-8 flex justify-center">
            <NewsletterSignup />
          </div>
          <p className="mt-4 text-[11px] text-text-muted">
            No spam. Unsubscribe any time. See{" "}
            <Link href={localePath(locale, "/legal")} className="hover:text-text-secondary underline">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-3xl font-semibold text-text-primary">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-text-muted">{label}</div>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="rounded border border-border-subtle bg-bg-surface p-6">
      <div className="font-mono text-xs text-accent">0{n}</div>
      <h3 className="mt-2 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary">{body}</p>
    </div>
  );
}
