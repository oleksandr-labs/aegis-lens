/**
 * Bounty board — high-impact review tasks with credit rewards.
 * Дошка нагород — важливі завдання перевірки з кредитними винагородами.
 *
 * Analysts and contributors can claim bounty tasks. Rewards are credited
 * to their platform wallet on successful completion.
 *
 * Аналітики та учасники можуть брати завдання з нагородами.
 * Винагороди зараховуються до кредитного гаманця після успішного виконання.
 */

import type { ContributorTier } from "./verified-contributor";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Credit reward amounts by difficulty level. */
export const BOUNTY_REWARD_TABLE: Record<"easy" | "medium" | "hard", number> = {
  easy:   5,
  medium: 25,
  hard:   100,
};

/** Max claims per user per rolling 24-hour window (anti-gaming). */
const MAX_CLAIMS_PER_DAY = 10;

// ── Types ─────────────────────────────────────────────────────────────────────

export type BountyTaskType = "classify" | "geolocate" | "verify-media";
export type BountyDifficulty = "easy" | "medium" | "hard";
export type BountyStatus = "open" | "claimed" | "completed" | "expired";

export interface BountyTask {
  bountyId: string;
  taskType: BountyTaskType;
  /** The canonical event this bounty is attached to */
  eventId: string;
  rewardCredits: number;
  difficulty: BountyDifficulty;
  /** UserId of the contributor who claimed it; undefined when open */
  claimedBy?: string;
  /** ISO timestamp of completion */
  completedAt?: string;
  status: BountyStatus;
  /** ISO timestamp of when the bounty was posted */
  postedAt: string;
  /** ISO timestamp of expiry (auto-expire after 7 days if unclaimed) */
  expiresAt: string;
}

// ── Board ─────────────────────────────────────────────────────────────────────

/**
 * In-memory bounty board.
 * In production, persist to a `bounty_tasks` DB table.
 * Credit disbursement must call walletStore.addTransaction() on complete().
 *
 * Дошка нагород у пам'яті.
 * У продакшені зберігати в таблиці `bounty_tasks`.
 * Нарахування кредитів має викликати walletStore.addTransaction() при complete().
 */
export class BountyBoard {
  private readonly tasks = new Map<string, BountyTask>();
  private seq = 0;
  /** Claim timestamps per userId for rate-limiting (rolling 24h). */
  private readonly claimLog = new Map<string, number[]>();

  /**
   * Post a new bounty task.
   * Auto-sets rewardCredits from BOUNTY_REWARD_TABLE and expiresAt to +7 days.
   *
   * Публікація нового завдання з нагородою.
   */
  post(task: Omit<BountyTask, "bountyId" | "status" | "postedAt" | "expiresAt" | "rewardCredits">): BountyTask {
    const bountyId = `bnty-${++this.seq}-${Date.now()}`;
    const now = new Date();
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const posted: BountyTask = {
      ...task,
      bountyId,
      rewardCredits: BOUNTY_REWARD_TABLE[task.difficulty],
      status: "open",
      postedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };
    this.tasks.set(bountyId, posted);
    return posted;
  }

  /**
   * Claim a bounty task for a contributor.
   * Enforces rate limit (MAX_CLAIMS_PER_DAY) and checks task is still open.
   * Returns the updated task, or throws if the claim is not allowed.
   *
   * Взяття завдання учасником.
   * Перевіряє ліміт заявок (MAX_CLAIMS_PER_DAY) та статус завдання.
   */
  claim(bountyId: string, userId: string): BountyTask {
    const task = this._require(bountyId);

    if (task.status !== "open") {
      throw new Error(`Bounty ${bountyId} is not open (status: ${task.status})`);
    }

    // Expire stale tasks
    if (new Date(task.expiresAt) < new Date()) {
      task.status = "expired";
      throw new Error(`Bounty ${bountyId} has expired`);
    }

    // Rate limit check
    const now = Date.now();
    const log = (this.claimLog.get(userId) ?? []).filter(
      (ts) => now - ts < 24 * 60 * 60 * 1000,
    );
    if (log.length >= MAX_CLAIMS_PER_DAY) {
      throw new Error(`User ${userId} has reached the daily claim limit (${MAX_CLAIMS_PER_DAY})`);
    }
    log.push(now);
    this.claimLog.set(userId, log);

    task.claimedBy = userId;
    task.status = "claimed";
    return task;
  }

  /**
   * Mark a claimed bounty as completed with the reviewer's verdict.
   * In production, also call walletStore.addTransaction() to credit the reward.
   *
   * Позначення взятого завдання як виконаного.
   * У продакшені також викликати walletStore.addTransaction().
   */
  complete(bountyId: string, verdict: string): BountyTask {
    const task = this._require(bountyId);
    if (task.status !== "claimed") {
      throw new Error(`Bounty ${bountyId} is not in 'claimed' state`);
    }
    void verdict; // TODO: store verdict and trigger walletStore credit in production
    task.status = "completed";
    task.completedAt = new Date().toISOString();
    return task;
  }

