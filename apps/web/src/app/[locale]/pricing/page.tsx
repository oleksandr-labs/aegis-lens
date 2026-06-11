import Link from "next/link";
import { Suspense, Fragment } from "react";
import type { Metadata } from "next";
import { urls } from "@aegis/url-builder";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { getT } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { listCaseStudies } from "@/lib/case-studies-seed";
import { PricingControls } from "./PricingControls";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = await getT(locale, "marketing");
  return buildMetadata({
    locale,
    title: t("pricing.title"),
    description: t("pricing.subtitle"),
    pathFor: (lc) => urls.pricing(lc),
  });
}

// ---------------------------------------------------------------------------
// Comparison table data
// ---------------------------------------------------------------------------

type TableRow = {
  feature: string;
  free: string;
  analyst: string;
  team: string;
  enterprise: string;
  group?: string;
};

const COMPARISON_ROWS: TableRow[] = [
  // Map & Data
  { group: "Map & Data", feature: "Map history", free: "24h", analyst: "90 days", team: "1 year", enterprise: "All time" },
  { feature: "Layers", free: "3", analyst: "All", team: "All", enterprise: "All + custom" },
  { feature: "Real-time updates", free: "✓", analyst: "✓", team: "✓", enterprise: "✓" },
  { feature: "Custom AOIs", free: "1 (read-only)", analyst: "3", team: "10", enterprise: "Unlimited" },
  // AI
  { group: "AI", feature: "AI Copilot", free: "—", analyst: "100/mo", team: "Unlimited", enterprise: "Unlimited" },
  { feature: "AI reports", free: "—", analyst: "—", team: "✓", enterprise: "✓ + branded" },
  // Collaboration
  { group: "Collaboration", feature: "Case files", free: "—", analyst: "3", team: "Unlimited", enterprise: "Unlimited" },
  { feature: "Team members", free: "1", analyst: "1", team: "5", enterprise: "Unlimited" },
  { feature: "SSO / SCIM", free: "—", analyst: "—", team: "—", enterprise: "✓" },
  // Exports
  { group: "Exports", feature: "CSV / GeoJSON", free: "—", analyst: "✓", team: "✓", enterprise: "✓" },
  { feature: "STIX 2.1", free: "—", analyst: "—", team: "—", enterprise: "✓" },
  // Alerts
  { group: "Alerts", feature: "Email alerts", free: "—", analyst: "5 rules", team: "25 rules", enterprise: "Unlimited" },
  { feature: "Telegram bot", free: "—", analyst: "✓", team: "✓", enterprise: "✓" },
  { feature: "Slack / webhook", free: "—", analyst: "—", team: "✓", enterprise: "✓" },
  // Support
  { group: "Support", feature: "Support tier", free: "Community", analyst: "Email", team: "Priority", enterprise: "Dedicated CSM" },
  { feature: "Uptime SLA", free: "—", analyst: "—", team: "—", enterprise: "✓" },
  { feature: "On-prem / VPC", free: "—", analyst: "—", team: "—", enterprise: "✓" },
];

const SPECIAL_PROGRAMS = [
  {
    name: "NGO / Humanitarian",
    discount: "50% discount",
    description:
      "Registered NGOs and humanitarian coordination bodies operating in conflict-affected areas. No country restriction.",
    type: "ngo",
  },
  {
    name: "Journalists & Press",
    discount: "Free Analyst tier",
    description:
      "Verified staff reporters and freelancers at accredited news organisations. Apply with your press credential or published byline.",
    type: "press",
  },
  {
    name: "Academic Research",
    discount: "70% discount",
    description:
      "Enrolled graduate researchers and faculty at accredited institutions. Provide institutional email and research purpose.",
    type: "academic",
  },
  {
    name: "Ukraine Residency",
    discount: "Free Analyst tier",
    description:
      "Ukrainian residents may apply for Analyst access at no cost for civilian-safety use. Document with Ukrainian ID.",
    type: "ukraine",
  },
];

