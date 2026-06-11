import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Frequently Asked Questions";
const DESCRIPTION =
  "Answers to common questions about Aegis Lens — what we cover, how we verify, and how to use our data.";

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
    pathFor: (lc) => localePath(lc, "/faq"),
  });
}

type QA = { q: string; a: string };
type FAQSection = { label: string; icon: string; items: QA[] };

const FAQ_SECTIONS: FAQSection[] = [
  {
    label: "Product",
    icon: "🛰",
    items: [
      {
        q: "What is Aegis Lens?",
        a: "Aegis Lens is an AI-native OSINT intelligence platform that aggregates, verifies, geolocates, and publishes conflict and security events. We turn fragmented open-source signals into structured, citable records that analysts, journalists, NGOs, and developers can rely on.",
      },
      {
        q: "What makes Aegis Lens different from LiveUAmap or similar tools?",
        a: "Three key differences: AI-powered verification that scores every event before it appears on the map; a structured data model with machine-readable confidence scores and source chains; and a developer-first API that lets you build your own workflows on top of our data — not just view it in a browser.",
      },
      {
        q: "Is this only about Ukraine?",
        a: "No — Ukraine is our initial focus and where our data density is highest. The platform is designed to cover any conflict or security situation globally. Additional regions are added as coverage and source networks mature.",
      },
      {
        q: "Can I use Aegis Lens offline?",
        a: "Partially. The map caches your last view and recent event data in the browser for offline reading. New events and live data require an internet connection. The mobile app (coming soon) will support extended offline mode for fieldwork.",
      },
      {
        q: "What languages does the interface support?",
        a: "The interface currently ships in English and Ukrainian. Additional locales are on the roadmap; source-language quotations are preserved verbatim and translated alongside the structured data.",
      },
    ],
  },
  {
    label: "Data & Verification",
    icon: "📊",
    items: [
      {
        q: "How do you verify events?",
        a: "Every event goes through our 6-step pipeline: (1) ingestion from monitored sources, (2) deduplication against existing records, (3) geolocation using imagery and contextual clues, (4) cross-referencing with independent sources, (5) AI-assisted confidence scoring, and (6) analyst review for high-impact events. Disputed claims are marked, not silently dropped.",
      },
      {
        q: "What does 'Corroborated' mean?",
        a: "An event is marked Corroborated when 2+ independent sources confirm the same core claim — independently, without citing each other. Independence is assessed by source tier, ownership, and publication timing. Corroborated events receive a confidence score of 0.7 or above.",
      },
      {
        q: "Can I trust the confidence scores?",
        a: "Confidence scores are probabilistic, not guarantees. A score of 0.9 means the event is very likely to be accurate as described — not that it is certain. Scores can change as new information emerges. Read our full scoring methodology at /methodology/scoring.",
      },
      {
        q: "Do you cover civilian casualties?",
        a: "Yes, with special care for privacy and dignity. We record confirmed civilian casualty events with source chains and geographic precision. We do not publish unverified counts or speculative tallies. Individual victim identities are never published without explicit public record justification.",
      },
      {
        q: "How accurate is your geolocation?",
        a: "Records carry an explicit coordinate precision: exact (within tens of meters from imagery or geotagged media), settlement (within a named locality), or area (a wider operational zone). We never invent precision we do not have.",
      },
      {
        q: "How do I report a missing or incorrect event?",
        a: "Use the 'Suggest correction' link on any event detail page, or email corrections@aegislens.io with the event ID, the specific field at issue, and a source link. Corrections are triaged within 48 hours and logged in the public corrections ledger at /trust/corrections.",
      },
    ],
  },
  {
    label: "Pricing & Access",
    icon: "💳",
    items: [
      {
        q: "Is there a free tier?",
        a: "Yes — the Free tier includes the live map, events from the last 24 hours, RSS/Atom feeds, and public search. API access (100 requests/day), basic alert digests, and the embed widget are also free. Paid tiers unlock longer history, higher API limits, webhooks, and bulk export.",
      },
      {
        q: "Do you offer discounts for NGOs and journalists?",
        a: "Yes. We offer substantially discounted or free access for registered NGOs, humanitarian organisations, and accredited journalists covering conflict. Apply at /contact?type=ngo-discount with a brief description of your work and organisation.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept major credit and debit cards, SEPA Direct Debit, BACS Direct Debit, and bank transfer (for annual Enterprise contracts). Payments are processed by Stripe. We do not store card details.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes, immediately, with no lock-in or cancellation fees. Your subscription stays active until the end of the billing period and then reverts to the free tier. There are no prorated refunds for partial months.",
      },
      {
        q: "Is there an annual billing option?",
        a: "Yes — annual billing is available on Analyst and Team plans at a 20% discount versus monthly. Enterprise contracts are negotiated annually. Switch at any time from Settings → Billing.",
      },
    ],
  },
  {
    label: "API & Technical",
    icon: "⚡",
    items: [
      {
        q: "What's the API rate limit?",
        a: "Free: 100 requests/day. Analyst: 5,000/day. Team: 50,000/day. Enterprise: custom. Rate-limited responses return HTTP 429 with a Retry-After header. The X-RateLimit-Remaining header on every response lets you monitor usage proactively.",
      },
      {
        q: "Is there a TypeScript SDK?",
        a: "Yes — install with npm i @aegis-lens/sdk. The SDK wraps the REST API with full TypeScript types, built-in retry/backoff, and SSE streaming support. See the documentation at /docs/sdks.",
      },
      {
        q: "Can I self-host?",
        a: "On-premises deployment is available on the Enterprise plan for organisations with data residency requirements. Contact us at /contact for a scoping conversation. The public API and data pipeline are not open-source.",
      },
      {
        q: "Do you have webhooks?",
        a: "Yes, on Pro and above. Webhooks deliver event notifications to a URL you control as HTTP POST with HMAC-SHA256 signature verification. See the full documentation at /docs/webhooks.",
      },
      {
        q: "What data formats does the API return?",
        a: "The REST API returns JSON. Bulk exports support newline-delimited JSON (NDJSON) and Parquet. Streaming events are delivered via Server-Sent Events (SSE). RSS and Atom feeds are available for all public topics and regions.",
      },
      {
        q: "Is the API versioned?",
        a: "Yes. The current stable version is /v1. Breaking changes are published under a new version (e.g. /v2) with at least 6 months' notice and parallel support. Non-breaking additions are made to the current version without a version bump.",
      },
    ],
  },
];

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  // Flatten for JSON-LD
  const allQAs = FAQ_SECTIONS.flatMap((s) => s.items);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: allQAs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <>
      <PageHeader eyebrow="FAQ" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-10 space-y-12">

        {/* Section nav */}
        <nav className="flex flex-wrap gap-2" aria-label="FAQ sections">
          {FAQ_SECTIONS.map((s) => (
            <a
              key={s.label}
              href={`#faq-${s.label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`}
              className="rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-sm text-text-secondary hover:border-accent hover:text-accent transition-colors"
            >
              {s.icon} {s.label}
            </a>
          ))}
        </nav>

        {FAQ_SECTIONS.map((section) => {
          const id = `faq-${section.label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
          return (
            <section key={section.label} id={id} className="scroll-mt-20">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
                <span aria-hidden="true">{section.icon}</span>
                {section.label}
              </h2>
              <ul className="mt-4 space-y-3">
                {section.items.map((f) => (
                  <li key={f.q}>
                    <details className="group rounded border border-border-subtle bg-bg-surface p-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-text-primary marker:hidden">
                        <span>{f.q}</span>
                        <span
                          aria-hidden="true"
                          className="shrink-0 font-mono text-xs text-text-muted transition-transform duration-200 group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-text-secondary">{f.a}</p>
                    </details>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {/* CTA */}
        <div className="rounded border border-border-subtle bg-bg-elevated p-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Still have questions?
          </p>
          <p className="mt-2 text-text-secondary">
            Our team is happy to help — send us a message or browse the full help center.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href={localePath(locale, "/contact")}
              className="rounded border border-accent px-5 py-2 text-sm font-medium text-accent hover:bg-accent hover:text-bg-base transition-colors"
            >
              Contact support
            </Link>
            <Link
              href={localePath(locale, "/help")}
              className="rounded border border-border-subtle px-5 py-2 text-sm text-text-secondary hover:border-accent hover:text-accent transition-colors"
            >
              Browse Help Center →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
