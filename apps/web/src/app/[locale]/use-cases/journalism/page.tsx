import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Aegis Lens for journalism and OSINT";
const DESCRIPTION =
  "Lead generation, verification, and source corroboration for newsrooms and OSINT collectives. Every event traces to its sources with confidence and geolocation accuracy on the record.";

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
    pathFor: (lc) => localePath(lc, "/use-cases/journalism"),
  });
}

const USE_CASES = [
  {
    name: "Lead generation",
    body: "Surface emerging incidents within minutes — filtered by region, severity, or class — before they hit the wires.",
  },
  {
    name: "Verification",
    body: "Cross-check eyewitness posts and Telegram chatter against tiered sources, with corroboration counts and confidence on the record.",
  },
  {
    name: "Source corroboration",
    body: "Every event exposes the full list of contributing source URLs and ingestion timestamps — citable in print and on air.",
  },
  {
    name: "Longform research",
    body: "Pattern, recurrence, and density analysis over months or years for investigative dossiers and explainers.",
  },
];

const FEATURES = [
  {
    name: "Map",
    body: "Public, embeddable map with deep-linking to specific events, time ranges, and filters — newsroom-friendly licensing.",
  },
  {
    name: "API",
    body: "Free tier for non-commercial reporting. Stable IDs, source lists, and accuracy classes for clean attribution.",
  },
  {
    name: "Alerts",
    body: "AOI-based webhooks and email digests sized for editor desks rather than 24/7 ops rooms.",
  },
];

export default async function JournalismUseCasePage({
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
      audienceType: "Newsrooms and OSINT investigators",
    },
    areaServed: "Worldwide",
  };

  return (
    <>
      <PageHeader eyebrow="Use case · Journalism" title={TITLE} description={DESCRIPTION} />
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
            <rect x="6" y="10" width="30" height="28" />
            <path d="M36 16 H42 V34 A4 4 0 0 1 38 38 H36" />
            <path d="M12 18 H30 M12 24 H30 M12 30 H22" />
          </svg>
          <div>
            <h2 className="text-xl font-semibold text-text-primary">A reportable record, not a feed</h2>
            <p className="mt-3 text-text-secondary">
              Editorial workflows demand traceability. Aegis Lens publishes every event with the
              full source trail, a tier-weighted confidence score, and a coarse geolocation accuracy
              class — so claims you put in print, on air, or on the web are defensible against the
              standards your desk already enforces.
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
              “The corroboration view cut our verification time on overnight strikes from forty
              minutes to under ten — without lowering our standard for what reaches the page.”
            </blockquote>
            <p className="mt-2 text-sm text-text-muted">
              — Investigations editor, illustrative.
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
            Qualified newsrooms and non-commercial OSINT collectives get discounted or free access
            under our partner program — with two-way attribution.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              className="inline-block rounded border border-accent px-4 py-2 font-mono text-sm text-accent hover:bg-accent hover:text-bg-base"
              href="mailto:sales@aegislens.example?subject=Newsroom%20access%20inquiry"
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
