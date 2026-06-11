/**
 * Git Backend — configuration for Keystatic's git-backed content storage.
 * Content lives on the `content` branch; commits are authored by the CMS user.
 *
 * Git Backend — конфігурація git-сховища контенту для Keystatic.
 * Контент зберігається у гілці `content`; коміти авторяться від імені CMS-користувача.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

export const GIT_BACKEND_PROVIDER = "github" as const;
export type GitBackendProvider = typeof GIT_BACKEND_PROVIDER;

/**
 * Branch that holds all CMS-managed content files.
 *
 * Гілка, у якій зберігаються всі файли контенту, керовані CMS.
 */
export const CONTENT_BRANCH = "content" as const;

// ── Notes ─────────────────────────────────────────────────────────────────────

export const GIT_BACKEND_NOTE_EN =
  "All editorial content is stored as MDX/JSON files on the `content` branch of the GitHub " +
  "repository. Keystatic uses the GitHub API (or local-mode for development) to read/write " +
  "files. On merge to `main`, the Next.js build picks up the new content automatically.";

export const GIT_BACKEND_NOTE_UK =
  "Весь редакторський контент зберігається як MDX/JSON-файли у гілці `content` репозиторію " +
  "GitHub. Keystatic використовує GitHub API (або локальний режим для розробки) для читання/запису " +
  "файлів. Після злиття в `main` збірка Next.js автоматично підхоплює новий контент.";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GitBackendConfig {
  /** Hosting provider for the git repository. / Хостинг-провайдер git-репозиторію. */
  provider: GitBackendProvider;
  /** GitHub owner/org (e.g. "aegis-lens"). / Власник/орг GitHub. */
  owner: string;
  /** Repository name. / Назва репозиторію. */
  repo: string;
  /** Branch where CMS content is written. / Гілка для запису контенту. */
  contentBranch: string;
  /** Base path inside the repo for content files. / Базовий шлях усередині репозиторію. */
  contentBasePath: string;
  /** Whether to use GitHub API mode (true) or local filesystem mode (false). */
  useGitHubApi: boolean;
  /** GitHub App installation ID (required for GitHub API mode). */
  githubAppInstallationId?: number;
}

// ── Builder ───────────────────────────────────────────────────────────────────

/**
 * Build a GitBackendConfig from environment variables.
 * Falls back to local filesystem mode when GITHUB_TOKEN is absent.
 *
 * Будує GitBackendConfig з env-змінних.
 * Використовує локальний режим, якщо GITHUB_TOKEN відсутній.
 */
export function buildGitBackendConfig(): GitBackendConfig {
  const owner =
    process.env["GITHUB_REPO_OWNER"] ?? "aegis-lens";
  const repo =
    process.env["GITHUB_REPO_NAME"] ?? "ukrainian-map";
  const useGitHubApi = Boolean(process.env["GITHUB_TOKEN"]);
  const installationIdRaw = process.env["GITHUB_APP_INSTALLATION_ID"];

  return {
    provider: GIT_BACKEND_PROVIDER,
    owner,
    repo,
    contentBranch: CONTENT_BRANCH,
    contentBasePath: "content",
    useGitHubApi,
    githubAppInstallationId: installationIdRaw
      ? Number(installationIdRaw)
      : undefined,
  };
}
