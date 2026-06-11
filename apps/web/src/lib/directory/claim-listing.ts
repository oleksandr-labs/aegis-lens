'use server';
/**
 * Claim Listing Flow — lets real owners claim their directory listing.
 * Richer profiles + monetization hooks follow successful claim.
 * Процес підтвердження власності — дозволяє реальним власникам заявити права на свій запис у каталозі.
 * Успішне підтвердження відкриває розширені профілі та монетизаційні можливості.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Available methods to verify ownership of a listing.
 * Доступні методи верифікації власності на запис.
 */
export type ClaimVerificationMethod =
  | "domain-email"
  | "dns-txt-record"
  | "linkedin-employer"
  | "manual-review";

/**
 * Lifecycle status of a listing claim.
 * Статус життєвого циклу заявки на підтвердження власності.
 */
export type ClaimStatus =
  | "unclaimed"
  | "pending-verification"
  | "claimed-basic"
  | "claimed-featured"
  | "disputed"
  | "revoked";

/**
 * Commercial tier of a claim — basic (free) or featured (paid).
 * Комерційний рівень заявки — базовий (безкоштовний) або виділений (платний).
 */
export type ClaimTier = "basic" | "featured";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

/**
 * Full audit record for a single listing claim.
 * Повний запис аудиту для однієї заявки на підтвердження власності.
 */
export interface ClaimRecord {
  id: string;
  listingId: string;
  claimedBy: string;
  method: ClaimVerificationMethod;
  tier: ClaimTier;
  status: ClaimStatus;
  verifiedAt: number | null;
  auditLog: string[];
}

// ---------------------------------------------------------------------------
// Constants — EN + UK pairs
// ---------------------------------------------------------------------------

export const CLAIM_VERIFICATION_METHODS_EN =
  "Four verification methods are supported: " +
  "(1) domain-email — send a verification link to an email on the listing's registered domain; " +
  "(2) dns-txt-record — add a platform-issued TXT record to the domain DNS zone; " +
  "(3) linkedin-employer — match the claimant's LinkedIn current employer to the listing name; " +
  "(4) manual-review — submit business documents for editorial staff review (7-14 business days).";

export const CLAIM_VERIFICATION_METHODS_UK =
  "Підтримуються чотири методи верифікації: " +
  "(1) domain-email — надіслати посилання для підтвердження на електронну пошту зареєстрованого домену запису; " +
  "(2) dns-txt-record — додати виданий платформою TXT-запис до DNS-зони домену; " +
  "(3) linkedin-employer — зіставити поточного роботодавця на LinkedIn заявника з назвою запису; " +
  "(4) manual-review — подати бізнес-документи для розгляду редакційним персоналом (7–14 робочих днів).";

export const CLAIM_FREE_TIER_NOTE_EN =
  "The free (basic) claim tier grants the verified owner edit rights over their listing. " +
  "All changes submitted by the owner are routed through the standard edit-approval queue " +
  "and go live only after a moderator approves them. No payment is required for a basic claim.";

export const CLAIM_FREE_TIER_NOTE_UK =
  "Безкоштовний (базовий) рівень заявки надає верифікованому власнику права на редагування свого запису. " +
  "Усі зміни, подані власником, проходять через стандартну чергу схвалення редагувань " +
  "і публікуються лише після схвалення модератором. Оплата для базової заявки не потрібна.";

export const CLAIM_PAID_TIER_NOTE_EN =
  "The paid (featured) claim tier costs $99–499/month depending on category and market. " +
  "Benefits: featured placement at the top of category and search result pages, " +
  "access to listing analytics dashboard, lead-generation contact form with CRM export, " +
  "and priority moderation (24-hour SLA). All featured listings carry a disclosure label.";

export const CLAIM_PAID_TIER_NOTE_UK =
  "Платний (виділений) рівень заявки коштує $99–499 на місяць залежно від категорії та ринку. " +
  "Переваги: виділене розміщення у верхній частині сторінок категорій та результатів пошуку, " +
  "доступ до аналітичної панелі запису, контактна форма для лідогенерації з експортом у CRM " +
  "та пріоритетна модерація (SLA 24 години). Усі виділені записи мають позначку розкриття.";

export const CLAIM_TRANSFER_NOTE_EN =
  "Transfer of listing ownership (e.g. acquisition, staff change) requires re-verification " +
  "by the incoming owner using any supported method. The outgoing owner's claim is revoked " +
  "immediately upon transfer initiation. A full audit trail is preserved for both parties.";

