/**
 * Frontend Hosting Config — Vercel primary + Cloudflare Pages fallback.
 *
 * Vercel provides the primary deployment target for the Next.js web app.
 * Cloudflare Pages serves as a cold standby / DR mirror.
 *
 * Конфігурація хостингу: Vercel (основний) + Cloudflare Pages (резерв).
 */

// ── Provider constants ────────────────────────────────────────────────────────

export const FRONTEND_PROVIDER = "vercel" as const;

/**
 * Cloudflare Pages is configured as a fallback/DR mirror.
 * Traffic fails over to CF if Vercel has an outage.
 *
 * Cloudflare Pages — резервний вузол; failover при збоях Vercel.
 */
export const CF_PAGES_FALLBACK = true;

// ── VercelEnvVarPattern ───────────────────────────────────────────────────────

/** Pattern used for environment-scoped env var names in Vercel. */
export type VercelEnvScope = "production" | "preview" | "development";

export interface VercelEnvVar {
  key: string;
  /** Scopes where this var is required */
  scopes: VercelEnvScope[];
  /** Whether the value is injected from Doppler (not hard-coded) */
  fromDoppler: boolean;
}

// ── VercelProjectConfig ───────────────────────────────────────────────────────

export interface VercelProjectConfig {
  projectName: string;
  framework: "nextjs";
  rootDirectory: "apps/web";
  /** Custom domains mapped to production deployment */
  domains: string[];
  /** Branch patterns that trigger preview deployments */
  previewBranches: string[];
  /** Environment variables required by the project */
  envVars: VercelEnvVar[];
  /** Vercel regions for edge function execution */
  regions: string[];
  /** Whether Vercel Analytics is enabled */
  analyticsEnabled: boolean;
  /** Whether Vercel Speed Insights is enabled */
  speedInsightsEnabled: boolean;
}

// ── VERCEL_CONFIG ─────────────────────────────────────────────────────────────

export const VERCEL_CONFIG: VercelProjectConfig = {
  projectName: "aegis-lens",
  framework: "nextjs",
  rootDirectory: "apps/web",
  domains: ["aegis-lens.uk", "www.aegis-lens.uk", "app.aegis-lens.uk"],
  previewBranches: ["main", "develop", "feat/*", "fix/*", "chore/*"],
  envVars: [
    { key: "DATABASE_URL", scopes: ["production", "preview"], fromDoppler: true },
    { key: "NEXTAUTH_SECRET", scopes: ["production", "preview"], fromDoppler: true },
    { key: "NEXTAUTH_URL", scopes: ["production", "preview"], fromDoppler: true },
    { key: "STRIPE_SECRET_KEY", scopes: ["production"], fromDoppler: true },
    { key: "STRIPE_WEBHOOK_SECRET", scopes: ["production", "preview"], fromDoppler: true },
    { key: "NEXT_PUBLIC_MAPBOX_TOKEN", scopes: ["production", "preview", "development"], fromDoppler: false },
    { key: "REDIS_URL", scopes: ["production", "preview"], fromDoppler: true },
    { key: "S3_BUCKET_MEDIA", scopes: ["production", "preview"], fromDoppler: true },
  ],
  regions: ["fra1", "iad1"], // Frankfurt + US East (DR)
  analyticsEnabled: true,
  speedInsightsEnabled: true,
};

// ── CloudflarePagesFallback ───────────────────────────────────────────────────

export interface CloudflarePagesConfig {
  projectName: string;
  productionBranch: "main";
  buildCommand: string;
  buildOutputDir: "apps/web/.next";
  /** Whether CF Pages build is kept in sync with Vercel deploys via CI */
  ciSynced: boolean;
}

export const CF_PAGES_CONFIG: CloudflarePagesConfig = {
  projectName: "aegis-lens-fallback",
  productionBranch: "main",
  buildCommand: "pnpm build",
  buildOutputDir: "apps/web/.next",
  ciSynced: true,
};
