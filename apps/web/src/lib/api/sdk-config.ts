/**
 * Auto-generated SDK configuration — language targets, package metadata, and generation notes.
 * Конфігурація автогенерованих SDK — цільові мови, метадані пакетів та нотатки генерації.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type SdkLanguage = "typescript" | "python" | "go";

export interface SdkConfig {
  language: SdkLanguage;
  packageName: string;
  version: string;
  openApiSpecUrl: string;
  githubRepo: string;
  installCommand: string;
  quickstartSnippet: string;
}

// ── SDK catalog ───────────────────────────────────────────────────────────────

export const SDK_CONFIGS: SdkConfig[] = [
  {
    language: "typescript",
    packageName: "@aegis-lens/sdk",
    version: "0.1.0",
    openApiSpecUrl: "/api/openapi.json",
    githubRepo: "https://github.com/aegis-lens/sdk-typescript",
    installCommand: "npm install @aegis-lens/sdk",
    quickstartSnippet:
      `import { AegisLensClient } from '@aegis-lens/sdk';\n` +
      `const client = new AegisLensClient({ apiKey: process.env.AEGIS_API_KEY });\n` +
      `const events = await client.events.list({ country: 'UA', limit: 20 });`,
  },
  {
    language: "python",
    packageName: "aegis-lens",
    version: "0.1.0",
    openApiSpecUrl: "/api/openapi.json",
    githubRepo: "https://github.com/aegis-lens/sdk-python",
    installCommand: "pip install aegis-lens",
    quickstartSnippet:
      `from aegis_lens import AegisLensClient\n` +
      `client = AegisLensClient(api_key=os.environ['AEGIS_API_KEY'])\n` +
      `events = client.events.list(country='UA', limit=20)`,
  },
  {
    language: "go",
    packageName: "github.com/aegis-lens/go-sdk",
    version: "v0.1.0",
    openApiSpecUrl: "/api/openapi.json",
    githubRepo: "https://github.com/aegis-lens/go-sdk",
    installCommand: "go get github.com/aegis-lens/go-sdk",
    quickstartSnippet:
      `import aegis "github.com/aegis-lens/go-sdk"\n` +
      `client := aegis.NewClient(os.Getenv("AEGIS_API_KEY"))\n` +
      `events, err := client.Events.List(ctx, &aegis.EventListParams{Country: "UA", Limit: 20})`,
  },
];

// ── Notes ─────────────────────────────────────────────────────────────────────

/** openapi-generator — SDKs are generated from the OpenAPI 3.1 specification */
export const SDK_NOTE_GENERATOR_EN =
  "openapi-generator — TypeScript, Python, and Go SDKs are generated from the OpenAPI 3.1 specification at /api/openapi.json using openapi-generator-cli; custom templates ensure idiomatic code per language.";
export const SDK_NOTE_GENERATOR_UK =
  "openapi-generator — SDK для TypeScript, Python та Go генеруються зі специфікації OpenAPI 3.1 за адресою /api/openapi.json за допомогою openapi-generator-cli; кастомні шаблони забезпечують ідіоматичний код для кожної мови.";

/** Auto-publish on spec change — CI pipeline regenerates and publishes SDKs on OpenAPI changes */
export const SDK_NOTE_AUTOPUBLISH_EN =
  "Auto-publish on spec change — the CI pipeline regenerates and publishes SDKs to npm, PyPI, and pkg.go.dev automatically when the OpenAPI spec changes; version is bumped per semver rules.";
export const SDK_NOTE_AUTOPUBLISH_UK =
  "Автопублікація при зміні специфікації — CI-конвеєр автоматично перегенеровує та публікує SDK в npm, PyPI та pkg.go.dev при зміні специфікації OpenAPI; версія оновлюється за правилами semver.";

/** Semver — all SDKs follow semantic versioning */
export const SDK_NOTE_SEMVER_EN =
  "Semver — all SDKs follow semantic versioning; breaking API changes trigger a major version bump and are announced 30 days in advance via the changelog and developer email list.";
export const SDK_NOTE_SEMVER_UK =
  "Semver — всі SDK дотримуються семантичного версіонування; несумісні зміни API ініціюють збільшення мажорної версії та анонсуються за 30 днів через changelog та email-список розробників.";

export const SDK_GENERATION_NOTES_EN = [
  SDK_NOTE_GENERATOR_EN,
  SDK_NOTE_AUTOPUBLISH_EN,
  SDK_NOTE_SEMVER_EN,
];
export const SDK_GENERATION_NOTES_UK = [
  SDK_NOTE_GENERATOR_UK,
  SDK_NOTE_AUTOPUBLISH_UK,
  SDK_NOTE_SEMVER_UK,
];

// ── Helper ────────────────────────────────────────────────────────────────────

/** Look up SDK config by language. */
export function getSdkConfig(language: SdkLanguage): SdkConfig | undefined {
  return SDK_CONFIGS.find((c) => c.language === language);
}