  /**
   * List open bounty tasks, optionally filtered by the minimum tier
   * required to access the task type.
   *
   * Перелік відкритих завдань з нагородами, опціонально фільтрованих за рівнем.
   */
  listOpen(tier?: ContributorTier): BountyTask[] {
    this._expireStale();
    let tasks = [...this.tasks.values()].filter((t) => t.status === "open");

    if (tier) {
      const allowed = _taskTypesForTier(tier);
      tasks = tasks.filter((t) => allowed.includes(t.taskType));
    }

    // Sort by reward descending (highest value first)
    tasks.sort((a, b) => b.rewardCredits - a.rewardCredits);
    return tasks;
  }

  /** Retrieve a single bounty task. */
  get(bountyId: string): BountyTask | undefined {
    return this.tasks.get(bountyId);
  }

  private _require(bountyId: string): BountyTask {
    const t = this.tasks.get(bountyId);
    if (!t) throw new Error(`BountyTask not found: ${bountyId}`);
    return t;
  }

  private _expireStale(): void {
    const now = new Date();
    for (const task of this.tasks.values()) {
      if (task.status === "open" && new Date(task.expiresAt) < now) {
        task.status = "expired";
      }
    }
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global bounty board singleton. */
export const bountyBoard = new BountyBoard();

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Map contributor tier to accessible task types (mirrors verified-contributor.ts). */
function _taskTypesForTier(tier: ContributorTier): BountyTaskType[] {
  switch (tier) {
    case "expert":   return ["classify", "geolocate", "verify-media"];
    case "trusted":  return ["classify", "geolocate"];
    case "verified": return ["classify"];
    case "newcomer": return [];
  }
}

// ── Policy notes ──────────────────────────────────────────────────────────────

/**
 * [1] Credit rewards:
 * Easy = 5 credits, medium = 25 credits, hard = 100 credits.
 * Credits are disbursed via walletStore.addTransaction() on task completion.
 * Disputed completions (QA failure) trigger a credit clawback workflow.
 *
 * [1] Кредитні нагороди:
 * Easy = 5 кредитів, medium = 25, hard = 100.
 * Кредити нараховуються через walletStore.addTransaction() при завершенні завдання.
 * Оскаржені завершення (невдача QA) ініціюють процес відкликання кредитів.
 */
export const NOTE_CREDIT_REWARDS_EN =
  "Credit rewards: easy=5, medium=25, hard=100 credits. " +
  "Credits are disbursed via walletStore.addTransaction() on completion. " +
  "QA-failed completions trigger a clawback workflow (credits reversed).";

export const NOTE_CREDIT_REWARDS_UK =
  "Кредитні нагороди: easy=5, medium=25, hard=100 кредитів. " +
  "Нараховуються через walletStore.addTransaction() при завершенні. " +
  "Невдача QA ініціює процес відкликання кредитів.";

/**
 * [2] Anti-gaming rate limit:
 * Each contributor may claim at most MAX_CLAIMS_PER_DAY (10) bounties per
 * rolling 24-hour window. This prevents flooding and low-quality farming.
 * Suspect patterns (e.g. always claiming easy tasks within seconds) are flagged.
 *
 * [2] Обмеження проти маніпуляцій:
 * Кожен учасник може взяти не більше MAX_CLAIMS_PER_DAY (10) завдань за 24 години.
 * Підозрілі патерни (наприклад, миттєве взяття лише легких завдань) позначаються.
 */
export const NOTE_ANTI_GAMING_EN =
  "Anti-gaming rate limit: max 10 claims per 24-hour rolling window per user. " +
  "Automated pattern detection should flag: always-easy claims, sub-second responses, " +
  "claim-without-review behaviour. Escalate to trust & safety team.";

export const NOTE_ANTI_GAMING_UK =
  "Обмеження проти маніпуляцій: максимум 10 заявок за 24-годинне вікно на користувача. " +
  "Автоматичне виявлення підозрілих патернів: лише легкі завдання, миттєві відповіді, " +
  "взяття без перевірки. Передавати до команди довіри та безпеки.";

/**
 * [3] Community review note:
 * High-value (hard) bounty completions undergo automatic entry into the QA
 * sampling pool (100% sample rate for hard tasks, bypassing shouldSampleForQA).
 * Community leaderboard shows top contributors by total credits earned (opt-in).
 *
 * [3] Примітка щодо перевірки спільнотою:
 * Завершення дорогих (hard) завдань автоматично потрапляють до QA-пулу
 * (100% частота відбору для hard-завдань, незалежно від shouldSampleForQA).
 * Таблиця лідерів спільноти показує топ-учасників за зароблені кредити (за бажанням).
 */
export const NOTE_COMMUNITY_REVIEW_EN =
  "Community review: all 'hard' bounty completions are 100% QA-sampled " +
  "(override shouldSampleForQA for hard tasks). " +
  "Opt-in community leaderboard shows top earners by total credits.";

export const NOTE_COMMUNITY_REVIEW_UK =
  "Перевірка спільнотою: всі виконані 'hard' завдання проходять 100% QA-відбір " +
  "(перевизначає shouldSampleForQA для hard-завдань). " +
  "Таблиця лідерів спільноти (за бажанням) показує топ-учасників за кредити.";
