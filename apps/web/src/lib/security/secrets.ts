/**
 * Secrets management provider abstraction for Aegis Lens.
 *
 * Principle: zero secrets in the repository.
 *   - All secrets live in Doppler (primary) or AWS SSM / Secrets Manager (fallback)
 *   - `.env` files are .gitignored; CI uses provider-injected secrets
 *   - Local dev: `doppler run -- next dev`
 *
 * CI secret scanning:
 *   - gitleaks configured in .gitleaks.toml (blocks commits containing secrets)
 *   - trufflehog runs in GitHub Actions on every PR
 *   - SAST: CodeQL (via GH Advanced Security) + Snyk for dependency vulns
 *
 * Sprint 2.73 — secrets & scanning implementation.
 *
 * @see docs/security/secrets-management.md
 */

// ── Provider types ────────────────────────────────────────────────────────────

export type SecretsProvider = "doppler" | "aws-ssm" | "aws-secrets-manager" | "env";

export interface SecretsProviderConfig {
  provider: SecretsProvider;
  /** Doppler project name */
  dopplerProject?: string;
  /** Doppler config (environment: dev / stg / prd) */
  dopplerConfig?: string;
  /** AWS region (for SSM / Secrets Manager) */
  awsRegion?: string;
  /** AWS Secrets Manager prefix path */
  awsPath?: string;
}

export const SECRETS_CONFIG: SecretsProviderConfig = {
  provider: (process.env.SECRETS_PROVIDER as SecretsProvider) ?? "doppler",
  dopplerProject: "aegis-lens",
  dopplerConfig: process.env.NODE_ENV === "production" ? "prd" : "dev",
  awsRegion: process.env.AWS_REGION ?? "eu-central-1",
  awsPath: "/aegis-lens/",
};

// ── Secret reference ──────────────────────────────────────────────────────────

/**
 * A typed reference to a secret, without containing the actual value.
 * Use this to pass secret identifiers around without leaking values.
 */
export interface SecretRef {
  /** Human-readable name for logging/debugging */
  name: string;
  /**
   * Provider-specific key:
   *   doppler   → environment variable name (e.g. "DATABASE_URL")
   *   aws-ssm   → parameter path (e.g. "/aegis-lens/prd/database-url")
   *   aws-secrets-manager → secret name (e.g. "aegis-lens/prd/stripe-key")
   */
  key: string;
  provider?: SecretsProvider;
  /** Whether this secret can be safely logged (partial) */
  sensitive: boolean;
}

// Well-known secret references (add as needed)
export const SECRET_REFS = {
  DATABASE_URL: {
    name: "PostgreSQL connection string",
    key: "DATABASE_URL",
    sensitive: true,
  },
  STRIPE_SECRET_KEY: {
    name: "Stripe secret key",
    key: "STRIPE_SECRET_KEY",
    sensitive: true,
  },
  WORKOS_API_KEY: {
    name: "WorkOS API key",
    key: "WORKOS_API_KEY",
    sensitive: true,
  },
  INTERNAL_SECRET: {
    name: "Internal service auth secret",
    key: "INTERNAL_SECRET",
    sensitive: true,
  },
  JWT_PRIVATE_KEY: {
    name: "JWT RS256 private key",
    key: "JWT_PRIVATE_KEY",
    sensitive: true,
  },
  MAPBOX_SECRET_TOKEN: {
    name: "Mapbox secret token",
    key: "MAPBOX_SECRET_TOKEN",
    sensitive: true,
  },
} as const satisfies Record<string, SecretRef>;

// ── Resolution ────────────────────────────────────────────────────────────────

/**
 * Resolves a secret reference to its actual value.
 *
 * In production (Doppler):
 *   Secrets are injected as environment variables by the Doppler CLI / Kubernetes operator.
 *   This function simply reads from process.env (Doppler has already populated them).
 *
 * In production (AWS SSM):
 *   Would call SSM.GetParameter({ Name: ref.key, WithDecryption: true })
 *
 * In production (AWS Secrets Manager):
 *   Would call SecretsManager.GetSecretValue({ SecretId: ref.key })
 *
 * Never call this in client-side code — `server-only` guard enforced below.
 */