const FAQ_ITEMS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes, immediately. No lock-in, no cancellation fees. Cancel from your account dashboard and your plan reverts to Free at the end of the billing period.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — 14 days on all paid plans. No credit card required. After the trial, you choose a plan or revert to Free automatically.",
  },
  {
    q: "Do you offer NGO / press discounts?",
    a: "Yes — see the special programs section above. NGOs get 50% off, accredited journalists get the full Analyst tier free, academics get 70% off, and Ukrainian residents get Analyst free.",
  },
  {
    q: "What payment methods are accepted?",
    a: "Stripe: credit / debit cards, SEPA Direct Debit, and BACS. Enterprise customers can also be invoiced via bank transfer.",
  },
  {
    q: "Can I self-host or deploy on-premises?",
    a: "The Enterprise plan includes a VPC / on-premises deployment option. Contact sales to scope a private deployment for your organisation.",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function CellValue({ val }: { val: string }) {
  if (val === "✓")
    return <span className="font-mono text-[12px] text-accent">✓</span>;
  if (val === "—")
    return <span className="font-mono text-[12px] text-text-muted">—</span>;
  return <span className="font-mono text-[11px] text-text-primary">{val}</span>;
}

// ---------------------------------------------------------------------------
// Page (server component)
// ---------------------------------------------------------------------------

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const allCases = listCaseStudies();

  return (
    <>
      {/* ----------------------------------------------------------------- */}
      {/* Hero                                                               */}
      {/* ----------------------------------------------------------------- */}
      <PageHeader
        eyebrow="Transparent Pricing"
        title="Intelligence for every team"
        description="From open-source analysts to government agencies. Cancel anytime."
      />

      <section className="mx-auto max-w-7xl px-4 pb-24 pt-12">
        {/* --------------------------------------------------------------- */}
        {/* Billing toggle + currency + tier cards (client, shared state)    */}
        {/* --------------------------------------------------------------- */}
        <Suspense
          fallback={
            <div className="h-64 animate-pulse rounded border border-border-subtle bg-bg-surface" />
          }
        >
          <PricingControls />
        </Suspense>

        {/* --------------------------------------------------------------- */}
        {/* Feature comparison table                                         */}
        {/* --------------------------------------------------------------- */}
        <section className="mt-20" id="compare">
          <h2 className="text-xl font-semibold text-text-primary">
            Full feature comparison
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Scroll right on mobile.
          </p>
          <div className="mt-6 overflow-x-auto rounded border border-border-subtle">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated">
                  <th className="py-3 pl-5 pr-4 text-left font-mono text-[10px] uppercase tracking-wider text-text-muted w-52">
                    Feature
                  </th>
                  {["Free", "Analyst", "Team", "Enterprise"].map((name) => (
                    <th
                      key={name}
                      className="px-4 py-3 text-center text-sm font-semibold text-text-primary"
                    >
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <Fragment key={row.feature}>
                    {row.group && (
                      <tr className="border-t border-border-subtle bg-bg-elevated/50">
                        <td
                          colSpan={5}
                          className="pl-5 py-2 font-mono text-[10px] uppercase tracking-wider text-text-muted"
                        >
                          {row.group}
                        </td>
                      </tr>
                    )}
                    <tr
                      className="border-t border-border-subtle/50 hover:bg-bg-elevated/40"
                    >
                      <td className="py-3 pl-5 pr-4 text-text-secondary">
                        {row.feature}
                      </td>
                      {[row.free, row.analyst, row.team, row.enterprise].map(
                        (val, j) => (
                          <td key={j} className="px-4 py-3 text-center">
                            <CellValue val={val} />
                          </td>
                        )
                      )}
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        {/* Special programs                                                 */}
        {/* --------------------------------------------------------------- */}
        <section className="mt-20" id="programs">
          <h2 className="text-xl font-semibold text-text-primary">
            Special programs
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            We believe verified intelligence should be accessible to those who
            need it most — not just those who can afford it.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {SPECIAL_PROGRAMS.map((prog) => (
              <div
                key={prog.name}
                className="flex flex-col rounded border border-border-subtle bg-bg-surface p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-text-primary">
                    {prog.name}
                  </p>
                  <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-accent">
                    {prog.discount}
                  </span>
                </div>
                <p className="mt-2 flex-1 text-sm text-text-secondary">
                  {prog.description}
                </p>
                <Link
                  href={`/contact?type=${prog.type}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline underline-offset-2"
                >
                  Apply →
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-text-muted">
            To apply, email{" "}
            <a
              href="mailto:grants@aegislens.io"
              className="text-accent underline-offset-2 hover:underline"
            >
              grants@aegislens.io
            </a>{" "}
            with your name, organisation, role, and a brief description of your
            use case. We aim to respond within five business days.
          </p>
        </section>

        {/* --------------------------------------------------------------- */}
        {/* Case studies strip                                               */}
        {/* --------------------------------------------------------------- */}
        {allCases.length > 0 && (
          <section className="mt-20">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
              Used by
            </h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allCases.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={urls.caseStudy(locale, c.slug)}
                    className="block h-full rounded border border-border-subtle bg-bg-surface px-4 py-3 text-sm hover:border-accent hover:bg-bg-elevated transition-colors"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      <span>{c.industry}</span>
                      <span>{c.region}</span>
                    </div>
                    <div className="mt-1 font-semibold text-text-primary">
                      {c.client}
                    </div>
                    <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                      {c.oneLiner}
                    </p>
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-accent">
                      Read case study →
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* --------------------------------------------------------------- */}
        {/* FAQ                                                              */}
        {/* --------------------------------------------------------------- */}
        <section className="mt-20" id="faq">
          <h2 className="text-xl font-semibold text-text-primary">
            Frequently asked questions
          </h2>
          <ul className="mt-6 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <li key={item.q}>
                <details className="group rounded border border-border-subtle bg-bg-surface">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-text-primary marker:hidden">
                    <span>{item.q}</span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-mono text-sm text-text-muted transition-transform duration-200 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="border-t border-border-subtle px-5 py-4 text-sm text-text-secondary">
                    {item.a}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        </section>

        {/* --------------------------------------------------------------- */}
        {/* Enterprise CTA                                                   */}
        {/* --------------------------------------------------------------- */}
        <section className="mt-20" id="enterprise">
          <div className="rounded border border-border-subtle bg-bg-surface p-8 text-center">
            <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
              Government · Defense · Enterprise
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-text-primary">
              Need a custom deployment?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-text-secondary">
              SSO / SCIM, on-premises VPC, custom data layers, SLA guarantees,
              STIX 2.1 export, DPA, and dedicated CSM. Scoped per engagement —
              contact us for pricing.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:sales@aegislens.io"
                className="inline-block rounded border border-accent px-6 py-2.5 font-mono text-sm text-accent transition-colors hover:bg-accent hover:text-black"
              >
                sales@aegislens.io
              </a>
              <Link
                href="/contact?type=enterprise"
                className="inline-block rounded border border-border-default bg-bg-elevated px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-surface"
              >
                Schedule a call →
              </Link>
            </div>
          </div>
        </section>
      </section>
    </>
  );
}
