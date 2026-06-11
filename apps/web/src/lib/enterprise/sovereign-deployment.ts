/**
 * Sovereign / on-premises deployment configuration.
 *
 * Defines deployment model options, sovereign cloud specs, the
 * air-gapped installer spec, and supported KMS providers.
 *
 * Target personas:
 *   - NATO/EU government agencies requiring data residency
 *   - Defence organisations needing air-gapped deployment
 *   - Regulated enterprises with BYO-KMS requirements
 *
 * Варіанти розгортання: SaaS → sovereign cloud → on-prem → air-gapped.
 */

// ── Deployment models ─────────────────────────────────────────────────────────

export type DeploymentModel =
  | "saas"
  | "managed-cloud"
  | "sovereign-cloud"
  | "on-prem"
  | "air-gapped";

// ── Sovereign config ──────────────────────────────────────────────────────────

export interface SovereignConfig {
  model: DeploymentModel;
  /** Cloud provider name (undefined for on-prem/air-gapped). */
  cloudProvider?: string;
  /** Deployment region (ISO 3166-1 alpha-2 or region name). */
  region?: string;
  /** Data residency jurisdiction, e.g. "EU", "UK", "UA", "US-GovCloud". */
  dataResidency: string;
  /** KMS provider for BYO encryption keys. */
  kmsProvider?: string;
  /** Whether customer-managed custom data layers are supported. */
  customLayers: boolean;
  /** Target uptime SLA as a fraction, e.g. 0.9995 = 99.95%. */
  slaTarget: number;
  /** Support coverage description, e.g. "24/7 dedicated CSM". */
  supportCoverage: string;
}

// ── Deployment options ────────────────────────────────────────────────────────

/**
 * Five supported deployment options, from SaaS (default) to air-gapped.
 *
 * П'ять варіантів розгортання Aegis Lens.
 */
export const SOVEREIGN_DEPLOYMENT_OPTIONS: SovereignConfig[] = [
  {
    model: "saas",
    cloudProvider: "Vercel / Hetzner",
    region: "EU",
    dataResidency: "EU (Frankfurt, DE)",
    kmsProvider: undefined,
    customLayers: false,
    slaTarget: 0.999,
    supportCoverage: "Business hours; enterprise SLA on request",
  },
  {
    model: "managed-cloud",
    cloudProvider: "AWS",
    region: "us-gov-west-1",
    dataResidency: "US GovCloud (Oregon)",
    kmsProvider: "AWS KMS",
    customLayers: true,
    slaTarget: 0.9995,
    supportCoverage: "24/7 dedicated CSM + 4-hour incident SLA",
  },
  {
    model: "sovereign-cloud",
    cloudProvider: "OVH SecNumCloud",
    region: "fr-south",
    dataResidency: "EU (France, SecNumCloud certified)",
    kmsProvider: "AWS KMS or self-managed",
    customLayers: true,
    slaTarget: 0.9995,
    supportCoverage: "24/7 dedicated CSM + 4-hour incident SLA",
  },
  {
    model: "sovereign-cloud",
    cloudProvider: "GigaCloud / Dataline UA",
    region: "ua",
    dataResidency: "Ukraine",
    kmsProvider: "Self-managed (HashiCorp Vault)",
    customLayers: true,
    slaTarget: 0.999,
    supportCoverage: "Business hours + Kyiv on-site support available",
  },
  {
    model: "air-gapped",
    cloudProvider: undefined,
    region: undefined,
    dataResidency: "Customer-managed (no egress required)",
    kmsProvider: "HashiCorp Vault (bundled) or customer HSM",
    customLayers: true,
    slaTarget: 0.999,
    supportCoverage:
      "Annual on-site support visit + secure remote support via jump host",
  },
];

// ── Air-gapped installer spec ─────────────────────────────────────────────────

/**
 * Specification for the air-gapped installer bundle.
 * This is an offline deployment package — no internet access required.
 *
 * Специфікація інсталятора для повністю ізольованих мереж.
 */
export const AIR_GAPPED_INSTALLER_SPEC = {
  version: "1.0.0-alpha",
  /** Services bundled in the installer image. */
  includedServices: [
    "aegislens-web (Next.js)",
    "aegislens-api (Next.js API routes)",
    "PostgreSQL 16",
    "Qdrant (vector DB)",
    "Redis 7 (cache + rate limit)",
    "Nginx (reverse proxy + TLS termination)",
    "HashiCorp Vault (KMS)",
    "OpenTelemetry Collector (observability)",
    "Prometheus + Grafana (metrics)",
    "Container registry (offline mirror)",
  ],
  minHardware: {
    cpu_cores: 8,
    ram_gb: 32,
    storage_gb: 500,
    os: "Ubuntu 22.04 LTS or RHEL 9",
    network: "Internal only — no outbound internet required",
    tls: "Self-signed or internal CA certificate required",
  },
  installGuide_en: [
    "1. Download the installer bundle tarball from the secure delivery portal.",
    "2. Verify the SHA-256 checksum against the published manifest.",
    "3. Copy the bundle to the target server via removable media or secure file transfer.",
    "4. Extract: tar -xzf aegislens-airgapped-<version>.tar.gz",
    "5. Run: sudo ./install.sh — interactive wizard configures DB, TLS, admin credentials.",
    "6. Configure your internal DNS to point aegislens.<yourdomain> to the server IP.",
    "7. Access the admin panel at https://aegislens.<yourdomain>/admin to complete setup.",
    "8. Run post-install health check: sudo ./health-check.sh",
    "9. Configure HashiCorp Vault for BYO-KMS if required.",
    "10. Import initial data layers via the offline data import tool.",
  ].join("\n"),
} as const;

// ── KMS providers ─────────────────────────────────────────────────────────────

/**
 * Supported KMS (Key Management Service) providers for BYO-KMS.
 *
 * Підтримувані KMS провайдери для власних ключів шифрування.
 */
export const KMS_PROVIDERS: {
  name: string;
  supported: boolean;
  integrationStatus: string;
}[] = [
  {
    name: "AWS Key Management Service (KMS)",
    supported: true,
    integrationStatus: "planned — Q3 2027",
  },
  {
    name: "Azure Key Vault",
    supported: true,
    integrationStatus: "planned — Q3 2027",
  },
  {
    name: "HashiCorp Vault",
    supported: true,
    integrationStatus: "bundled with air-gapped installer",
  },
  {
    name: "Self-managed (HSM / PKCS#11)",
    supported: false,
    integrationStatus: "on roadmap — customer request required",
  },
];
