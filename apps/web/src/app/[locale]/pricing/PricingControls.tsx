"use client";

import { useState } from "react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  UAH: 39.5,
  GBP: 0.79,
  PLN: 3.95,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  UAH: "₴",
  GBP: "£",
  PLN: "zł",
};

interface Tier {
  name: string;
  price: { monthly: number | null; annual: number | null };
  description: string;
  cta: string;
  ctaHref: string;
  highlight: boolean;
  badge?: string;
  features: string[];
}

const TIERS: Tier[] = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    description: "For OSINT learners and casual monitoring.",
    cta: "Start free",
    ctaHref: "/signup",
    highlight: false,
    features: [
      "Live map — last 24h, 3 layers",
      "5 event searches / day",
      "RSS feeds (all topics)",
      "Community access",
      "1 AOI (read-only)",
    ],
  },
  {
    name: "Analyst",
    price: { monthly: 49, annual: 39 },
    description: "For professional OSINT analysts and journalists.",
    cta: "Start free trial",
    ctaHref: "/signup?plan=analyst",
    highlight: false,
    badge: "Most popular",
    features: [
      "All Free features",
      "Full history (90 days)",
      "All 15+ layers",
      "Unlimited searches",
      "AI Copilot (100 queries/mo)",
      "3 Case files",
      "Export CSV + GeoJSON",
      "Email alerts (5 rules)",
      "Telegram bot",
    ],
  },
  {
    name: "Team",
    price: { monthly: 199, annual: 159 },
    description: "For newsrooms, NGOs, and research teams.",
    cta: "Start free trial",
    ctaHref: "/signup?plan=team",
    highlight: true,
    badge: "Best value",
    features: [
      "All Analyst features",
      "Full history (1 year)",
      "Unlimited AI Copilot",
      "Unlimited Case files",
      "Collaborative cases (5 members)",
      "AI-generated reports",
      "Slack + webhook alerts",
      "Priority support",
      "Custom AOIs (10)",
    ],
  },
  {
    name: "Enterprise",
    price: { monthly: null, annual: null },
    description: "For governments, defense, and security firms.",
    cta: "Contact sales",
    ctaHref: "/contact?type=enterprise",
    highlight: false,
    features: [
      "All Team features",
      "Full history (all time)",
      "Unlimited members + SSO/SCIM",
      "Custom data integrations",
      "White-label option",
      "SLA + dedicated CSM",
      "Custom report branding",
      "On-prem / VPC option",
      "STIX 2.1 export",
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(usd: number | null, currency: string): string {
  if (usd === null) return "Custom";
  if (usd === 0) return "Free";
  const converted = Math.round(usd * RATES[currency]);
  return `${CURRENCY_SYMBOLS[currency]}${converted}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TierCard({
  tier,
  isAnnual,
  currency,
}: {
  tier: Tier;
  isAnnual: boolean;
  currency: string;
}) {
  const rawPrice = isAnnual ? tier.price.annual : tier.price.monthly;
  const priceStr = formatPrice(rawPrice, currency);
  const isEnterprise = tier.price.monthly === null;
  const isHighlight = tier.highlight;

  return (
    <div
      className={[
        "relative flex flex-col rounded border p-6 transition-shadow",
        isHighlight
          ? "border-accent bg-[radial-gradient(ellipse_at_top,_rgba(78,161,255,0.08),_transparent_60%)] shadow-[0_0_0_1px_var(--color-accent)]"
          : "border-border-subtle bg-bg-surface",
      ].join(" ")}
    >
      {/* Badge */}
      {tier.badge && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] uppercase text-black">
          {tier.badge}
        </span>
      )}

      {/* Header */}
      <div
        className={[
          "text-sm font-semibold",
          isHighlight ? "text-accent" : "text-text-primary",
        ].join(" ")}
      >
        {tier.name}
      </div>

      {/* Price */}
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-mono text-3xl font-bold text-text-primary">
          {priceStr}
        </span>
        {!isEnterprise && rawPrice !== 0 && (
          <span className="font-mono text-xs text-text-muted">/mo</span>
        )}
      </div>

      {/* Annual note */}
      {isAnnual && !isEnterprise && rawPrice !== 0 && (
        <p className="mt-0.5 font-mono text-[10px] text-green-400">
          Billed annually · save 20%
        </p>
      )}

      {/* Description */}
      <p className="mt-3 text-sm text-text-secondary">{tier.description}</p>

      {/* Feature list */}
      <ul className="mt-5 flex-1 space-y-2">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
            <span className="mt-0.5 shrink-0 text-accent">✓</span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={tier.ctaHref}
        className={[
          "mt-6 inline-block rounded border px-4 py-2.5 text-center text-sm font-semibold transition-colors",
          isHighlight
            ? "border-accent bg-accent text-black hover:bg-accent/90"
            : "border-border-default bg-bg-surface text-text-primary hover:bg-bg-elevated",
        ].join(" ")}
      >
        {tier.cta}
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main client component — owns billing + currency state
// ---------------------------------------------------------------------------

export function PricingControls() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [currency, setCurrency] = useState("USD");

  return (
    <div>
      {/* Controls row */}
      <div className="mb-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        {/* Billing toggle */}
        <div className="flex items-center rounded border border-border-subtle">
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={[
              "rounded-l px-4 py-1.5 text-sm font-semibold transition-colors",
              !isAnnual
                ? "bg-accent text-black"
                : "bg-bg-surface text-text-secondary hover:bg-bg-elevated",
            ].join(" ")}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={[
              "flex items-center gap-2 rounded-r px-4 py-1.5 text-sm font-semibold transition-colors",
              isAnnual
                ? "bg-accent text-black"
                : "bg-bg-surface text-text-secondary hover:bg-bg-elevated",
            ].join(" ")}
          >
            Annual
            {isAnnual && (
              <span className="rounded-full bg-green-500/20 px-1.5 py-0.5 font-mono text-[10px] text-green-400">
                Save 20%
              </span>
            )}
            {!isAnnual && (
              <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 font-mono text-[10px] text-green-500/70">
                Save 20%
              </span>
            )}
          </button>
        </div>

        {/* Currency selector */}
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="rounded border border-border-subtle bg-bg-surface px-3 py-1.5 font-mono text-sm text-text-primary outline-none focus:border-accent"
          aria-label="Currency"
        >
          {Object.keys(RATES).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Tier cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => (
          <TierCard
            key={tier.name}
            tier={tier}
            isAnnual={isAnnual}
            currency={currency}
          />
        ))}
      </div>
    </div>
  );
}