export const CLAIM_TRANSFER_NOTE_UK =
  "Передача права власності на запис (наприклад, поглинання, зміна персоналу) вимагає повторної верифікації " +
  "новим власником за допомогою будь-якого підтримуваного методу. Заявка попереднього власника анулюється " +
  "негайно після ініціювання передачі. Повна траса аудиту зберігається для обох сторін.";

export const CLAIM_DISPUTE_NOTE_EN =
  "If two parties submit concurrent claims for the same listing, the listing enters 'disputed' status. " +
  "Platform moderators conduct a manual review of evidence from both claimants. " +
  "Default resolution: the party that completes verification first (first-verified-wins) prevails, " +
  "unless contrary evidence (trademark, registration) overrides this.";

export const CLAIM_DISPUTE_NOTE_UK =
  "Якщо дві сторони подають одночасні заявки на один і той самий запис, запис переходить у статус 'оскаржено'. " +
  "Модератори платформи проводять ручний розгляд доказів від обох заявників. " +
  "Стандартне вирішення: перемагає сторона, яка першою завершила верифікацію (перший верифікований виграє), " +
  "якщо протилежні докази (торгова марка, реєстрація) не змінюють це правило.";

export const CLAIM_AUTO_REVOKE_NOTE_EN =
  "A verified claim is automatically revoked upon detection of abuse: " +
  "fake reviews injection, spam outreach through the lead-gen form, " +
  "impersonation of another entity, or material misrepresentation of the listing. " +
  "Revocation is logged and the listing reverts to 'unclaimed'. The owner may appeal within 14 days.";

export const CLAIM_AUTO_REVOKE_NOTE_UK =
  "Верифікована заявка автоматично анулюється після виявлення зловживання: " +
  "вставка фальшивих відгуків, спам через форму лідогенерації, " +
  "видавання себе за іншу особу або суттєве спотворення даних запису. " +
  "Анулювання реєструється, і запис повертається до статусу 'unclaimed'. Власник може подати апеляцію протягом 14 днів.";

export const CLAIM_CTA_NOTE_EN =
  "Every unclaimed listing displays a prominent 'Is this your business?' call-to-action button. " +
  "The CTA opens a lightweight claim initiation flow: enter contact email, choose verification method, " +
  "and receive instructions. The entire flow completes in under 3 minutes for domain-email or DNS methods.";

export const CLAIM_CTA_NOTE_UK =
  "Кожен незаявлений запис відображає помітну кнопку «Це ваш бізнес?». " +
  "CTA відкриває полегшений процес ініціювання заявки: ввести контактний email, обрати метод верифікації " +
  "та отримати інструкції. Весь процес займає менше 3 хвилин для методів domain-email або DNS.";

// ---------------------------------------------------------------------------
// ClaimStore — in-memory store (replace with DB adapter in production)
// ---------------------------------------------------------------------------

/**
 * In-memory store for listing claim records.
 * Оперативне сховище для записів заявок на власність.
 */
export class ClaimStore {
  private readonly store = new Map<string, ClaimRecord>();

  /**
   * Initiate a new claim for a listing.
   * Ініціювати нову заявку на запис.
   */
  claimListing(record: ClaimRecord): ClaimRecord {
    const existing = this.store.get(record.listingId);
    if (existing && existing.status === "claimed-basic") {
      existing.status = "disputed";
      existing.auditLog.push(
        `[${Date.now()}] Dispute opened by ${record.claimedBy}`,
      );
      this.store.set(record.listingId, existing);
      return existing;
    }
    this.store.set(record.listingId, record);
    return record;
  }

  /**
   * Update the status of an existing claim.
   * Оновити статус наявної заявки.
   */
  updateStatus(listingId: string, status: ClaimStatus): ClaimRecord | null {
    const record = this.store.get(listingId);
    if (!record) return null;
    record.status = status;
    if (status === "claimed-basic" || status === "claimed-featured") {
      record.verifiedAt = Date.now();
    }
    record.auditLog.push(`[${Date.now()}] Status changed to ${status}`);
    this.store.set(listingId, record);
    return record;
  }

  /**
   * Retrieve the active claim for a given listing.
   * Отримати активну заявку для певного запису.
   */
  getClaimForListing(listingId: string): ClaimRecord | undefined {
    return this.store.get(listingId);
  }

  /**
   * Append an audit entry to an existing claim.
   * Додати запис аудиту до наявної заявки.
   */
  addAuditEntry(listingId: string, entry: string): void {
    const record = this.store.get(listingId);
    if (!record) return;
    record.auditLog.push(`[${Date.now()}] ${entry}`);
    this.store.set(listingId, record);
  }
}

/** Singleton claim store instance. */
export const claimStore = new ClaimStore();
