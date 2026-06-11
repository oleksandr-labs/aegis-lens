'use server';
/**
 * Directory Moderation — keeps the directory accurate, current, fair, and spam-free.
 * Модерація каталогу — підтримує каталог точним, актуальним, справедливим і без спаму.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Types of items that enter the moderation queue.
 * Типи елементів, що потрапляють до черги модерації.
 */
export type ModerationQueueType =
  | "new-submission"
  | "edit-approval"
  | "review-moderation"
  | "staleness-audit"
  | "abuse-report"
  | "appeal";

/**
 * Verdict a moderator can assign to a queue item.
 * Вердикт, який модератор може призначити елементу черги.
 */
export type ModerationVerdict =
  | "approved"
  | "rejected"
  | "needs-changes"
  | "escalated"
  | "removed";

/**
 * Signals that a listing may be fake or low-quality.
 * Сигнали того, що запис може бути фальшивим або низькоякісним.
 */
export type FakeListingSignal =
  | "template-text"
  | "duplicate-phone"
  | "doppelganger-profile"
  | "no-web-presence"
  | "mass-review-burst"
  | "copy-paste-description";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

/**
 * A single item in the moderation queue.
 * Один елемент у черзі модерації.
 */
export interface ModerationItem {
  id: string;
  queueType: ModerationQueueType;
  listingId: string;
  submittedBy: string;
  createdAt: number;
  verdict: ModerationVerdict | null;
  verdictAt: number | null;
  signals: FakeListingSignal[];
  notes: string;
}

// ---------------------------------------------------------------------------
// Constants — EN + UK pairs
// ---------------------------------------------------------------------------

export const FAKE_LISTING_HEURISTICS_EN =
  "Six signals trigger elevated scrutiny for a listing: " +
  "(1) template-text — description matches known boilerplate patterns; " +
  "(2) duplicate-phone — phone number already used on another listing; " +
  "(3) doppelganger-profile — name or address closely resembles an existing legitimate listing; " +
  "(4) no-web-presence — no external links, social profiles, or media mentions can be found; " +
  "(5) mass-review-burst — 5+ reviews submitted within 24 hours of listing creation; " +
  "(6) copy-paste-description — description text found verbatim on unrelated external sites.";

export const FAKE_LISTING_HEURISTICS_UK =
  "Шість сигналів підвищують рівень перевірки запису: " +
  "(1) template-text — опис відповідає відомим шаблонним патернам; " +
  "(2) duplicate-phone — номер телефону вже використовується в іншому записі; " +
  "(3) doppelganger-profile — назва або адреса дуже схожа на наявний легітимний запис; " +
  "(4) no-web-presence — зовнішніх посилань, соціальних профілів або згадок у ЗМІ не знайдено; " +
  "(5) mass-review-burst — 5+ відгуків подано протягом 24 годин після створення запису; " +
  "(6) copy-paste-description — текст опису знайдено дослівно на сторонніх непов'язаних сайтах.";

export const STALENESS_AUDIT_NOTE_EN =
  "Listings that have received no owner interaction (edit, login, response to review) " +
  "for 180 consecutive days are automatically flagged for a staleness audit. " +
  "The owner receives an email notification and has 30 days to confirm the listing is current. " +
  "Unconfirmed listings are downranked; after a further 90 days they are soft-deleted.";

export const STALENESS_AUDIT_NOTE_UK =
  "Записи, з якими власник не взаємодіяв (редагування, вхід, відповідь на відгук) " +
  "протягом 180 днів поспіль, автоматично позначаються для аудиту застарілості. " +
  "Власник отримує сповіщення електронною поштою і має 30 днів для підтвердження актуальності запису. " +
  "Непідтверджені записи знижуються у рейтингу; ще через 90 днів вони м'яко видаляються.";

export const CURATOR_PROGRAM_NOTE_EN =
  "Each major category has a designated curator: either a vetted volunteer or a paid category lead. " +
  "Paid category leads earn $200–500/month based on category size and review throughput. " +
  "Curators have elevated queue access for their category, can flag listings for escalation, " +
  "and produce a monthly category quality summary. All curators sign a conflict-of-interest declaration.";

