import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { listTasksFor } from "@/lib/use-case-tasks";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Aegis Lens for civilians and families";
const DESCRIPTION =
  "Real-time safety checks, area alerts, and family watchlists for civilians in or near conflict zones — plain-language risk information with no military jargon.";

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
    pathFor: (lc) => localePath(lc, "/use-cases/civilians"),
  });
}

const USE_CASES = [
  {
    name: "Safety near me",
    body: "Open the map and see verified events in your city or neighbourhood from the past 24 hours — filtered by danger score so you only see what matters.",
  },
  {
    name: "Family watchlist",
    body: "Subscribe to email alerts for any region where family or friends live. You choose the event class and danger level; we notify you when it's crossed.",
  },
  {
    name: "Plain-language guidance",
    body: "Every threat page includes civilian-facing guidance written without military jargon — what to do, where to shelter, and who to contact.",
  },
  {
    name: "Ukrainian residents",
    body: "Ukrainian residents can apply for Pro access at no cost for personal civilian-safety use. See the pricing page for details.",
  },
];

const FEATURES = [
  {
    name: "Live map",
    body: "Filter by city or region, set a 24-hour window, and see only high-danger events. No account required to view the public map.",
  },
  {
    name: "Email alerts",
    body: "Subscribe to any region with your email address — no account required for basic alerts. Set minimum danger score (default: 60) to reduce noise.",
  },
  {
    name: "Region pages",
    body: "Per-country and per-city hubs with plain-language summaries, event counts, and a FAQ section that answers 'is it safe here?'.",
  },
];

export default async function CiviliansVerticalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const tasks = listTasksFor("civilians");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/use-cases/civilians")}`,
    inLanguage: locale,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Use cases", item: `${SITE.url}${localePath(locale, "/use-cases")}` },
        { "@type": "ListItem", position: 2, name: "Civilians & families", item: `${SITE.url}${localePath(locale, "/use-cases/civilians")}` },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader eyebrow="Use cases · Civilians" title={TITLE} description={DESCRIPTION} />

      <div className="mx-auto max-w-4xl px-4 py-10">
        <section>
          <div className="rounded border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-300">
            <strong>Important:</strong> Aegis Lens provides open-source intelligence from public
            sources. In an emergency, always follow official guidance from your local authorities
            and emergency services first.
          </div>
          <p className="mt-4 text-text-secondary">
            Aegis Lens publishes the same verified data used by journalists, NGOs, and analysts —
            but for civilians the most important features are simple: what happened near me, when,
            and how dangerous was it? The civilian interface strips the jargon and gives you
            actionable information fast.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">What you can do</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {USE_CASES.map((u) => (
              <li key={u.name} className="rounded border border-border-subtle bg-bg-surface p-4">
                <p className="font-mono text-xs uppercase tracking-widest text-accent">{u.name}</p>
                <p className="mt-2 text-sm text-text-secondary">{u.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {tasks.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-text-primary">Step-by-step guides</h2>
            <ul className="mt-4 space-y-3">
              {tasks.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={localePath(locale, `/use-cases/civilians/${t.slug}`)}
                    className="block rounded border border-border-subtle bg-bg-surface p-4 hover:bg-bg-elevated"
                  >
                    <p className="font-semibold text-text-primary">{t.title}</p>
                    <p className="mt-1 text-sm text-text-secondary">{t.problem}</p>
                    <p className="mt-2 font-mono text-[10px] text-accent">Read guide →</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Key features</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.name} className="rounded border border-border-subtle bg-bg-surface p-4">
                <p className="font-mono text-xs uppercase tracking-widest text-accent">{f.name}</p>
                <p className="mt-2 text-sm text-text-secondary">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Free for Ukrainian residents</h2>
          <p className="mt-3 text-text-secondary">
            Ukrainian residents may apply for full Pro access at no cost for personal civilian-safety
            use. Email{" "}
            <a href="mailto:grants@aegislens.io" className="text-accent hover:underline">
              grants@aegislens.io
            </a>{" "}
            with your name and a Ukrainian ID document.
          </p>
        </section>

        <section className="mt-10">
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={localePath(locale, "/map")}
              className="inline-block rounded border border-accent px-4 py-2 font-mono text-sm text-accent hover:bg-accent hover:text-bg-base"
            >
              Open live map
            </Link>
            <Link
              href={localePath(locale, "/regions/ua")}
              className="inline-block rounded border border-border-default px-4 py-2 font-mono text-sm text-text-primary hover:border-accent hover:text-accent"
            >
              Ukraine region page
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
