'use server';
/**
 * Dashboard save/load — in-memory store for named dashboard layouts.
 * Збереження/завантаження дашборду — сховище іменованих макетів дашборду у пам'яті.
 *
 * NOTE (EN): Auto-save — callers should debounce saves; the store does not throttle.
 * NOTE (UK): Автозбереження — виклики слід дебаунсувати; сховище не обмежує частоту.
 *
 * NOTE (EN): Max 5 layouts per user — enforce via save(); the 6th call returns an error.
 * NOTE (UK): Максимум 5 макетів на користувача — застосовується через save(); 6-й виклик повертає помилку.
 *
 * NOTE (EN): Org default — set isDefault=true on one layout; the store enforces single-default per org.
 * NOTE (UK): Типовий макет організації — встановіть isDefault=true; сховище забезпечує один типовий макет для організації.
 */

// ---------------------------------------------------------------------------
// DashboardLayout
// ---------------------------------------------------------------------------

export interface DashboardLayout {
  layoutId: string;
  userId: string;
  orgId: string;
  name: string;
  nameUk: string;
  widgets: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// SavedDashboardStore
// ---------------------------------------------------------------------------

const MAX_LAYOUTS_PER_USER = 5;

/**
 * In-memory store for saved dashboard layouts keyed by layoutId.
 * Сховище збережених макетів дашборду у пам'яті, індексованих за layoutId.
 */
export class SavedDashboardStore {
  private readonly store = new Map<string, DashboardLayout>();

  /**
   * Save or update a dashboard layout.
   * Returns an error string if the per-user limit would be exceeded.
   *
   * Зберігає або оновлює макет дашборду.
   * Повертає рядок помилки, якщо перевищено ліміт на користувача.
   */
  save(layout: DashboardLayout): { ok: true } | { ok: false; error: string } {
    const isUpdate = this.store.has(layout.layoutId);
    if (!isUpdate) {
      const userCount = this.countForUser(layout.userId);
      if (userCount >= MAX_LAYOUTS_PER_USER) {
        return {
          ok: false,
          error: `Maximum ${MAX_LAYOUTS_PER_USER} saved layouts per user. Delete one before saving another.`,
        };
      }
    }

    // Enforce single org default
    if (layout.isDefault) {
      for (const existing of this.store.values()) {
        if (existing.orgId === layout.orgId && existing.layoutId !== layout.layoutId) {
          this.store.set(existing.layoutId, { ...existing, isDefault: false });
        }
      }
    }

    this.store.set(layout.layoutId, {
      ...layout,
      updatedAt: new Date().toISOString(),
    });

    return { ok: true };
  }

  /**
   * Get a layout by id. / Повертає макет за ідентифікатором.
   */
  get(layoutId: string): DashboardLayout | undefined {
    return this.store.get(layoutId);
  }

  /**
   * List all layouts for a user. / Повертає всі макети для користувача.
   */
  list(userId: string): DashboardLayout[] {
    return Array.from(this.store.values())
      .filter((l) => l.userId === userId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  /**
   * Delete a layout. / Видаляє макет.
   */
  delete(layoutId: string): boolean {
    return this.store.delete(layoutId);
  }

  private countForUser(userId: string): number {
    let count = 0;
    for (const l of this.store.values()) {
      if (l.userId === userId) count++;
    }
    return count;
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

/** Global saved dashboard store singleton. */
export const savedDashboardStore = new SavedDashboardStore();
