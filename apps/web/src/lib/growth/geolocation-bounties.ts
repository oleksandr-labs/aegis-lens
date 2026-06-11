/**
 * Geolocation Bounties — reward system for high-quality OSINT geolocations.
 *
 * Contributors earn USD-equivalent credits for successful geolocation tasks.
 * Difficulty tiers: easy ($5) → medium ($25) → hard ($100) → critical ($500).
 *
 * Система бонусів за якісні геолокації: easy/medium/hard/critical.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * USD-equivalent reward per bounty difficulty tier.
 *
 * Нагорода (USD-еквівалент) за рівнем складності завдання.
 */
export const GEO_BOUNTY_REWARDS: Record<
  "easy" | "medium" | "hard" | "critical",
  number
> = {
  easy: 5,
  medium: 25,
  hard: 100,
  critical: 500,
};

export type GeoBountyDifficulty = keyof typeof GEO_BOUNTY_REWARDS;

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface GeoBountyTask {
  /** Unique bounty task ID. / Унікальний ID завдання. */
  id: string;
  /** Associated event or scene ID. / ID пов'язаної події або сцени. */
  eventId: string;
  /** Task title (one-liner). / Назва завдання. */
  title: string;
  /** Difficulty classification. / Рівень складності. */
  difficulty: GeoBountyDifficulty;
  /** USD-equivalent reward for this task. / Нагорода в USD-еквіваленті. */
  reward: number;
  /** Task status. / Статус завдання. */
  status: "open" | "claimed" | "under-review" | "approved" | "rejected";
  /** User ID who claimed the task (if any). / ID користувача, що взяв завдання. */
  claimedBy?: string;
  /** ISO-8601 claim timestamp. / Час взяття завдання. */
  claimedAt?: string;
  /** ISO-8601 resolution timestamp. / Час розв'язання завдання. */
  resolvedAt?: string;
  /** Approver notes. / Примітки ревізора. */
  reviewNotes?: string;
  /** Bounding box hint for the geolocation area [minLng, minLat, maxLng, maxLat]. */
  hintBbox?: [number, number, number, number];
}

// ── GeoBountyStore ────────────────────────────────────────────────────────────

export class GeoBountyStore {
  private readonly tasks = new Map<string, GeoBountyTask>();

  /**
   * Add or update a bounty task.
   *
   * Додає або оновлює завдання.
   */
  upsert(task: GeoBountyTask): void {
    this.tasks.set(task.id, {
      ...task,
      reward: GEO_BOUNTY_REWARDS[task.difficulty],
    });
  }

  /**
   * Retrieve a task by ID.
   *
   * Повертає завдання за ID.
   */
  get(id: string): GeoBountyTask | undefined {
    return this.tasks.get(id);
  }

  /**
   * List tasks filtered by status and optional difficulty.
   *
   * Повертає завдання за статусом і рівнем складності.
   */
  list(
    status?: GeoBountyTask["status"],
    difficulty?: GeoBountyDifficulty,
  ): GeoBountyTask[] {
    return Array.from(this.tasks.values()).filter((t) => {
      if (status && t.status !== status) return false;
      if (difficulty && t.difficulty !== difficulty) return false;
      return true;
    });
  }

  /**
   * Claim a task for a user. Returns false if already claimed.
   *
   * Призначає завдання користувачеві. Повертає false, якщо вже зайняте.
   */
  claim(taskId: string, userId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== "open") return false;
    this.tasks.set(taskId, {
      ...task,
      status: "claimed",
      claimedBy: userId,
      claimedAt: new Date().toISOString(),
    });
    return true;
  }

  /**
   * Approve a claimed task and mark reward as payable.
   *
   * Підтверджує завдання та позначає нагороду до виплати.
   */
  approve(taskId: string, reviewNotes?: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== "under-review") return false;
    this.tasks.set(taskId, {
      ...task,
      status: "approved",
      resolvedAt: new Date().toISOString(),
      reviewNotes,
    });
    return true;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global geolocation bounty store. */
export const geoBountyStore = new GeoBountyStore();
