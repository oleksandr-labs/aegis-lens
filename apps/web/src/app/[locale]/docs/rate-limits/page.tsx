import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Rate limits";
const DESCRIPTION =
  "Per-endpoint request quotas for the Aegis Lens API, how to read 429 responses, and a reference exponential backoff strategy.";

const PRE_CLASS =
  "rounded border border-border-subtle bg-bg-elevated p-3 font-mono text-xs text-text-secondary overflow-x-auto whitespace-pre";

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
    pathFor: (lc) => localePath(lc, "/docs/rate-limits"),
  });
}

export default async function RateLimitsPage({
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
          Rate limits keep the service responsive for everyone. Limits are enforced per API key
          when one is present, and per IP otherwise. The active window is one minute; counters
          reset on a rolling basis.
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-text-primary">Per-endpoint limits</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-default text-left text-text-primary">
                  <th className="py-2 pr-4 font-semibold">Endpoint</th>
                  <th className="py-2 pr-4 font-semibold">Anonymous</th>
                  <th className="py-2 pr-4 font-semibold">API key</th>
                  <th className="py-2 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-mono">GET /api/events</td>
                  <td className="py-3 pr-4">60 / min</td>
                  <td className="py-3 pr-4">600 / min</td>
                  <td className="py-3">Cursor pagination counts each page.</td>
                </tr>
                <tr className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-mono">GET /api/sources</td>
                  <td className="py-3 pr-4">30 / min</td>
                  <td className="py-3 pr-4">300 / min</td>
                  <td className="py-3">Catalogue is largely static; cache aggressively.</td>
                </tr>
                <tr className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-mono">GET /api/reports</td>
                  <td className="py-3 pr-4">30 / min</td>
                  <td className="py-3 pr-4">300 / min</td>
                  <td className="py-3">New reports are published a few times per day.</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-mono">POST /api/subscriptions</td>
                  <td className="py-3 pr-4">5 / min</td>
                  <td className="py-3 pr-4">60 / min</td>
                  <td className="py-3">Stricter to prevent enumeration of email addresses.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-text-primary">Response headers</h2>
          <p className="mt-3">Every API response includes the current quota state:</p>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>{`X-RateLimit-Limit: 600
X-RateLimit-Remaining: 583
X-RateLimit-Reset: 1748090160`}</code>
          </pre>
          <p className="mt-3">
            <code className="font-mono text-text-primary">X-RateLimit-Reset</code> is the Unix
            timestamp at which the counter returns to zero. When you exceed the limit, the
            service responds with HTTP{" "}
            <code className="font-mono text-text-primary">429 Too Many Requests</code> and a{" "}
            <code className="font-mono text-text-primary">Retry-After</code> header expressed in
            seconds.
          </p>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>{`HTTP/1.1 429 Too Many Requests
Retry-After: 12
Content-Type: application/json

{
  "error": "rate_limited",
  "message": "Too many requests. Retry after 12 seconds."
}`}</code>
          </pre>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-text-primary">Handling 429</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-6">
            <li>
              On a 429, read{" "}
              <code className="font-mono text-text-primary">Retry-After</code> and wait at least
              that many seconds before retrying.
            </li>
            <li>
              If <code className="font-mono text-text-primary">Retry-After</code> is missing,
              fall back to exponential backoff with full jitter.
            </li>
            <li>
              Cap the maximum delay at 60 seconds and the total number of retries at 5; after
              that, surface the error to the caller.
            </li>
            <li>
              Never retry a 4xx other than 429 — those are client errors and will not succeed on
              retry.
            </li>
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-text-primary">Reference backoff</h2>
          <p className="mt-3">
            Compute <code className="font-mono text-text-primary">delay = random(0, min(cap, base * 2 ** attempt))</code>{" "}
            where <code className="font-mono text-text-primary">base = 1s</code> and{" "}
            <code className="font-mono text-text-primary">cap = 60s</code>. In TypeScript:
          </p>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>{`async function fetchWithBackoff(url: string, init?: RequestInit) {
  const cap = 60_000;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, init);
    if (res.status !== 429) return res;
    const retryAfter = Number(res.headers.get("Retry-After"));
    const fallback = Math.min(cap, 1000 * 2 ** attempt);
    const delay = Number.isFinite(retryAfter)
      ? retryAfter * 1000
      : Math.floor(Math.random() * fallback);
    await new Promise((r) => setTimeout(r, delay));
  }
  throw new Error("rate_limited: exceeded retries");
}`}</code>
          </pre>
        </section>

        <p className="mt-10">
          Need higher limits? Open a ticket from{" "}
          <Link
            className="text-text-primary underline"
            href={localePath(locale, "/account/api-keys")}
          >
            Account &rarr; API keys
          </Link>{" "}
          with your expected request profile.
        </p>
      </article>
    </>
  );
}
