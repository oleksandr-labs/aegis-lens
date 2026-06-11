import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Errors";
const DESCRIPTION =
  "Standard error envelope used by every Aegis Lens endpoint, the full list of error codes, and the HTTP status each one maps to.";

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
    pathFor: (lc) => localePath(lc, "/docs/errors"),
  });
}

export default async function ErrorsPage({
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
        <section>
          <h2 className="text-2xl font-semibold text-text-primary">Error envelope</h2>
          <p className="mt-3">
            Every non-2xx response carries a JSON body with the same shape. The HTTP status code
            is the source of truth for class of failure; the{" "}
            <code className="font-mono text-text-primary">error</code> field gives a stable
            machine-readable code, and{" "}
            <code className="font-mono text-text-primary">message</code> gives a
            human-readable explanation suitable for logs.
          </p>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>{`{
  "error": "rate_limited",
  "message": "Too many requests. Retry after 12 seconds."
}`}</code>
          </pre>
          <p className="mt-3">
            The set of <code className="font-mono text-text-primary">error</code> codes is
            closed and stable. New codes will only be added; existing codes will not change
            meaning. Treat unknown codes as a generic failure of the matching HTTP status class.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-text-primary">Error codes</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-default text-left text-text-primary">
                  <th className="py-2 pr-4 font-semibold">Code</th>
                  <th className="py-2 pr-4 font-semibold">HTTP</th>
                  <th className="py-2 font-semibold">Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-mono">invalid_request</td>
                  <td className="py-3 pr-4">400</td>
                  <td className="py-3">
                    The request was syntactically valid but logically wrong: missing required
                    parameters, conflicting filters, or values outside the allowed range. The
                    message names the offending field.
                  </td>
                </tr>
                <tr className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-mono">invalid_email</td>
                  <td className="py-3 pr-4">400</td>
                  <td className="py-3">
                    Returned by subscription endpoints when the supplied address fails
                    syntactic or deliverability checks.
                  </td>
                </tr>
                <tr className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-mono">unauthorized</td>
                  <td className="py-3 pr-4">401</td>
                  <td className="py-3">
                    The API key is missing, malformed, expired, or revoked. Re-issue from{" "}
                    Account &rarr; API keys and retry.
                  </td>
                </tr>
                <tr className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-mono">not_found</td>
                  <td className="py-3 pr-4">404</td>
                  <td className="py-3">
                    The addressed resource does not exist or is not visible to the caller.
                    Identifiers are case-sensitive.
                  </td>
                </tr>
                <tr className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-mono">topic_not_found</td>
                  <td className="py-3 pr-4">404</td>
                  <td className="py-3">
                    A topic slug used in a filter or subscription does not match any active
                    topic. Fetch the catalogue from{" "}
                    <code className="font-mono text-text-primary">/api/topics</code> for the
                    current list.
                  </td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4 font-mono">rate_limited</td>
                  <td className="py-3 pr-4">429</td>
                  <td className="py-3">
                    The quota for this key or IP has been exhausted. Wait the{" "}
                    <code className="font-mono text-text-primary">Retry-After</code> seconds and
                    retry; see the rate limits page for backoff guidance.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-text-primary">Handling</h2>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>
              Branch on <code className="font-mono text-text-primary">error</code> for control
              flow, never on <code className="font-mono text-text-primary">message</code>.
            </li>
            <li>
              Log <code className="font-mono text-text-primary">message</code> for operators,
              but show your own UI copy to end users.
            </li>
            <li>
              Only{" "}
              <code className="font-mono text-text-primary">rate_limited</code> and 5xx are
              retriable. All other codes indicate a client bug.
            </li>
          </ul>
        </section>
      </article>
    </>
  );
}
