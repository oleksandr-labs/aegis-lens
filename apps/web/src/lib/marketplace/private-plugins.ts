/**
 * Marketplace — Org-internal private plugins.
 *
 * Private plugins are developed and installed exclusively within a single
 * organisation. They are never listed in the public marketplace and cannot be
 * discovered or installed by other orgs.
 *
 * Приватні плагіни розробляються та встановлюються виключно в рамках однієї
 * організації. Вони не публікуються в публічному маркетплейсі та недоступні
 * іншим організаціям.
 */

import type { PluginManifest } from "../../../../packages/plugin-sdk/src/types";

// ── Notes ─────────────────────────────────────────────────────────────────────

/**
 * Policy note — English.
 * Private plugins are org-scoped: no marketplace listing, no external discovery,
 * install restricted to the owning org only.
 */
export const PRIVATE_PLUGIN_NOTE_EN =
  "Private plugins are org-internal only. They do not appear in the public " +
  "marketplace and cannot be installed by any organisation other than the one " +
  "that registered them." as const;

/**
 * Policy note — Ukrainian.
 * Приватні плагіни — виключно для внутрішнього використання організацією.
 * Не публікуються в маркетплейсі, недоступні стороннім організаціям.
 */
export const PRIVATE_PLUGIN_NOTE_UK =
  "Приватні плагіни призначені виключно для внутрішнього використання в організації. " +
  "Вони не відображаються в публічному маркетплейсі та недоступні для встановлення " +
  "будь-якою іншою організацією." as const;

// ── PrivatePlugin ─────────────────────────────────────────────────────────────

/**
 * A private plugin registered by and for a single organisation.
 *
 * Приватний плагін, зареєстрований і доступний лише для однієї організації.
 */
export interface PrivatePlugin {
  /** Unique identifier within the org namespace */
  id: string;
  /** The org that owns and may install this plugin */
  ownerOrgId: string;
  /** Plugin manifest — must have `private: true` */
  manifest: PluginManifest;
  /** ISO 8601 */
  registeredAt: string;
  /** Whether the plugin is currently enabled for the owner org */
  isEnabled: boolean;
  /**
   * Arbitrary metadata set by the org admin.
   * Useful for internal documentation or cost-centre tagging.
   *
   * Довільні метадані від адміна організації (для внутрішньої документації).
   */
  meta?: Record<string, string>;
}

// ── PrivatePluginStore ────────────────────────────────────────────────────────

/**
 * In-memory registry of org-internal private plugins.
 * Enforces that no private plugin leaks to another org.
 *
 * Реєстр приватних плагінів в пам'яті.
 * Забезпечує ізоляцію: жоден приватний плагін не доступний іншим організаціям.
 */
export class PrivatePluginStore {
  /** Keyed by `${ownerOrgId}:${pluginId}` */
  private readonly plugins = new Map<string, PrivatePlugin>();

  private key(ownerOrgId: string, pluginId: string): string {
    return `${ownerOrgId}:${pluginId}`;
  }

  // ── Register ───────────────────────────────────────────────────────────────

  /**
   * Register a new private plugin for an org.
   * Throws if the manifest does not have `private: true`.
   *
   * Реєструє новий приватний плагін для організації.
   * Кидає помилку, якщо маніфест не має `private: true`.
   */
  register(plugin: PrivatePlugin): void {
    if (!plugin.manifest.private) {
      throw new Error(
        `[private-plugins] Plugin "${plugin.manifest.id}" must have \`private: true\` ` +
          `in its manifest to be registered as a private plugin.`,
      );
    }
    if (plugin.manifest.id !== plugin.id) {
      throw new Error(
        `[private-plugins] plugin.id ("${plugin.id}") must match manifest.id ("${plugin.manifest.id}").`,
      );
    }
    this.plugins.set(this.key(plugin.ownerOrgId, plugin.id), plugin);
  }

  // ── Retrieve ───────────────────────────────────────────────────────────────

  /**
   * Get a private plugin — only accessible to the owning org.
   * Returns undefined if the plugin does not exist OR if the requesting org
   * is not the owner (access-denied is indistinguishable from not-found).
   *
   * Повертає приватний плагін лише для організації-власника.
   * Якщо orgId не є власником — повертає undefined (не видно різниці з відсутністю).
   */
  get(ownerOrgId: string, pluginId: string): PrivatePlugin | undefined {
    return this.plugins.get(this.key(ownerOrgId, pluginId));
  }

  /**
   * List all private plugins for an org.
   *
   * Повертає всі приватні плагіни організації.
   */
  listByOrg(orgId: string): PrivatePlugin[] {
    return Array.from(this.plugins.values()).filter((p) => p.ownerOrgId === orgId);
  }

  // ── Enable / disable ───────────────────────────────────────────────────────

  setEnabled(ownerOrgId: string, pluginId: string, enabled: boolean): boolean {
    const plugin = this.plugins.get(this.key(ownerOrgId, pluginId));
    if (!plugin) return false;
    plugin.isEnabled = enabled;
    return true;
  }

  // ── Remove ─────────────────────────────────────────────────────────────────

  /** Deregister a private plugin from an org. */
  remove(ownerOrgId: string, pluginId: string): boolean {
    return this.plugins.delete(this.key(ownerOrgId, pluginId));
  }

  /** Total registered private plugins across all orgs (for diagnostics). */
  totalCount(): number {
    return this.plugins.size;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const privatePluginStore = new PrivatePluginStore();
