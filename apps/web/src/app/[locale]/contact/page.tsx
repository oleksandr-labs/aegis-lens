import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { ContactForm } from "@/components/ContactForm";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Contact Aegis Lens";
const DESCRIPTION =
  "We respond to all legitimate inquiries. Choose the right channel below.";

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
    pathFor: (lc) => localePath(lc, "/contact"),
  });
}

type ContactType = {
  type: string;
  icon: string;
  title: string;
  description: string;
  email: string;
  cta: string;
  href?: string;
};

const CONTACT_TYPES: ContactType[] = [
  {
    type: "sales",
    icon: "💼",
    title: "Enterprise Sales",
    description: "Demo requests, pricing, custom data integrations.",
    email: "sales@aegislens.io",
    cta: "Contact sales",
  },
  {
    type: "press",
    icon: "📰",
    title: "Press & Media",
    description: "Press inquiries, interview requests, embargo coordination.",
    email: "press@aegislens.io",
    cta: "Media kit",
    href: "/press",
  },
  {
    type: "security",
    icon: "🔒",
    title: "Security Disclosure",
    description: "Report vulnerabilities via our responsible disclosure program.",
    email: "security@aegislens.io",
    href: "/.well-known/security.txt",
    cta: "Security policy",
  },
  {
    type: "general",
    icon: "✉️",
    title: "General",
    description: "Partnerships, collaboration, academic access, feedback.",
    email: "hello@aegislens.io",
    cta: "Send message",
  },
];

const RESPONSE_TIMES = [
  { label: "Sales inquiries", time: "within 1 business day" },
  { label: "Press inquiries", time: "within 4 hours" },
  { label: "Security reports", time: "within 24 hours" },
  { label: "General", time: "within 3 business days" },
];

const OFFICES = [
  { city: "Kyiv, Ukraine", team: "Engineering & OSINT" },
  { city: "London, UK", team: "Research & Press" },
  { city: "Remote (Global)", team: "Engineering & AI" },
];

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: locale,
    contactPoint: CONTACT_TYPES.map((c) => ({
      "@type": "ContactPoint",
      contactType: c.type,
      email: c.email,
      availableLanguage: ["en", "uk"],
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        eyebrow="Get in touch"
        title="Contact Aegis Lens"
        description="We respond to all legitimate inquiries. Choose the right channel below."
      />

      <div className="mx-auto max-w-4xl px-4 py-10 space-y-16">

        {/* Contact cards 2×2 grid */}
        <section id="channels">
          <h2 className="text-xl font-semibold text-text-primary">Direct channels</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {CONTACT_TYPES.map((c) => (
              <li
                key={c.type}
                className="rounded border border-border-subtle bg-bg-surface p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>
                    {c.icon}
                  </span>
                  <h3 className="font-semibold text-text-primary">{c.title}</h3>
                </div>
                <p className="text-sm text-text-secondary">{c.description}</p>
                <a
                  href={`mailto:${c.email}`}
                  className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
                >
                  {c.email}
                </a>
                <div className="mt-auto">
                  {c.href ? (
                    <Link
                      href={c.href}
                      className="inline-block rounded border border-border-subtle px-3 py-1.5 font-mono text-xs text-text-secondary hover:border-accent hover:text-accent transition-colors"
                    >
                      {c.cta} →
                    </Link>
                  ) : (
                    <a
                      href={`mailto:${c.email}`}
                      className="inline-block rounded border border-border-subtle px-3 py-1.5 font-mono text-xs text-text-secondary hover:border-accent hover:text-accent transition-colors"
                    >
                      {c.cta} →
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Contact form */}
        <section id="form">
          <h2 className="text-xl font-semibold text-text-primary">Send a message</h2>
          <p className="mt-2 text-sm text-text-secondary">
            We read every message. Typical response depends on inquiry type — see timelines below.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </section>

        {/* Response time expectations */}
        <section id="response-times">
          <h2 className="text-xl font-semibold text-text-primary">Response times</h2>
          <ul className="mt-4 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
            {RESPONSE_TIMES.map((r) => (
              <li
                key={r.label}
                className="flex flex-wrap items-baseline justify-between gap-3 px-4 py-3"
              >
                <span className="text-sm font-medium text-text-primary">{r.label}</span>
                <span className="font-mono text-xs text-text-muted">{r.time}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Office locations */}
        <section id="team">
          <h2 className="text-xl font-semibold text-text-primary">Our team</h2>
          <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-3">
            {OFFICES.map((o) => (
              <div
                key={o.city}
                className="rounded border border-border-subtle bg-bg-surface p-4"
              >
                <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  {o.city}
                </div>
                <div className="mt-1 text-sm text-text-secondary">{o.team}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Legal / OSINT tip line preserved below the fold */}
        <section id="tip-line">
          <h2 className="text-xl font-semibold text-text-primary">OSINT tip line</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Submit verified or unverified tips: geolocations, sightings, source leads, or
            corrections to published events. All submissions are reviewed by the intelligence team.
          </p>
          <div className="mt-6 rounded border border-border-subtle bg-bg-surface p-5 text-sm text-text-secondary space-y-4">
            <div>
              <div className="font-semibold text-text-primary">Encrypted submission (recommended)</div>
              <p className="mt-1">
                For sensitive tips, email{" "}
                <a href="mailto:tips@aegislens.io" className="text-accent hover:underline">
                  tips@aegislens.io
                </a>{" "}
                encrypted with our PGP key. Key fingerprint:
              </p>
              <pre className="mt-2 overflow-x-auto rounded bg-bg-elevated p-3 font-mono text-xs text-text-primary">
                A3F7 8B2C 91D4 0E5A 7F16  3BC8 D2A9 4E1F 6C03 B7D5
              </pre>
              <p className="mt-2 text-xs text-text-muted">
                Full public key available at{" "}
                <a href="/pgp/tips-public-key.asc" className="text-accent hover:underline">
                  aegislens.io/pgp/tips-public-key.asc
                </a>
              </p>
            </div>
            <div>
              <div className="font-semibold text-text-primary">Anonymous submission</div>
              <p className="mt-1">
                Use{" "}
                <a
                  href="https://securedrop.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  SecureDrop
                </a>{" "}
                or Signal for tips that require anonymity. We do not log IP addresses on the tip
                endpoint.
              </p>
            </div>
            <div className="rounded border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
              We cannot guarantee source confidentiality if a tip is later the subject of legal
              process. For high-risk tip submissions, use an anonymous channel and do not include
              identifying information.
            </div>
          </div>
        </section>

        {/* Legal entity */}
        <section id="legal">
          <h2 className="text-xl font-semibold text-text-primary">Legal entity &amp; offices</h2>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 rounded border border-border-subtle bg-bg-surface p-5 text-sm sm:grid-cols-[160px_1fr]">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Legal name</dt>
            <dd className="text-text-primary">Aegis Lens Ltd.</dd>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Registered</dt>
            <dd className="text-text-primary">Ukraine (Kyiv) · 2026</dd>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Offices</dt>
            <dd className="text-text-primary">Kyiv, UA · London, UK · Remote (EU)</dd>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-text-muted">General email</dt>
            <dd>
              <a href="mailto:hello@aegislens.io" className="text-accent hover:underline">
                hello@aegislens.io
              </a>
            </dd>
          </dl>
        </section>
      </div>
    </>
  );
}
