/**
 * Embed citation system — attribution markup for partners who embed Aegis Lens maps/widgets.
 * Verified partners earn dofollow upgrades; default embeds use nofollow.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type EmbedPartnerTier = "nofollow" | "dofollow" | "verified-partner";

export interface EmbedCitationConfig {
  partnerId: string;
  domain: string;
  tier: EmbedPartnerTier;
  /** rel attribute for the canonical link */
  canonicalAttr: string;
  /** Pre-built attribution HTML */
  citationHtml: string;
}

export interface PartnerTierUpgradeEvent {
  partnerId: string;
  domain: string;
  previousTier: EmbedPartnerTier;
  newTier: EmbedPartnerTier;
  upgradedAt: string;
  upgradedBy: string;
}

// ── Templates ─────────────────────────────────────────────────────────────────

export const EMBED_ATTRIBUTION_TEMPLATES: Record<
  EmbedPartnerTier,
  { en: string; uk: string }
> = {
  nofollow: {
    en: 'Data &amp; map by <a href="https://aegislens.com" rel="nofollow noopener noreferrer" target="_blank">Aegis Lens</a>',
    uk: 'Дані та карта: <a href="https://aegislens.com" rel="nofollow noopener noreferrer" target="_blank">Aegis Lens</a>',
  },
  dofollow: {
    en: 'Data &amp; map by <a href="https://aegislens.com" rel="noopener noreferrer" target="_blank">Aegis Lens</a>',
    uk: 'Дані та карта: <a href="https://aegislens.com" rel="noopener noreferrer" target="_blank">Aegis Lens</a>',
  },
  "verified-partner": {
    en: 'Powered by <a href="https://aegislens.com" rel="noopener noreferrer" target="_blank">Aegis Lens</a> — <a href="https://aegislens.com/partners" rel="noopener noreferrer" target="_blank">Verified Partner</a>',
    uk: 'На базі <a href="https://aegislens.com" rel="noopener noreferrer" target="_blank">Aegis Lens</a> — <a href="https://aegislens.com/partners" rel="noopener noreferrer" target="_blank">Верифікований партнер</a>',
  },
};

// ── Functions ─────────────────────────────────────────────────────────────────

/**
 * Generates full attribution HTML for an embed partner.
 * Wraps the template in a standardised cite element with schema.org markup.
 */
export function buildCitationMarkup(
  config: EmbedCitationConfig,
  locale: "en" | "uk",
): string {
  const template = EMBED_ATTRIBUTION_TEMPLATES[config.tier][locale];
  return `<cite class="aegis-attribution" data-partner="${config.partnerId}" data-tier="${config.tier}">${template}</cite>`;
}

/**
 * Builds a full EmbedCitationConfig for a new partner.
 * Default tier is nofollow until verified.
 */
export function buildEmbedCitationConfig(
  partnerId: string,
  domain: string,
  tier: EmbedPartnerTier = "nofollow",
): EmbedCitationConfig {
  const relAttr =
    tier === "nofollow" ? "nofollow noopener noreferrer" : "noopener noreferrer";

  const citationHtml = buildCitationMarkup(
    { partnerId, domain, tier, canonicalAttr: relAttr, citationHtml: "" },
    "en",
  );

  return {
    partnerId,
    domain,
    tier,
    canonicalAttr: relAttr,
    citationHtml,
  };
}

/**
 * In-memory tier upgrade log.
 * In production, this should write to a database/audit log.
 */
const _upgradeLog: PartnerTierUpgradeEvent[] = [];

/**
 * Upgrades an embed partner's tier and logs the change.
 * Verified partners earn dofollow links automatically.
 */
export function upgradeEmbedTier(
  partnerId: string,
  newTier: EmbedPartnerTier,
  upgradedBy = "system",
): PartnerTierUpgradeEvent {
  // In production, look up the previous tier from the database
  const previousTier: EmbedPartnerTier = "nofollow";
  const event: PartnerTierUpgradeEvent = {
    partnerId,
    domain: "",
    previousTier,
    newTier,
    upgradedAt: new Date().toISOString(),
    upgradedBy,
  };
  _upgradeLog.push(event);
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[embed-citations] Tier upgrade: ${partnerId} ${previousTier} → ${newTier}`,
    );
  }
  return event;
}

/**
 * Returns the full upgrade event log.
 */
export function getUpgradeLog(): PartnerTierUpgradeEvent[] {
  return [..._upgradeLog];
}

/**
 * Returns the canonical rel attribute string for a given tier.
 */
export function getRelAttr(tier: EmbedPartnerTier): string {
  return tier === "nofollow"
    ? "nofollow noopener noreferrer"
    : "noopener noreferrer";
}
