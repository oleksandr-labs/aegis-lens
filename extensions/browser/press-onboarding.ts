/**
 * Browser Extension — Press tier onboarding.
 *
 * Defines the 4-step onboarding flow for journalists and analysts on the
 * Press tier, plus the 6 Press-specific features surfaced during onboarding.
 *
 * Press persona is the extension's primary daily-driver user; onboarding is
 * optimised for newsroom workflows and minimal friction to first story.
 *
 * Онбординг для тарифу Press: 4 кроки від встановлення до першої публікації.
 * Оптимізовано для роботи в редакціях — мінімум тертя до першої новини.
 */

// ── Base URL ──────────────────────────────────────────────────────────────────

const ONBOARDING_BASE_URL = "https://aegislens.com/onboarding/press";

// ── PRESS_ONBOARDING_STEPS ────────────────────────────────────────────────────

export interface OnboardingStep {
  /** Step index (1-based) */
  step: number;
  /** Machine-readable step key */
  key: "install" | "auth" | "verify-credential" | "first-story";
  title_en: string;
  title_uk: string;
  description_en: string;
  description_uk: string;
  /**
   * URL the extension popup opens for this step.
   * Relative to ONBOARDING_BASE_URL.
   *
   * URL, що відкривається popup-ом для цього кроку.
   */
  stepUrl: string;
  /**
   * Whether this step can be skipped (e.g. already authenticated).
   *
   * Чи може крок бути пропущений (напр., вже авторизований).
   */
  skippable: boolean;
}

/**
 * Four-step onboarding flow for the Press tier.
 *
 * Чотири кроки онбордингу для тарифу Press.
 */
export const PRESS_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    step: 1,
    key: "install",
    title_en: "Install the Extension",
    title_uk: "Встановіть розширення",
    description_en:
      "Install Aegis Lens from the Chrome Web Store. Pin it to your toolbar for one-click access during breaking news.",
    description_uk:
      "Встановіть Aegis Lens із Chrome Web Store. Закріпіть на панелі інструментів для швидкого доступу під час термінових новин.",
    stepUrl: `${ONBOARDING_BASE_URL}/step/install`,
    skippable: false,
  },
  {
    step: 2,
    key: "auth",
    title_en: "Sign in to Your Press Account",
    title_uk: "Увійдіть у свій акаунт Press",
    description_en:
      "Authenticate with your Aegis Lens Press tier credentials via secure OAuth PKCE. Your session is stored locally — no passwords in extension storage.",
    description_uk:
      "Автентифікуйтесь із обліковими даними тарифу Press через OAuth PKCE. Сесія зберігається локально — жодних паролів у сховищі розширення.",
    stepUrl: `${ONBOARDING_BASE_URL}/step/auth`,
    skippable: false,
  },
  {
    step: 3,
    key: "verify-credential",
    title_en: "Verify Your Press Credential",
    title_uk: "Верифікуйте прес-посвідчення",
    description_en:
      "Upload your press credential (press card, editorial letter, or accreditation) to unlock source reputation badges and exclusive Press-tier features.",
    description_uk:
      "Завантажте прес-посвідчення (журналістське посвідчення, редакційний лист або акредитацію), щоб розблокувати значки репутації джерел і ексклюзивні функції Press.",
    stepUrl: `${ONBOARDING_BASE_URL}/step/verify-credential`,
    skippable: true,
  },
  {
    step: 4,
    key: "first-story",
    title_en: "Capture Your First Story",
    title_uk: "Захопіть свою першу новину",
    description_en:
      "Right-click an image or URL on any news page to create your first intelligence event. The platform will suggest related events and source reputation data automatically.",
    description_uk:
      "Клацніть правою кнопкою миші на зображенні або URL будь-якої новинної сторінки, щоб створити першу подію розвідки. Платформа автоматично запропонує пов'язані події та дані репутації джерел.",
    stepUrl: `${ONBOARDING_BASE_URL}/step/first-story`,
    skippable: false,
  },
];

// ── PRESS_TIER_FEATURES ───────────────────────────────────────────────────────

export interface PressTierFeature {
  key: string;
  title_en: string;
  title_uk: string;
  description_en: string;
  description_uk: string;
}

/**
 * Six features exclusive to or enhanced for Press tier users.
 * Surfaced during onboarding step 3 (verify-credential) and in the popup UI.
 *
 * Шість функцій для тарифу Press, показаних під час онбордингу та в popup.
 */
export const PRESS_TIER_FEATURES: PressTierFeature[] = [
  {
    key: "source-reputation-badge",
    title_en: "Source Reputation Badge",
    title_uk: "Значок репутації джерела",
    description_en:
      "In-page overlay showing reliability score, known biases, and fact-check history for any tracked source.",
    description_uk:
      "Оверлей на сторінці з оцінкою достовірності, відомими упередженнями та історією фактчекінгу для відомих джерел.",
  },
  {
    key: "verified-credential-indicator",
    title_en: "Verified Credential Indicator",
    title_uk: "Індикатор верифікованого посвідчення",
    description_en:
      "Visual badge confirming your accredited press status when submitting events — boosts event review priority.",
    description_uk:
      "Візуальний значок, що підтверджує ваш акредитований прес-статус при поданні подій — підвищує пріоритет перегляду.",
  },
  {
    key: "breaking-news-mode",
    title_en: "Breaking News Mode",
    title_uk: "Режим термінових новин",
    description_en:
      "One-keystroke rapid capture mode that queues all selected items for batch review — optimised for fast-moving stories.",
    description_uk:
      "Режим швидкого захоплення одним натисканням клавіші: черга всіх вибраних елементів для пакетного перегляду під час подій, що швидко розвиваються.",
  },
  {
    key: "newsroom-shared-workspace",
    title_en: "Newsroom Shared Workspace",
    title_uk: "Спільний робочий простір редакції",
    description_en:
      "Share captured events and ongoing investigation threads directly with colleagues in the same Press-tier org.",
    description_uk:
      "Діліться захопленими подіями та потоками розслідувань безпосередньо з колегами в тій самій організації тарифу Press.",
  },
  {
    key: "export-to-cms",
    title_en: "Export to CMS",
    title_uk: "Експорт у CMS",
    description_en:
      "One-click export of event drafts to WordPress, Ghost, or custom CMS via webhook — structured data, not raw clipboard.",
    description_uk:
      "Одним кліком експортуйте чернетки подій у WordPress, Ghost або власну CMS через webhook — структуровані дані, а не сирий буфер обміну.",
  },
  {
    key: "priority-review-queue",
    title_en: "Priority Review Queue",
    title_uk: "Пріоритетна черга ревʼю",
    description_en:
      "Events submitted by verified Press accounts are surfaced first in the platform review queue for faster publication.",
    description_uk:
      "Події, подані верифікованими прес-акаунтами, відображаються першими в черзі ревʼю для швидшої публікації.",
  },
];

// ── buildPressOnboardingUrl ───────────────────────────────────────────────────

/**
 * Build the entry URL for the Press tier onboarding flow.
 * Optionally include a returnTo path for post-onboarding redirect.
 *
 * Формує URL для початку онбордингу тарифу Press.
 * Опційно додає returnTo для перенаправлення після завершення.
 */
export function buildPressOnboardingUrl(returnTo?: string): string {
  const base = `${ONBOARDING_BASE_URL}?tier=press`;
  if (returnTo) {
    return `${base}&returnTo=${encodeURIComponent(returnTo)}`;
  }
  return base;
}
