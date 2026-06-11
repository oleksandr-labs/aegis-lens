/**
 * Dashboard sharing — org-scoped and public read-only share links.
 * Спільний доступ до дашборду — посилання з доступом в межах організації та публічні посилання лише для читання.
 *
 * NOTE (EN): Signed link — tokens are deterministic hashes of layoutId+permission; rotate signing key in production.
 * NOTE (UK): Підписане посилання — токени є детермінованими хешами layoutId+permission; ротуйте ключ підпису у продакшні.
 *
 * NOTE (EN): Public read-only — isPublic:true allows unauthenticated access with no org membership check.
 * NOTE (UK): Публічне лише для читання — isPublic:true дозволяє неавтентифікований доступ без перевірки членства в організації.
 *
 * NOTE (EN): HMAC signing — buildSignedShareToken uses a simple deterministic hash; replace with crypto.createHmac in production.
 * NOTE (UK): HMAC-підпис — buildSignedShareToken використовує простий детермінований хеш; у продакшні замінити crypto.createHmac.
 *
 * NOTE (EN): Expiry — expiresAt is an ISO string; callers must check expiry before granting access.
 * NOTE (UK): Термін дії — expiresAt є ISO-рядком; виклики мають перевіряти термін перед наданням доступу.
 */

// ---------------------------------------------------------------------------
// DashboardShare
// ---------------------------------------------------------------------------

export interface DashboardShare {
  shareId: string;
  layoutId: string;
  sharedById: string;
  sharedWithOrgId?: string;
  permission: "view" | "edit";
  signedToken: string;
  expiresAt?: string;
  isPublic: boolean;
}

// ---------------------------------------------------------------------------
// buildSignedShareToken
// ---------------------------------------------------------------------------

/**
 * Build a deterministic signed token for a share link.
 * In production, replace with HMAC-SHA256 using a server-side secret.
 *
 * Будує детермінований підписаний токен для посилання спільного доступу.
 * У продакшні замінити HMAC-SHA256 з серверним секретом.
 */
export function buildSignedShareToken(layoutId: string, permission: string): string {
  // Deterministic hash: no Date.now() — stable per layoutId+permission
  // Production: use crypto.createHmac('sha256', process.env.SHARE_SECRET).update(`${layoutId}:${permission}`).digest('hex')
  const raw = `${layoutId}:${permission}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit int
  }
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  return `shr_${hex}_${layoutId.replace(/[^a-z0-9]/gi, "").slice(0, 12)}`;
}

// ---------------------------------------------------------------------------
// DashboardShareStore
// ---------------------------------------------------------------------------

/**
 * In-memory store for dashboard share records.
 * Сховище записів спільного доступу до дашбордів у пам'яті.
 */
export class DashboardShareStore {
  private readonly store = new Map<string, DashboardShare>();

  /**
   * Create a new share. / Створює новий запис спільного доступу.
   */
  create(share: DashboardShare): DashboardShare {
    this.store.set(share.shareId, share);
    return share;
  }

  /**
   * Get a share by id. / Повертає запис за ідентифікатором.
   */
  get(shareId: string): DashboardShare | undefined {
    return this.store.get(shareId);
  }

  /**
   * Revoke (delete) a share. / Відкликає (видаляє) спільний доступ.
   */
  revoke(shareId: string): boolean {
    return this.store.delete(shareId);
  }

  /**
   * List all shares for a layout. / Повертає всі записи спільного доступу для макету.
   */
  listForLayout(layoutId: string): DashboardShare[] {
    return Array.from(this.store.values()).filter((s) => s.layoutId === layoutId);
  }

  /**
   * Look up a share by signed token (for public link resolution).
   * Знаходить запис за підписаним токеном (для відображення публічного посилання).
   */
  getByToken(signedToken: string): DashboardShare | undefined {
    for (const share of this.store.values()) {
      if (share.signedToken === signedToken) return share;
    }
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

/** Global dashboard share store singleton. */
export const dashboardShareStore = new DashboardShareStore();
