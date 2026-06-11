/**
 * BIMI (Brand Indicators for Message Identification) configuration.
 *
 * BIMI displays the aegislens.com brand logo in supporting email clients:
 *   - Apple Mail (iOS 16+, macOS Ventura+)
 *   - Yahoo / AOL Mail
 *   - Gmail — requires a VMC (Verified Mark Certificate) from Entrust or DigiCert
 *   - Fastmail
 *
 * Prerequisites (all must be true before BIMI is displayed):
 *   1. DMARC policy = 'quarantine' or 'reject' (not 'none')
 *   2. DKIM passing for the sending domain
 *   3. SVG logo hosted at an HTTPS URL, conforming to SVG Tiny 1.2
 *   4. (Gmail only) VMC .pem certificate hosted at HTTPS URL
 *
 * Вимоги BIMI: DMARC p=quarantine/reject + SVG логотип + VMC-сертифікат для Gmail.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BimiConfig {
  /** The domain this BIMI config applies to. */
  domain: string;
  /** HTTPS URL to the SVG Tiny 1.2 brand logo. Minimum size: 96×96 px logical. */
  svgLogoUrl: string;
  /**
   * HTTPS URL to the VMC (Verified Mark Certificate) .pem file.
   * Required for Gmail inbox logo display.
   * Optional for Yahoo / Apple Mail.
   */
  vmcUrl?: string;
  /**
   * BIMI selector — corresponds to the DNS record host `<selector>._bimi.<domain>`.
   * Use "default" unless you need multiple selectors per domain.
   */
  selector: string;
}

// ── Default config ─────────────────────────────────────────────────────────────

/**
 * Production BIMI configuration for aegislens.com.
 *
 * Before going live:
 *   1. Upload SVG logo to the svgLogoUrl path (must be publicly accessible via HTTPS).
 *   2. Procure VMC from https://www.entrust.com/verified-mark-certificates/ or DigiCert.
 *   3. Host the VMC .pem at vmcUrl (also HTTPS).
 *   4. Publish the BIMI_DNS_RECORD TXT record in DNS.
 */
export const DEFAULT_BIMI_CONFIG: BimiConfig = {
  domain: "aegislens.com",
  svgLogoUrl: "https://aegislens.com/brand/logo-bimi.svg",
  vmcUrl: "https://aegislens.com/brand/vmc.pem",
  selector: "default",
};

// ── DNS record value ─────────────────────────────────────────────────────────

/**
 * The TXT record value for `default._bimi.aegislens.com`.
 *
 * Format: `v=BIMI1; l=<logo-url>; a=<vmc-url>`
 *   l= is optional if VMC not yet procured (non-Gmail inboxes still show logo).
 *   a= is required for Gmail logo display.
 */
export const BIMI_DNS_RECORD: string =
  `v=BIMI1; ` +
  `l=${DEFAULT_BIMI_CONFIG.svgLogoUrl}; ` +
  `a=${DEFAULT_BIMI_CONFIG.vmcUrl}`;

// ── Header builder ─────────────────────────────────────────────────────────────

/**
 * Builds the `BIMI-Selector` email header value.
 *
 * Include this header on every outbound message so mail clients know which
 * BIMI DNS record to look up.
 *
 * Example: `BIMI-Selector: v=BIMI1; s=default`
 */
export function buildBimiHeader(config: BimiConfig = DEFAULT_BIMI_CONFIG): string {
  return `v=BIMI1; s=${config.selector}`;
}

/**
 * Returns the complete `BIMI-Selector` header as a key/value pair
 * ready to merge into an email headers object.
 */
export function getBimiHeaderRecord(
  config: BimiConfig = DEFAULT_BIMI_CONFIG,
): Record<string, string> {
  return {
    "BIMI-Selector": buildBimiHeader(config),
  };
}

// ── Readiness check ────────────────────────────────────────────────────────────

export interface BimiReadinessResult {
  ready: boolean;
  issues: string[];
  gmailReady: boolean;
}

/**
 * Checks whether the BIMI config is structurally complete.
 * Does not perform live DNS or HTTP lookups (use in CI or admin health check).
 *
 * Перевіряє структурну готовність конфігурації BIMI (без мережевих запитів).
 */
export function checkBimiReadiness(
  config: BimiConfig = DEFAULT_BIMI_CONFIG,
): BimiReadinessResult {
  const issues: string[] = [];

  if (!config.svgLogoUrl.startsWith("https://")) {
    issues.push("svgLogoUrl must be an HTTPS URL");
  }
  if (config.vmcUrl && !config.vmcUrl.startsWith("https://")) {
    issues.push("vmcUrl must be an HTTPS URL if provided");
  }
  if (!config.selector) {
    issues.push("selector must not be empty");
  }

  const gmailReady = !!config.vmcUrl && issues.length === 0;

  return {
    ready: issues.length === 0,
    issues,
    gmailReady,
  };
}