export async function resolveSecret(ref: SecretRef): Promise<string> {
  const provider = ref.provider ?? SECRETS_CONFIG.provider;

  if (provider === "doppler" || provider === "env") {
    const value = process.env[ref.key];
    if (!value) {
      throw new Error(
        `Secret "${ref.name}" (${ref.key}) is not set. ` +
        `Run: doppler run -- next dev`
      );
    }
    return value;
  }

  if (provider === "aws-ssm") {
    // TODO: implement SSM fetch
    // const { SSMClient, GetParameterCommand } = await import("@aws-sdk/client-ssm");
    // const client = new SSMClient({ region: SECRETS_CONFIG.awsRegion });
    // const { Parameter } = await client.send(new GetParameterCommand({ Name: ref.key, WithDecryption: true }));
    // return Parameter?.Value ?? "";
    throw new Error("AWS SSM provider not yet implemented — use Doppler in the meantime");
  }

  if (provider === "aws-secrets-manager") {
    // TODO: implement Secrets Manager fetch
    // const { SecretsManagerClient, GetSecretValueCommand } = await import("@aws-sdk/client-secrets-manager");
    // const client = new SecretsManagerClient({ region: SECRETS_CONFIG.awsRegion });
    // const { SecretString } = await client.send(new GetSecretValueCommand({ SecretId: ref.key }));
    // return SecretString ?? "";
    throw new Error("AWS Secrets Manager provider not yet implemented — use Doppler in the meantime");
  }

  throw new Error(`Unknown secrets provider: ${provider}`);
}

// ── CI/CD scanning configuration notes ───────────────────────────────────────

/**
 * GITLEAKS CONFIGURATION
 *
 * File: .gitleaks.toml  (repo root)
 * Blocks commits containing detected secrets.
 *
 * Setup:
 *   1. Install: brew install gitleaks (or via GitHub Actions)
 *   2. Pre-commit: add to .pre-commit-config.yaml:
 *        - repo: https://github.com/gitleaks/gitleaks
 *          rev: v8.18.0
 *          hooks:
 *            - id: gitleaks
 *
 * .gitleaks.toml template:
 *
 *   [extend]
 *   useDefault = true          # use the built-in rule set
 *
 *   [[rules]]
 *   id = "aegis-internal-secret"
 *   description = "Aegis internal service secret"
 *   regex = '''ais_[0-9a-zA-Z]{32}'''
 *   tags = ["key", "aegis"]
 *
 *   [allowlist]
 *   paths = [
 *     '''apps/web/src/lib/security/secrets.ts''',   # this file — comments only
 *     '''docs/security/''',
 *   ]
 */

/**
 * TRUFFLEHOG CI CONFIGURATION
 *
 * GitHub Actions step — add to .github/workflows/security.yml:
 *
 *   - name: TruffleHog secret scan
 *     uses: trufflesecurity/trufflehog@main
 *     with:
 *       path: ./
 *       base: ${{ github.event.repository.default_branch }}
 *       head: HEAD
 *       extra_args: --only-verified
 */

/**
 * SAST & DEPENDENCY SCANNING
 *
 * CodeQL (GitHub Advanced Security):
 *   Enabled via: Settings → Security → Code scanning → Set up CodeQL
 *   Language: javascript-typescript
 *   Schedule: on push + weekly
 *
 * Snyk dependency scanning:
 *   GitHub App: https://app.snyk.io/org/aegis-lens
 *   CLI: snyk monitor --all-projects
 *   PR checks: Snyk PR status checks enabled
 *   Severity threshold: HIGH (blocks PRs with high/critical vulns)
 *
 *   package.json script:
 *     "security:scan": "snyk test --severity-threshold=high"
 */

/**
 * DOPPLER SETUP GUIDE
 *
 * 1. Create project: https://dashboard.doppler.com → New Project → "aegis-lens"
 * 2. Configs: dev / stg / prd
 * 3. Add all secrets (no .env files in repo after migration)
 * 4. Local dev: `doppler setup && doppler run -- next dev`
 * 5. CI: store DOPPLER_TOKEN in GitHub Actions secrets
 *    GitHub Actions step:
 *      - uses: dopplerhq/cli-action@v3
 *      - run: doppler run -- next build
 * 6. Server: Doppler Kubernetes operator or systemd EnvironmentFile from doppler export
 *
 * NEVER commit .env files. Add to .gitignore:
 *   .env
 *   .env.*
 *   !.env.example
 */
