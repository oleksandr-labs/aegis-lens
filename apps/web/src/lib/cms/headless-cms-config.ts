/**
 * Headless CMS decision record and configuration for the blog / content layer.
 * CHOSEN: Keystatic — file-based, git-native, no external service required.
 *
 * Рішення щодо headless CMS та конфігурація для блогу / контентного шару.
 * ВИБІР: Keystatic — файловий, git-native, не потребує зовнішнього сервісу.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CmsProvider =
  | "keystatic"
  | "payload"
  | "sanity"
  | "contentlayer"
  | "none";

export interface CmsConfig {
  provider: CmsProvider;
  /** Path to the CMS config file (file-based CMSes) */
  repoPath?: string;
  /** Remote API base URL (API-based CMSes) */
  apiUrl?: string;
  /** Project/dataset identifier (Sanity etc.) */
  projectId?: string;
  /** Content type slugs managed by this CMS */
  contentTypes: string[];
}

// ---------------------------------------------------------------------------
// Decision
// ---------------------------------------------------------------------------

/**
 * Chosen CMS provider.
 * Rationale: Keystatic is file-based and git-native — content lives in the repo
 * as MDX files, no external database or API key required, free for self-hosted use,
 * and has first-class Next.js App Router support.
 *
 * Вибраний постачальник CMS.
 * Обґрунтування: Keystatic — файловий і git-native: контент зберігається у репозиторії
 * як MDX-файли, не потребує зовнішньої БД або API-ключа, безкоштовний для self-hosted,
 * має першокласну підтримку Next.js App Router.
 */
export const CHOSEN_CMS: CmsProvider = "keystatic";

export const KEYSTATIC_CONFIG: CmsConfig = {
  provider: "keystatic",
  repoPath: "./keystatic.config.ts",
  contentTypes: ["blog", "investigations", "glossary", "guides"],
};

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const CMS_DECISION_NOTES_EN: string[] = [
  "keystatic-chosen-git-native: Keystatic was selected because content is stored as MDX files inside the repo — no external service, no API key, no database, works offline, full git history for every post.",
  "mdx-support: Keystatic has first-class MDX support; custom components (map snapshots, event badges, callouts) are registered in keystatic.config.ts and resolved at build time by @keystatic/next.",
  "no-external-service: unlike Sanity or Contentful, Keystatic requires zero SaaS subscription; editorial UI is served as a Next.js route (/keystatic) and can be password-protected or disabled in production.",
  "payload-cms-alternative-if-db-needed: if a PostgreSQL-backed CMS becomes necessary (e.g. for multi-tenant content or workflow approvals), migrate to Payload CMS v3 which ships its own Postgres adapter and Next.js plugin.",
];

export const CMS_DECISION_NOTES_UK: string[] = [
  "keystatic-chosen-git-native: Keystatic обрано тому, що контент зберігається як MDX-файли в репозиторії — немає зовнішнього сервісу, API-ключа, БД, працює офлайн, повна git-історія кожного поста.",
  "mdx-support: Keystatic має першокласну підтримку MDX; кастомні компоненти (знімки карти, бейджі подій, callout-и) реєструються в keystatic.config.ts і резолвяться під час збірки через @keystatic/next.",
  "no-external-service: на відміну від Sanity або Contentful, Keystatic не потребує SaaS-підписки; редакторський UI розгортається як Next.js-маршрут (/keystatic) і може бути захищений паролем або вимкнений у продакшні.",
  "payload-cms-alternative-if-db-needed: якщо знадобиться PostgreSQL-backed CMS (напр. для мультитенантного контенту або workflow-апрувів), мігрувати на Payload CMS v3 з рідним Postgres-адаптером і Next.js-плагіном.",
];
