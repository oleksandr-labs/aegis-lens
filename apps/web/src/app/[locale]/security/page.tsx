import type { Metadata } from "next";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader, Prose } from "@/components/PageHeader";

const lp = (lc: Locale) => (lc === "en" ? "/security" : `/${lc}/security`);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Security & Disclosure",
    description:
      "How to report a vulnerability to Aegis Lens, our PGP key, and our responsible disclosure policy.",
    pathFor: lp,
  });
}

export default function SecurityPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Security & Disclosure",
    description: "Vulnerability reporting and responsible disclosure policy for Aegis Lens.",
    inLanguage: "en",
  };

  return (
    <>
      <PageHeader
        eyebrow="Security"
        title="Security & Disclosure"
        description="We welcome reports from security researchers. Please act in good faith and follow the guidelines below."
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Prose>
        <h2>Reporting a vulnerability</h2>
        <p>
          Email <a href="mailto:security@aegislens.example">security@aegislens.example</a> with a
          clear description of the issue, the affected endpoint or component, reproduction steps,
          and any proof-of-concept payload. Encrypt sensitive details with the PGP key below.
        </p>

        <h2>Scope</h2>
        <p>
          In scope: the production web app, our public APIs under <code>/api</code>, and our
          authentication flows. Out of scope: third-party services we embed, denial-of-service
          attacks, social engineering, physical attacks, and findings that require a
          compromised endpoint.
        </p>

        <h2>Responsible disclosure</h2>
        <p>
          Please give us a reasonable window — typically 90 days — to investigate and remediate
          before public disclosure. We will acknowledge your report within three business days,
          keep you informed of progress, and credit you in the fix notes if you wish.
        </p>

        <h2>Safe harbor</h2>
        <p>
          We will not pursue legal action against researchers who comply with this policy, avoid
          privacy violations, do not exfiltrate data beyond what is necessary to demonstrate the
          issue, and report promptly.
        </p>

        <h2>PGP key</h2>
        <section className="not-prose">
          <pre className="mt-3 overflow-x-auto rounded-md border border-border-subtle bg-bg-surface p-4 font-mono text-xs text-text-muted">
            {`-----BEGIN PGP PUBLIC KEY BLOCK-----
Comment: Aegis Lens Security <security@aegislens.example>
Comment: Fingerprint placeholder — replace before production

PLACEHOLDER — PGP key will be published here once generated.
-----END PGP PUBLIC KEY BLOCK-----`}
          </pre>
        </section>

        <h2>Contact</h2>
        <p>
          Primary: <a href="mailto:security@aegislens.example">security@aegislens.example</a>. For
          time-sensitive issues, mark the subject line with <code>[URGENT]</code>.
        </p>
      </Prose>
    </>
  );
}
