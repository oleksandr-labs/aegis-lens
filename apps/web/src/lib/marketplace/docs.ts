/**
 * Marketplace — Per-plugin docs and changelog.
 *
 * Each plugin may declare a docs site URL and a changelog feed.
 * The DocsStore serves as the single source of truth for both.
 * Changelog entries follow a semantic versioning convention and are ordered
 * newest-first.
 *
 * Документація та changelog для кожного плагіну.
 * DocsStore — єдине джерело правди; changelog відсортовано від нового до старого.
 */

// ── PluginDocsConfig ──────────────────────────────────────────────────────────

/**
 * Documentation configuration registered by a plugin author.
 *
 * Конфігурація документації, зареєстрована автором плагіну.
 */
export interface PluginDocsConfig {
  pluginId: string;
  /**
   * Public docs URL. May be an external hosted site (e.g. GitBook, Docusaurus)
   * or a path under aegislens.com/marketplace/docs.
   */
  docsUrl: string;
  /**
   * Optional link to an in-marketplace quick-start guide.
   * Shown as a primary CTA on the listing page.
   *
   * Посилання на вбудований гайд у маркетплейсі.
   */
  quickStartUrl?: string;
  /**
   * OpenAPI / AsyncAPI spec URL for plugins that expose an HTTP callback endpoint.
   *
   * URL специфікації OpenAPI/AsyncAPI для плагінів із HTTP-ендпоінтами.
   */
  apiSpecUrl?: string;
  /** ISO 8601 timestamp of last docs update */
  docsUpdatedAt: string;
}

// ── PluginChangelogEntry ──────────────────────────────────────────────────────

/**
 * A single entry in a plugin's changelog.
 *
 * Один запис у changelog плагіну.
 */
export interface PluginChangelogEntry {
  pluginId: string;
  /** Semver version string this entry describes */
  version: string;
  /** ISO 8601 release date */
  releasedAt: string;
  /** Release notes — English (Markdown supported) */
  notes_en: string;
  /** Release notes — Ukrainian */
  notes_uk: string;
  /**
   * Type of change — used to colour-code the badge on the listing page.
   *
   * Тип змін — для кольорового маркування на сторінці плагіну.
   */
  changeType: "major" | "minor" | "patch" | "security" | "deprecation";
}

// ── DocsStore ─────────────────────────────────────────────────────────────────

/**
 * In-memory store for plugin documentation configs and changelogs.
 *
 * Сховище конфігурацій документації та changelog у пам'яті.
 */
export class DocsStore {
  private readonly configs = new Map<string, PluginDocsConfig>();
  /** pluginId → changelog entries ordered newest-first */
  private readonly changelogs = new Map<string, PluginChangelogEntry[]>();

  // ── Docs config ────────────────────────────────────────────────────────────

  registerDocs(config: PluginDocsConfig): void {
    this.configs.set(config.pluginId, config);
  }

  getDocsConfig(pluginId: string): PluginDocsConfig | undefined {
    return this.configs.get(pluginId);
  }

  /**
   * Return the canonical docs URL for a plugin.
   * Falls back to the marketplace listing URL if no docs are registered.
   *
   * Повертає URL документації або запасний URL маркетплейс-сторінки.
   */
  getDocsUrl(pluginId: string): string {
    return (
      this.configs.get(pluginId)?.docsUrl ??
      `https://aegislens.com/marketplace/plugins/${pluginId}`
    );
  }

  // ── Changelog ──────────────────────────────────────────────────────────────

  /**
   * Publish a new changelog entry for a plugin.
   * Entries are kept sorted newest-first by releasedAt.
   *
   * Додає новий запис до changelog плагіну; список відсортовано від нового до старого.
   */
  publishChangelog(entry: PluginChangelogEntry): void {
    const list = this.changelogs.get(entry.pluginId) ?? [];
    list.push(entry);
    list.sort((a, b) => b.releasedAt.localeCompare(a.releasedAt));
    this.changelogs.set(entry.pluginId, list);
  }

  /**
   * Get the full changelog for a plugin, newest-first.
   *
   * Повертає повний changelog плагіну, від нового до старого.
   */
  getChangelog(pluginId: string): PluginChangelogEntry[] {
    return this.changelogs.get(pluginId) ?? [];
  }

  /**
   * Get changelog entries for a specific release.
   *
   * Повертає записи changelog для конкретного релізу.
   */
  getChangelogForVersion(pluginId: string, version: string): PluginChangelogEntry | undefined {
    return this.changelogs.get(pluginId)?.find((e) => e.version === version);
  }

  /** Number of changelog entries for a plugin. */
  changelogCount(pluginId: string): number {
    return this.changelogs.get(pluginId)?.length ?? 0;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const docsStore = new DocsStore();

// ── Convenience exports ───────────────────────────────────────────────────────

export function getDocsUrl(pluginId: string): string {
  return docsStore.getDocsUrl(pluginId);
}

export function getChangelog(pluginId: string): PluginChangelogEntry[] {
  return docsStore.getChangelog(pluginId);
}
