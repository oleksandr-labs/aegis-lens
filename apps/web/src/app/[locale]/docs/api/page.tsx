import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Public API";
const DESCRIPTION =
  "Reference for the Aegis Lens public JSON API: events, sources, and reports endpoints, with query parameters, response shapes, rate limits, and curl examples.";

const PRE_CLASS =
  "rounded border border-border-subtle bg-bg-elevated p-3 font-mono text-xs text-text-secondary overflow-x-auto";

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
    pathFor: (lc) => localePath(lc, "/docs/api"),
  });
}

export default async function ApiDocsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: TITLE,
    description: DESCRIPTION,
    inLanguage: locale,
    author: { "@type": "Organization", name: "Aegis Lens" },
    publisher: { "@type": "Organization", name: "Aegis Lens" },
  };

  return (
    <>
      <PageHeader eyebrow="Developers" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-4xl px-4 py-12 text-text-secondary">
        <div className="mb-8 flex flex-wrap gap-3">
          <a
            href="/docs/api/explorer"
            className="rounded border border-border-default bg-bg-elevated px-3 py-1.5 text-sm text-text-primary hover:border-accent hover:text-accent"
          >
            Open API explorer →
          </a>
          <a
            href="/api/openapi.json"
            className="rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          >
            OpenAPI 3.1 (JSON)
          </a>
          <a
            href="/api/openapi.yaml"
            className="rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          >
            OpenAPI 3.1 (YAML)
          </a>
          <a
            href="/api/postman.json"
            className="rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          >
            Postman collection
          </a>
        </div>

        <section>
          <h2 className="text-2xl font-semibold text-text-primary">Overview</h2>
          <p className="mt-3">
            The Aegis Lens public API exposes three read-only JSON endpoints. All responses are
            UTF-8 encoded JSON. All timestamps are ISO 8601 UTC. No authentication is required
            for the endpoints documented here, but every request is subject to a per-IP rate
            limit.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>
              Base URL:{" "}
              <code className="font-mono text-text-primary">https://aegislens.io</code>
            </li>
            <li>
              Content type:{" "}
              <code className="font-mono text-text-primary">application/json; charset=utf-8</code>
            </li>
            <li>
              Rate limit:{" "}
              <strong className="text-text-primary">60 requests per minute per IP</strong>.
              Exceeding the limit returns HTTP 429 with a{" "}
              <code className="font-mono text-text-primary">Retry-After</code> header.
            </li>
            <li>
              CORS: all listed endpoints respond with{" "}
              <code className="font-mono text-text-primary">Access-Control-Allow-Origin: *</code>.
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            <code className="font-mono">GET /api/events</code>
          </h2>
          <p className="mt-3">
            Returns published events ordered by occurrence timestamp, most recent first.
          </p>

          <h3 className="mt-6 text-base font-semibold text-text-primary">Query parameters</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-default text-left text-text-primary">
                  <th className="py-2 pr-4 font-semibold">Name</th>
                  <th className="py-2 pr-4 font-semibold">Type</th>
                  <th className="py-2 pr-4 font-semibold">Default</th>
                  <th className="py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-mono">country</td>
                  <td className="py-3 pr-4">string (ISO 3166-1 alpha-2)</td>
                  <td className="py-3 pr-4">—</td>
                  <td className="py-3">Filter to a single country, e.g. <code>ua</code>.</td>
                </tr>
                <tr className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-mono">class</td>
                  <td className="py-3 pr-4">string</td>
                  <td className="py-3 pr-4">—</td>
                  <td className="py-3">
                    Event class filter: <code>kinetic</code>, <code>cyber</code>,{" "}
                    <code>infrastructure</code>, <code>information</code>.
                  </td>
                </tr>
                <tr className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-mono">since</td>
                  <td className="py-3 pr-4">ISO 8601 timestamp</td>
                  <td className="py-3 pr-4">—</td>
                  <td className="py-3">Only events with occurrence &gt;= this value.</td>
                </tr>
                <tr className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-mono">min_confidence</td>
                  <td className="py-3 pr-4">integer (0–100)</td>
                  <td className="py-3 pr-4">0</td>
                  <td className="py-3">Minimum confidence score to include.</td>
                </tr>
                <tr className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-mono">limit</td>
                  <td className="py-3 pr-4">integer</td>
                  <td className="py-3 pr-4">50</td>
                  <td className="py-3">Maximum number of items, capped at 200.</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-mono">cursor</td>
                  <td className="py-3 pr-4">string</td>
                  <td className="py-3 pr-4">—</td>
                  <td className="py-3">
                    Opaque pagination cursor returned in <code>meta.nextCursor</code>. Omit for the first page.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="mt-6 text-base font-semibold text-text-primary">Response</h3>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>{`{
  "data": [
    {
      "eventId": "evt_01HZ8KX4P9T7",
      "occurredAt": "2026-05-23T14:08:12Z",
      "class": "military_action",
      "subclass": "missile_strike",
      "location": { "lat": 49.9935, "lon": 36.2304, "precisionM": 3000 },
      "confidence": 0.87,
      "dangerScore": 74,
      "summary": { "en": "Multiple impacts reported in northern Kharkiv" },
      "sources": ["src_reuters", "src_suspilne", "src_kharkiv_oba"]
    }
  ],
  "meta": {
    "count": 1,
    "total": 17,
    "hasMore": true,
    "nextCursor": "MjAyNi0wNS0yM1QxNDowODoxMlp8ZXZ0XzAxSFo4S1g0UDlUNw"
  }
}`}</code>
          </pre>

          <h3 className="mt-6 text-base font-semibold text-text-primary">Example</h3>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>curl https://aegislens.io/api/events?country=ua&class=cyber&limit=20</code>
          </pre>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            <code className="font-mono">GET /api/sources</code>
          </h2>
          <p className="mt-3">
            Returns the catalogue of monitored sources, including their tier and basic
            provenance metadata. Useful for resolving the source IDs that appear inside event
            responses.
          </p>

          <h3 className="mt-6 text-base font-semibold text-text-primary">Query parameters</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-default text-left text-text-primary">
                  <th className="py-2 pr-4 font-semibold">Name</th>
                  <th className="py-2 pr-4 font-semibold">Type</th>
                  <th className="py-2 pr-4 font-semibold">Default</th>
                  <th className="py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-mono">tier</td>
                  <td className="py-3 pr-4">integer (1–3)</td>
                  <td className="py-3 pr-4">—</td>
                  <td className="py-3">Filter to a specific source tier.</td>
                </tr>
                <tr className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-mono">country</td>
                  <td className="py-3 pr-4">string (ISO 3166-1 alpha-2)</td>
                  <td className="py-3 pr-4">—</td>
                  <td className="py-3">Filter by primary country of operation.</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-mono">limit</td>
                  <td className="py-3 pr-4">integer</td>
                  <td className="py-3 pr-4">100</td>
                  <td className="py-3">Maximum number of items, capped at 500.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="mt-6 text-base font-semibold text-text-primary">Response</h3>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>{`{
  "data": [
    {
      "id": "src_reuters",
      "name": "Reuters",
      "slug": "reuters",
      "tier": 1,
      "kind": "wire",
      "country": "gb",
      "homepage": "https://www.reuters.com",
      "languages": ["en"],
      "active": true
    }
  ]
}`}</code>
          </pre>

          <h3 className="mt-6 text-base font-semibold text-text-primary">Example</h3>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>curl https://aegislens.io/api/sources</code>
          </pre>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            <code className="font-mono">GET /api/reports</code>
          </h2>
          <p className="mt-3">
            Returns published analytical reports — periodic situation summaries and topic
            briefs assembled from underlying events. Reports are ordered by publication
            timestamp, most recent first.
          </p>

          <h3 className="mt-6 text-base font-semibold text-text-primary">Query parameters</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-default text-left text-text-primary">
                  <th className="py-2 pr-4 font-semibold">Name</th>
                  <th className="py-2 pr-4 font-semibold">Type</th>
                  <th className="py-2 pr-4 font-semibold">Default</th>
                  <th className="py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-mono">topic</td>
                  <td className="py-3 pr-4">string</td>
                  <td className="py-3 pr-4">—</td>
                  <td className="py-3">Filter to a single topic slug.</td>
                </tr>
                <tr className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-mono">country</td>
                  <td className="py-3 pr-4">string (ISO 3166-1 alpha-2)</td>
                  <td className="py-3 pr-4">—</td>
                  <td className="py-3">Filter to reports primarily about this country.</td>
                </tr>
                <tr className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-mono">since</td>
                  <td className="py-3 pr-4">ISO 8601 timestamp</td>
                  <td className="py-3 pr-4">—</td>
                  <td className="py-3">Only reports published on or after this timestamp.</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-mono">limit</td>
                  <td className="py-3 pr-4">integer</td>
                  <td className="py-3 pr-4">20</td>
                  <td className="py-3">Maximum number of items, capped at 100.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="mt-6 text-base font-semibold text-text-primary">Response</h3>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>{`{
  "data": [
    {
      "id": "rpt_2026_05_w20",
      "slug": "ukraine-weekly-2026-w20",
      "title": "Ukraine weekly digest — Week 20, 2026",
      "summary": "Kinetic activity along the Kharkiv axis; cyber probing of regional energy operators.",
      "published_at": "2026-05-19T08:00:00Z",
      "topics": ["ukraine", "energy", "cyber"],
      "countries": ["ua"],
      "event_count": 142,
      "url": "https://aegislens.io/reports/ukraine-weekly-2026-w20"
    }
  ]
}`}</code>
          </pre>

          <h3 className="mt-6 text-base font-semibold text-text-primary">Example</h3>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>curl https://aegislens.io/api/reports?limit=10</code>
          </pre>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Errors</h2>
          <p className="mt-3">
            Errors are returned as JSON with a stable shape and a non-2xx HTTP status.
          </p>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>{`{
  "error": {
    "code": "rate_limited",
    "message": "Too many requests. Retry after 12 seconds.",
    "status": 429
  }
}`}</code>
          </pre>
          <p className="mt-3">
            Common codes: <code>bad_request</code> (400), <code>not_found</code> (404),{" "}
            <code>rate_limited</code> (429), <code>internal_error</code> (500).
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Feeds</h2>
          <p className="mt-3">
            Three wire formats are available for every feed surface (news, per-topic,
            per-entity): RSS 2.0 (<code>feed.xml</code>), Atom 1.0 (<code>atom.xml</code>),
            and JSON Feed 1.1 (<code>feed.json</code>). All three carry the same items.
            JSON Feed items additionally include an <code className="font-mono text-text-primary">_aegis</code>{" "}
            extension object — opt-in structured fields alongside the standard JSON Feed
            properties.
          </p>
          <h3 className="mt-6 text-base font-semibold text-text-primary">
            <code className="font-mono">_aegis</code> shape for event items
          </h3>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>{`{
  "_aegis": {
    "eventId": "01HXKHARKIVDRONE001",
    "eventClass": "military_action",
    "subclass": "drone_strike",
    "dangerScore": 74,
    "confidence": 0.87,
    "verificationState": "verified",
    "location": { "lat": 49.9935, "lon": 36.2304, "precisionM": 3000 }
  }
}`}</code>
          </pre>
          <h3 className="mt-6 text-base font-semibold text-text-primary">
            <code className="font-mono">_aegis</code> shape for investigation items
          </h3>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>{`{
  "_aegis": {
    "analyst": "M. Korol",
    "investigationSlug": "iran-russia-drone-supply-chain"
  }
}`}</code>
          </pre>
          <p className="mt-3 text-xs text-text-muted">
            Underscore-prefixed extension keys are explicitly reserved by the JSON Feed
            spec (<a href="https://www.jsonfeed.org/version/1.1/#extensions" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">spec §6</a>)
            so consumers that don't know about <code>_aegis</code> ignore it cleanly.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Versioning and stability</h2>
          <p className="mt-3">
            The endpoints documented here are stable. Additive changes (new fields, new
            optional parameters) may ship without notice. Breaking changes — renamed or removed
            fields, changed types, changed defaults — will only ship under a new URL prefix and
            with at least 90 days of overlap.
          </p>
        </section>
      </article>
    </>
  );
}