export const CURATOR_PROGRAM_NOTE_UK =
  "Кожна основна категорія має призначеного куратора: перевіреного волонтера або оплачуваного керівника категорії. " +
  "Оплачувані керівники категорій заробляють $200–500 на місяць залежно від розміру категорії та пропускної здатності перевірок. " +
  "Куратори мають розширений доступ до черги своєї категорії, можуть позначати записи для ескалації " +
  "та складають щомісячне резюме якості категорії. Усі куратори підписують декларацію про конфлікт інтересів.";

export const REMOVAL_POLICY_EN =
  "Removed listings are soft-deleted: content is hidden from public-facing pages but retained in the database. " +
  "The canonical URL returns a 410 Gone response with an explanatory message. " +
  "Data is retained for a minimum of 24 months to support dispute resolution and legal requests. " +
  "Hard-delete requires a separate written request and is subject to legal review.";

export const REMOVAL_POLICY_UK =
  "Видалені записи м'яко видаляються: контент прихований від публічних сторінок, але зберігається в базі даних. " +
  "Канонічна URL-адреса повертає відповідь 410 Gone з пояснювальним повідомленням. " +
  "Дані зберігаються щонайменше 24 місяці для підтримки вирішення спорів та юридичних запитів. " +
  "Остаточне видалення вимагає окремого письмового запиту та підлягає юридичному розгляду.";

export const QUARTERLY_HEALTH_REPORT_EN =
  "A public directory health report is published every quarter, covering: " +
  "total submissions, approval rate, rejection rate and top rejection reasons, " +
  "fake-detection signal hit rates, average moderation turnaround time, " +
  "staleness audit outcomes, and curator program throughput. " +
  "The report is published at /transparency/directory-health.";

export const QUARTERLY_HEALTH_REPORT_UK =
  "Публічний звіт про якість каталогу публікується щокварталу і охоплює: " +
  "загальну кількість поданих записів, рівень схвалення, рівень відхилення та основні причини відхилення, " +
  "частоту спрацювання сигналів виявлення фальшивих записів, середній час обробки модерацією, " +
  "результати аудиту застарілості та пропускну здатність програми кураторів. " +
  "Звіт публікується за адресою /transparency/directory-health.";

export const APPEALS_NOTE_EN =
  "Any listing owner or submitter may file an appeal against a moderation verdict. " +
  "Appeals are submitted through the listing management dashboard and reviewed within 7 business days (SLA). " +
  "A senior moderator or category curator handles the appeal independently of the original decision-maker. " +
  "Appeal outcomes are final; a second appeal requires new material evidence.";

export const APPEALS_NOTE_UK =
  "Будь-який власник або подавач запису може подати апеляцію проти вердикту модерації. " +
  "Апеляції подаються через панель керування записом і розглядаються протягом 7 робочих днів (SLA). " +
  "Старший модератор або куратор категорії розглядає апеляцію незалежно від первісного рішення. " +
  "Результати апеляції є остаточними; друга апеляція вимагає нових матеріальних доказів.";

// ---------------------------------------------------------------------------
// ModerationStore — in-memory (replace with DB adapter in production)
// ---------------------------------------------------------------------------

/**
 * In-memory moderation queue store.
 * Оперативне сховище черги модерації.
 */
export class ModerationStore {
  private readonly items = new Map<string, ModerationItem>();

  /**
   * Add a new item to the moderation queue.
   * Додати новий елемент до черги модерації.
   */
  addItem(item: ModerationItem): ModerationItem {
    this.items.set(item.id, item);
    return item;
  }

  /**
   * Set a verdict on an existing queue item.
   * Встановити вердикт для наявного елемента черги.
   */
  setVerdict(
    id: string,
    verdict: ModerationVerdict,
    notes?: string,
  ): ModerationItem | null {
    const item = this.items.get(id);
    if (!item) return null;
    item.verdict = verdict;
    item.verdictAt = Date.now();
    if (notes) item.notes = notes;
    this.items.set(id, item);
    return item;
  }

  /**
   * Get all items in a specific queue type, sorted oldest-first.
   * Отримати всі елементи певного типу черги, відсортовані від найстаріших.
   */
  getQueue(queueType: ModerationQueueType): ModerationItem[] {
    return [...this.items.values()]
      .filter((i) => i.queueType === queueType)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  /**
   * Get all moderation history for a specific listing.
   * Отримати всю історію модерації для певного запису.
   */
  getByListing(listingId: string): ModerationItem[] {
    return [...this.items.values()]
      .filter((i) => i.listingId === listingId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }
}

/** Singleton moderation store instance. */
export const moderationStore = new ModerationStore();
