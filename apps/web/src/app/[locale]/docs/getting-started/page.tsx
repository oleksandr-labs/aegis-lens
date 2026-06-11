import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Getting started";
const DESCRIPTION =
  "Get verified intelligence data in 5 minutes. Authenticate, make your first API call, understand the response, and start filtering events.";

const PRE_CLASS =
  "rounded border border-border-subtle bg-bg-elevated p-4 font-mono text-xs text-text-secondary overflow-x-auto whitespace-pre";

const INLINE_CODE = "rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-[11px] text-text-primary";

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
    pathFor: (lc) => localePath(lc, "/docs/getting-started"),
  });
}

export default async function GettingStartedPage({
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
      <PageHeader eyebrow="Docs" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-4xl px-4 py-10 text-text-secondary">
        <p>
          This guide walks you through authentication, your first API call, and the most useful
          filter patterns. Plan on about five minutes end to end.
        </p>

        {/* ── 1. Introduction ── */}
        <section className="mt-12" id="introduction">
          <h2 className="text-2xl font-semibold text-text-primary">1. Introduction</h2>
          <p className="mt-3">
            Aegis Lens exposes a REST API over HTTPS. Every response is JSON. There are no SDKs
            required — any HTTP client works. Events are the core resource: each one is a verified,
            timestamped incident with a location, a class, a confidence score, and a danger score.
          </p>
          <p className="mt-3">
            The base URL for all API endpoints is{" "}
            <code className={INLINE_CODE}>https://aegislens.io/api</code>. All timestamps are UTC
            ISO&nbsp;8601. Pagination is cursor-based.
          </p>
        </section>

        {/* ── 2. Authentication ── */}
        <section className="mt-12" id="auth">
          <h2 className="text-2xl font-semibold text-text-primary">2. Authentication</h2>
          <p className="mt-3">
            Every request must carry a bearer token. Sign in, open{" "}
            <Link
              href={localePath(locale, "/account/api-keys")}
              className="text-text-primary underline underline-offset-2"
            >
              Account &rarr; API keys
            </Link>
            , and click <strong className="text-text-primary">Create key</strong>. The secret is
            shown exactly once — store it in your secrets manager immediately.
          </p>
          <p className="mt-3">
            Your API key looks like:{" "}
            <code className={INLINE_CODE}>alens_sk_...</code>
          </p>
          <p className="mt-3">Include it in every request as an Authorization header:</p>
          <pre className={`mt-3 ${PRE_CLASS}`}>
            <code>Authorization: Bearer alens_sk_your_key_here</code>
          </pre>
          <p className="mt-3 text-sm">
            Keys can be scoped to read-only and revoked at any time from the account dashboard.
            There is no OAuth flow required for server-to-server access.
          </p>
        </section>

        {/* ── 3. First API call ── */}
        <section className="mt-12" id="first-call">
          <h2 className="text-2xl font-semibold text-text-primary">3. First API call</h2>
          <p className="mt-3">
            Fetch the 24-hour event feed for Ukraine. Replace the placeholder with your real key:
          </p>
          <pre className={`mt-3 ${PRE_CLASS}`}>
            <code>{`curl "https://aegislens.io/api/events?country=ua&hours=24" \\
  -H "Authorization: Bearer alens_sk_your_key_here"`}</code>
          </pre>
          <p className="mt-4">A successful response (truncated for clarity):</p>
          <pre className={`mt-3 ${PRE_CLASS}`}>
            <code>{`{
  "data": [
    {
      "eventId":           "01HXKHARKIVDRONE001",
      "class":             "military_action",
      "subclass":          "drone",
      "severity":          3,
      "dangerScore":       62,
      "confidence":        0.78,
      "verificationState": "corroborated",
      "occurredAt":        "2026-06-03T10:14:00Z",
      "location": {
        "lat":        49.9935,
        "lon":        36.2304,
        "precisionM": 3000
      },
      "summary": {
        "en": "Drone activity reported near Kharkiv.",
        "uk": "Повідомлення про активність БПЛА поблизу Харкова."
      },
      "sources": [ { "url": "https://t.me/...", "tier": 2 } ]
    }
    // ... more events
  ],
  "meta": {
    "total":       142,
    "next_cursor": "01HXKHARKIV0050",
    "hours":       24,
    "country":     "ua"
  }
}`}</code>
          </pre>
        </section>

        {/* ── 4. Understanding the response ── */}
        <section className="mt-12" id="response">
          <h2 className="text-2xl font-semibold text-text-primary">4. Understanding the response</h2>
          <p className="mt-3">Key fields returned on every event:</p>
          <div className="mt-4 overflow-x-auto rounded border border-border-subtle">
            <table className="w-full text-sm">
              <thead className="bg-bg-elevated">
                <tr className="border-b border-border-subtle">
                  <th className="px-4 py-2 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
                    Field
                  </th>
                  <th className="px-4 py-2 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {[
                  ["eventId", "Stable ULID identifier. Sortable by creation time. Use this to deduplicate across calls."],
                  ["class", "Primary event classification. Use for routing and subscriptions. See schema reference for all values."],
                  ["confidence", "Float 0–1. How certain we are the event occurred as described. Filter with ?minConfidence=0.70."],
                  ["dangerScore", "Integer 0–100. Civilian harm at the event location. Independent of confidence — use both."],
                  ["verificationState", "One of: unverified · corroborated · verified · disputed · retracted."],
                  ["location", "Object with lat, lon (WGS-84), and precisionM (accuracy radius in metres)."],
                  ["summary", "Object with locale keys. summary.en is always present; summary.uk where translated."],
                  ["occurredAt", "ISO 8601 UTC. Best-estimate time the incident occurred (not when we published it)."],
                ].map(([field, desc]) => (
                  <tr key={field} className="bg-bg-surface">
                    <td className="w-40 px-4 py-2 font-mono text-[11px] text-text-primary align-top">
                      {field}
                    </td>
                    <td className="px-4 py-2 text-text-secondary">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 5. Filtering events ── */}
        <section className="mt-12" id="filtering">
          <h2 className="text-2xl font-semibold text-text-primary">5. Filtering events</h2>
          <p className="mt-3">
            Query parameters compose. All filters are AND-ed together unless noted.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-text-primary">Filter by time window</h3>
          <p className="mt-2 text-sm">Return only events from the last 6 hours:</p>
          <pre className={`mt-2 ${PRE_CLASS}`}>
            <code>{`curl "https://aegislens.io/api/events?country=ua&hours=6" \\
  -H "Authorization: Bearer alens_sk_your_key_here"`}</code>
          </pre>

          <h3 className="mt-8 text-lg font-semibold text-text-primary">Filter by event class</h3>
          <p className="mt-2 text-sm">
            Repeat the <code className={INLINE_CODE}>class</code> parameter to OR multiple classes:
          </p>
          <pre className={`mt-2 ${PRE_CLASS}`}>
            <code>{`curl "https://aegislens.io/api/events?country=ua&class=military_action&class=civilian_alert" \\
  -H "Authorization: Bearer alens_sk_your_key_here"`}</code>
          </pre>

          <h3 className="mt-8 text-lg font-semibold text-text-primary">Filter by confidence</h3>
          <p className="mt-2 text-sm">
            Only return events where confidence is 70 % or higher. Useful for alert routing:
          </p>
          <pre className={`mt-2 ${PRE_CLASS}`}>
            <code>{`curl "https://aegislens.io/api/events?country=ua&minConfidence=70" \\
  -H "Authorization: Bearer alens_sk_your_key_here"`}</code>
          </pre>
          <p className="mt-3 text-sm">
            Confidence is expressed as an integer 0–100 in the filter parameter, even though the
            field itself returns a float (0–1). The API normalises for you.
          </p>
        </section>

        {/* ── 6. Next steps ── */}
        <section className="mt-12" id="next-steps">
          <h2 className="text-2xl font-semibold text-text-primary">6. Next steps</h2>
          <ul className="mt-4 space-y-3">
            <li>
              <Link
                href={localePath(locale, "/docs/api/explorer")}
                className="font-semibold text-text-primary underline underline-offset-2"
              >
                AI Copilot API
              </Link>{" "}
              — Query events in natural language and get structured answers from our built-in
              AI copilot endpoint.
            </li>
            <li>
              <Link
                href={localePath(locale, "/docs/webhooks")}
                className="font-semibold text-text-primary underline underline-offset-2"
              >
                Webhooks
              </Link>{" "}
              — Receive events pushed to your endpoint in real time, filtered to your chosen
              class, confidence, and danger thresholds.
            </li>
            <li>
              <Link
                href={localePath(locale, "/docs/sdks")}
                className="font-semibold text-text-primary underline underline-offset-2"
              >
                SDKs
              </Link>{" "}
              — Official client libraries for TypeScript, Python, and Go with full type coverage.
            </li>
            <li>
              <Link
                href={localePath(locale, "/docs/rate-limits")}
                className="font-semibold text-text-primary underline underline-offset-2"
              >
                Rate limits
              </Link>{" "}
              — Per-endpoint quotas, the 429 response shape, and a reference exponential backoff
              implementation.
            </li>
          </ul>
        </section>
      </article>
    </>
  );
}
