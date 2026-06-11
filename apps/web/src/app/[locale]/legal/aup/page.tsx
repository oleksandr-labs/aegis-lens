import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader, Prose } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Acceptable Use Policy";
const DESCRIPTION =
  "What you may and may not do with Aegis Lens data, APIs, and platform services.";
const LAST_UPDATED = "2026-05-24";

const lp = (lc: Locale) =>
  lc === "en" ? "/legal/aup" : `/${lc}/legal/aup`;

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
    pathFor: lp,
  });
}

export default async function AupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: locale,
    dateModified: LAST_UPDATED,
    publisher: { "@type": "Organization", name: "Aegis Lens" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        eyebrow="Legal"
        title={TITLE}
        description={`Last updated: ${LAST_UPDATED}`}
      />
      <div className="mx-auto max-w-3xl px-4 pb-0 pt-6">
        <div className="rounded border border-border-subtle bg-bg-elevated px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-accent">Plain-language summary</p>
          <p className="mt-2 text-sm text-text-secondary">
            You can use Aegis Lens for journalism, research, humanitarian work, and building lawful
            applications. You cannot use it to identify or target private individuals, scrape beyond
            your API quota, train AI models without permission, spread disinformation, or bypass
            security controls. Violations may result in immediate suspension. When in doubt, email
            us before doing something that might cross a line.
          </p>
        </div>
      </div>
      <Prose>
        <h2 id="scope">1. Scope</h2>
        <p>
          This Acceptable Use Policy (&ldquo;AUP&rdquo;) governs your use of Aegis Lens services,
          including the web application, APIs, data exports, embeds, and any other products operated
          by Aegis Lens (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By accessing or
          using the services you agree to this AUP. If you use Aegis Lens on behalf of an
          organization, that organization accepts this AUP.
        </p>

        <h2 id="permitted">2. Permitted uses</h2>
        <p>You may use Aegis Lens to:</p>
        <ul>
          <li>Conduct open-source intelligence (OSINT) research for lawful journalistic, humanitarian, academic, or defensive purposes.</li>
          <li>Access, query, and export data for analysis within your API plan limits.</li>
          <li>Build applications on top of the public API in accordance with the API Terms of Service.</li>
          <li>Embed map widgets or data feeds into third-party sites for editorial or informational purposes.</li>
          <li>Share verified intelligence outputs with attribution to Aegis Lens.</li>
        </ul>

        <h2 id="prohibited">3. Prohibited uses</h2>
        <p>You must not use Aegis Lens to:</p>

        <h3 id="targeting">3.1 Targeting and harm</h3>
        <ul>
          <li>Identify, track, or target specific private individuals — including civilian non-combatants — for any purpose.</li>
          <li>Generate kill lists, no-strike lists, or any targeting package intended for kinetic action without verified lawful authority.</li>
          <li>Assist in planning or executing attacks on civilian infrastructure, populations, or protected persons.</li>
          <li>Use geolocation data to facilitate ambushes, detentions, or physical harm.</li>
        </ul>

        <h3 id="disinformation">3.2 Disinformation and manipulation</h3>
        <ul>
          <li>Fabricate, alter, or misattribute events, images, or reports to create false intelligence.</li>
          <li>Remove or obscure source attributions to misrepresent data provenance.</li>
          <li>Use AI-generated outputs from our platform without labeling them as AI-assisted.</li>
          <li>Amplify unverified or low-confidence data as confirmed fact.</li>
        </ul>

        <h3 id="technical">3.3 Technical misuse</h3>
        <ul>
          <li>Scrape or crawl the platform in ways that circumvent API rate limits or authentication.</li>
          <li>Reverse-engineer proprietary scoring models, AI systems, or data pipelines.</li>
          <li>Probe, scan, or test for security vulnerabilities without written permission — see our{" "}
            <Link href={localePath(locale, "/security")}>vulnerability disclosure policy</Link>.
          </li>
          <li>Share API credentials, session tokens, or embed keys with unauthorized parties.</li>
          <li>Use the service to train competing AI models without a data licensing agreement.</li>
        </ul>

        <h3 id="legal">3.4 Legal violations</h3>
        <ul>
          <li>Violate any applicable law, regulation, treaty, or sanctions regime.</li>
          <li>Process or redistribute personal data in violation of GDPR or other applicable privacy law.</li>
          <li>Infringe intellectual property rights in data you upload or publish via the platform.</li>
          <li>Use the service in jurisdictions where it is prohibited by applicable export controls.</li>
        </ul>

        <h2 id="source-protection">4. Source protection</h2>
        <p>
          Aegis Lens is committed to protecting the identity of human sources and contributors. You
          must not attempt to de-anonymize, correlate, or expose source identities using data obtained
          from our platform. Tip submissions and contributor communications are confidential by design.
        </p>

        <h2 id="ai-outputs">5. AI-generated outputs</h2>
        <p>
          Summaries, translations, and analyses produced by Aegis Lens AI tools are experimental and
          carry explicit uncertainty labels. You must not redistribute AI outputs as authoritative or
          verified intelligence without independent human review. AI outputs must be labeled as
          AI-assisted in any downstream publication.
        </p>

        <h2 id="enforcement">6. Enforcement</h2>
        <p>
          We monitor usage patterns for AUP violations. Confirmed violations may result in immediate
          suspension, permanent termination, referral to law enforcement, or civil action, depending
          on severity. We will not restore access to accounts terminated for targeting-related or
          disinformation violations.
        </p>

        <h2 id="reporting">7. Reporting violations</h2>
        <p>
          To report suspected AUP violations — including misuse of data, targeting concerns, or
          disinformation campaigns — contact{" "}
          <a href="mailto:abuse@aegislens.io">abuse@aegislens.io</a>. Reports are treated
          confidentially. Urgent national-security reports may be escalated to relevant authorities.
        </p>

        <h2 id="changes">8. Changes to this policy</h2>
        <p>
          We may update this AUP to reflect new capabilities, legal requirements, or observed misuse
          patterns. Material changes will be communicated via the{" "}
          <Link href={localePath(locale, "/changelog")}>changelog</Link> and email to registered
          users. Continued use after notice constitutes acceptance.
        </p>

        <h2 id="contact">9. Contact</h2>
        <p>
          Questions about this policy:{" "}
          <a href="mailto:legal@aegislens.io">legal@aegislens.io</a>.
        </p>
      </Prose>
      <div className="mx-auto max-w-3xl px-4 pb-10">
        <details className="group mt-6 rounded border border-border-subtle bg-bg-surface">
          <summary className="cursor-pointer px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-text-muted group-open:text-accent">
            Version history ▸
          </summary>
          <ol className="divide-y divide-border-subtle border-t border-border-subtle">
            {[
              { version: "1.2", date: "2026-05-23", note: "Expanded §3.3 (technical misuse) to explicitly cover automated scraping without API key and AI-training uses." },
              { version: "1.1", date: "2026-01-20", note: "Added §3.4 legal violations section. Clarified suspension vs. termination in §7." },
              { version: "1.0", date: "2025-10-01", note: "Initial AUP published alongside API launch." },
            ].map((v) => (
              <li key={v.version} className="flex gap-6 px-5 py-3 text-sm">
                <span className="w-10 shrink-0 font-mono text-[11px] text-accent">v{v.version}</span>
                <span className="w-24 shrink-0 font-mono text-[10px] text-text-muted">{v.date}</span>
                <span className="text-text-secondary">{v.note}</span>
              </li>
            ))}
          </ol>
        </details>
      </div>
    </>
  );
}
