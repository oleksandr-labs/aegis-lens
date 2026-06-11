/**
 * Preview Environments — per-PR ephemeral environment configuration.
 *
 * Each pull request gets an isolated preview environment on Vercel.
 * Environments are automatically torn down after TTL_HOURS of inactivity.
 *
 * Ефемерні середовища для кожного PR: автоматичне розгортання та знищення.
 */

// ── Notes ─────────────────────────────────────────────────────────────────────

export const PREVIEW_NOTE_EN =
  "Preview environments run on Vercel preview deployments backed by a shared staging Postgres " +
  "schema isolated per PR (prefix: pr_<number>_). Tear-down on PR close or TTL expiry.";

export const PREVIEW_NOTE_UK =
  "Preview-середовища на Vercel preview + ізольована схема Postgres (префікс: pr_<number>_). " +
  "Знищення при закритті PR або закінченні TTL.";

// ── TTL constant ──────────────────────────────────────────────────────────────

/**
 * Hours of inactivity after which a preview environment is automatically destroyed.
 *
 * Години бездіяльності до автоматичного знищення preview-середовища.
 */
export const PREVIEW_ENV_TTL_HOURS = 24;

// ── PreviewEnvConfig ──────────────────────────────────────────────────────────

export interface PreviewEnvConfig {
  /** PR number this environment was created for */
  prNumber: number;
  /** Computed environment name (used as Vercel deployment alias + DB schema prefix) */
  envName: string;
  /** Vercel deployment URL */
  deploymentUrl: string | null;
  /** Database schema prefix for this PR */
  dbSchemaPrefix: string;
  /** ISO timestamp when the env was created */
  createdAt: string;
  /** ISO timestamp after which the env should be torn down */
  expiresAt: string;
  /** Whether the environment has been torn down */
  tornDown: boolean;
}

// ── buildPreviewEnvName ───────────────────────────────────────────────────────

/**
 * Build a deterministic, URL-safe preview environment name for a given PR.
 *
 * Будує детерміноване ім'я preview-середовища для PR.
 */
export function buildPreviewEnvName(prNumber: number): string {
  return `pr-${prNumber}-aegis`;
}

/**
 * Build the Postgres schema prefix for a PR preview environment.
 *
 * Будує префікс схеми Postgres для preview-середовища PR.
 */
export function buildPreviewDbSchema(prNumber: number): string {
  return `pr_${prNumber}_`;
}

// ── PreviewEnvRegistry ────────────────────────────────────────────────────────

/**
 * In-memory registry of active preview environments.
 * In production, store in Postgres `preview_envs` table.
 *
 * Реєстр активних preview-середовищ. У продакшені — таблиця `preview_envs`.
 */
export class PreviewEnvRegistry {
  private static instance: PreviewEnvRegistry;
  private readonly envs = new Map<number, PreviewEnvConfig>();

  private constructor() {}

  static getInstance(): PreviewEnvRegistry {
    if (!PreviewEnvRegistry.instance) {
      PreviewEnvRegistry.instance = new PreviewEnvRegistry();
    }
    return PreviewEnvRegistry.instance;
  }

  create(prNumber: number, deploymentUrl: string | null = null): PreviewEnvConfig {
    const now = new Date();
    const env: PreviewEnvConfig = {
      prNumber,
      envName: buildPreviewEnvName(prNumber),
      deploymentUrl,
      dbSchemaPrefix: buildPreviewDbSchema(prNumber),
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + PREVIEW_ENV_TTL_HOURS * 3_600_000).toISOString(),
      tornDown: false,
    };
    this.envs.set(prNumber, env);
    return env;
  }

  tearDown(prNumber: number): boolean {
    const env = this.envs.get(prNumber);
    if (!env) return false;
    env.tornDown = true;
    return true;
  }

  getExpired(): PreviewEnvConfig[] {
    const now = Date.now();
    return Array.from(this.envs.values()).filter(
      (e) => !e.tornDown && new Date(e.expiresAt).getTime() < now,
    );
  }
}

export const previewEnvRegistry = PreviewEnvRegistry.getInstance();
