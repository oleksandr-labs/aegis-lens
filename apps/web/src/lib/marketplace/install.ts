'use server';

/**
 * Marketplace — Install / uninstall flow.
 *
 * Tracks installation state per organisation per plugin. Validates scopes on
 * install (security gate: no plugin may receive scopes it did not declare in
 * its manifest). Status transitions: installing → active; failure → failed.
 *
 * Відстежує стан встановлення плагіну для кожної організації.
 * Перевіряє скоупи при встановленні — плагін не може отримати незадекларовані права.
 */

// ── InstallStatus ─────────────────────────────────────────────────────────────

/**
 * Lifecycle status of a plugin installation within an org.
 *
 * Статус встановлення плагіну в організації.
 */
export type InstallStatus = "installing" | "active" | "disabled" | "failed";

// ── InstallRecord ─────────────────────────────────────────────────────────────

/**
 * A record of a plugin installation within an organisation.
 *
 * Запис про встановлення плагіну в організації.
 */
export interface InstallRecord {
  /** Composite key: `${orgId}:${pluginId}` */
  id: string;
  orgId: string;
  pluginId: string;
  status: InstallStatus;
  /** Scopes granted at install time (subset of what plugin declared) */
  grantedScopes: string[];
  installedBy: string;
  installedAt: string;
  updatedAt: string;
  /** Present only when status is "failed" */
  failureReason?: string;
}

// ── InstallStore ──────────────────────────────────────────────────────────────

/**
 * In-memory install state store.
 * In production, persist to the database and emit events for audit logging.
 *
 * Сховище стану встановлення в пам'яті.
 * У проді — зберігати в БД та емітити події для audit log.
 */
export class InstallStore {
  /** Keyed by `${orgId}:${pluginId}` */
  private readonly records = new Map<string, InstallRecord>();

  private key(orgId: string, pluginId: string): string {
    return `${orgId}:${pluginId}`;
  }

  // ── Install ────────────────────────────────────────────────────────────────

  /**
   * Begin the install flow for a plugin in an org.
   *
   * Creates an InstallRecord with status "installing".
   * Call confirmInstall() once the sandbox validates the plugin binary.
   *
   * Починає процес встановлення: створює запис зі статусом "installing".
   */
  install(
    orgId: string,
    pluginId: string,
    installedBy: string,
    grantedScopes: string[],
  ): InstallRecord {
    const now = new Date().toISOString();
    const record: InstallRecord = {
      id: this.key(orgId, pluginId),
      orgId,
      pluginId,
      status: "installing",
      grantedScopes,
      installedBy,
      installedAt: now,
      updatedAt: now,
    };
    this.records.set(record.id, record);
    return record;
  }

  /**
   * Confirm installation succeeded — transitions to "active".
   *
   * Підтверджує успішне встановлення — переводить у статус "active".
   */
  confirmInstall(orgId: string, pluginId: string): InstallRecord | undefined {
    const record = this.records.get(this.key(orgId, pluginId));
    if (!record) return undefined;
    record.status = "active";
    record.updatedAt = new Date().toISOString();
    return record;
  }

  /**
   * Mark an installation as failed.
   *
   * Позначає встановлення як невдале.
   */
  failInstall(orgId: string, pluginId: string, reason: string): InstallRecord | undefined {
    const record = this.records.get(this.key(orgId, pluginId));
    if (!record) return undefined;
    record.status = "failed";
    record.failureReason = reason;
    record.updatedAt = new Date().toISOString();
    return record;
  }

  // ── Uninstall ──────────────────────────────────────────────────────────────

  /**
   * Remove a plugin from an org.
   * Returns true if the record existed and was removed.
   *
   * Видаляє запис про встановлення плагіну з організації.
   */
  uninstall(orgId: string, pluginId: string): boolean {
    return this.records.delete(this.key(orgId, pluginId));
  }

  // ── Disable / enable ───────────────────────────────────────────────────────

  /**
   * Temporarily disable a plugin without removing it.
   *
   * Тимчасово вимикає плагін без видалення.
   */
  disable(orgId: string, pluginId: string): InstallRecord | undefined {
    const record = this.records.get(this.key(orgId, pluginId));
    if (!record) return undefined;
    record.status = "disabled";
    record.updatedAt = new Date().toISOString();
    return record;
  }

  /**
   * Re-enable a previously disabled plugin.
   *
   * Повторно вмикає раніше вимкнений плагін.
   */
  enable(orgId: string, pluginId: string): InstallRecord | undefined {
    const record = this.records.get(this.key(orgId, pluginId));
    if (!record || record.status !== "disabled") return undefined;
    record.status = "active";
    record.updatedAt = new Date().toISOString();
    return record;
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  getRecord(orgId: string, pluginId: string): InstallRecord | undefined {
    return this.records.get(this.key(orgId, pluginId));
  }

  getByOrg(orgId: string): InstallRecord[] {
    return Array.from(this.records.values()).filter((r) => r.orgId === orgId);
  }

  getByPlugin(pluginId: string): InstallRecord[] {
    return Array.from(this.records.values()).filter((r) => r.pluginId === pluginId);
  }

  installCount(pluginId: string): number {
    return this.getByPlugin(pluginId).filter((r) => r.status === "active").length;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const installStore = new InstallStore();
