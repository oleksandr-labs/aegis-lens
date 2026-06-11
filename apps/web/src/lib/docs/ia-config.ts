/**
 * Docs Information Architecture configuration — three surfaces, single IA.
 * Конфігурація інформаційної архітектури документації — три поверхні, єдина IA.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** Three documentation surfaces served by the platform. */
export type DocsSurface = "user-docs" | "dev-docs" | "internal-handbook";

/** Audience roles that consume documentation. */
export type DocsAudience =
  | "end-user"
  | "developer"
  | "analyst"
  | "enterprise-admin"
  | "employee";

/** Full configuration for a single docs surface. */
export interface DocsSurfaceConfig {
  id: DocsSurface;
  name_en: string;
  name_uk: string;
  primaryAudience: DocsAudience[];
  urlPrefix: string;
  features_en: string[];
  features_uk: string[];
  notes_en: string;
  notes_uk: string;
}

// ── Surface Configs ───────────────────────────────────────────────────────────

export const DOCS_SURFACES: DocsSurfaceConfig[] = [
  {
    id: "user-docs",
    name_en: "User Docs (Help Center)",
    name_uk: "Документація для користувачів (Центр допомоги)",
    primaryAudience: ["end-user", "analyst"],
    urlPrefix: "/help",
    features_en: [
      "Getting started guides",
      "Map workspace tutorials",
      "Alert & report recipes",
      "FAQ and glossary",
      "Video walkthroughs",
      "In-app contextual tooltips",
    ],
    features_uk: [
      "Посібники для початку роботи",
      "Навчальні матеріали з картографічного робочого простору",
      "Рецепти сповіщень і звітів",
      "Поширені запитання та глосарій",
      "Відеоінструкції",
      "Контекстні підказки в застосунку",
    ],
    notes_en:
      "Always reflects the latest product version. No versioning needed — update on every release.",
    notes_uk:
      "Завжди відображає останню версію продукту. Версіонування не потрібне — оновлювати при кожному релізі.",
  },
  {
    id: "dev-docs",
    name_en: "Developer Docs (API + SDK + Integrations)",
    name_uk: "Документація для розробників (API + SDK + Інтеграції)",
    primaryAudience: ["developer", "enterprise-admin"],
    urlPrefix: "/docs",
    features_en: [
      "Quickstart per SDK (TypeScript, Python, Go)",
      "REST API reference (OpenAPI 3.1)",
      "Webhook guide",
      "Authentication & rate limits",
      "Error catalog",
      "Per-endpoint code samples",
      "Interactive API explorer",
    ],
    features_uk: [
      "Quickstart для кожного SDK (TypeScript, Python, Go)",
      "Довідник REST API (OpenAPI 3.1)",
      "Посібник з вебхуків",
      "Автентифікація та обмеження частоти запитів",
      "Каталог помилок",
      "Зразки коду для кожного ендпоінту",
      "Інтерактивний API-провідник",
    ],
    notes_en:
      "Versioned by API version (/v1, /v2). Dev docs are a sales surface for security firms and governments — treat as a product.",
    notes_uk:
      "Версіонується за версією API (/v1, /v2). Документація для розробників — це торгова поверхня для компаній безпеки та урядів — ставитись як до продукту.",
  },
  {
    id: "internal-handbook",
    name_en: "Internal Handbook",
    name_uk: "Внутрішній довідник",
    primaryAudience: ["employee", "enterprise-admin"],
    urlPrefix: "/handbook",
    features_en: [
      "Company values, mission, vision",
      "Engineering, sales, and support playbooks",
      "Hiring rubrics and compensation philosophy",
      "Remote and async work policy",
      "Decision-making frameworks (RAPID/DACI)",
      "Communication norms and SLAs",
      "Security training basics",
    ],
    features_uk: [
      "Цінності компанії, місія, бачення",
      "Посібники з інженерії, продажів та підтримки",
      "Рубрики найму та філософія компенсацій",
      "Політика дистанційної та асинхронної роботи",
      "Фреймворки прийняття рішень (RAPID/DACI)",
      "Норми комунікації та SLA",
      "Основи навчання безпеці",
    ],
    notes_en:
      "Unversioned — always the current living policy. Write once, reference forever.",
    notes_uk:
      "Без версіонування — завжди актуальна жива політика. Написати один раз, посилатись вічно.",
  },
];

// ── Taxonomy ──────────────────────────────────────────────────────────────────

export const DOCS_TAXONOMY_EN =
  "Top-level taxonomy is per-audience surface: end-users land on /help, developers on /docs, employees on /handbook. Cross-surface search with per-surface filter allows discovery across all three. Consistent style and callout conventions reduce cognitive switching cost.";

export const DOCS_TAXONOMY_UK =
  "Верхньорівнева таксономія побудована за аудиторією: кінцеві користувачі потрапляють на /help, розробники на /docs, співробітники на /handbook. Пошук між поверхнями з фільтром за поверхнею забезпечує виявлення в усіх трьох. Єдиний стиль та конвенції виносок знижують когнітивні витрати.";

// ── Style Guide ───────────────────────────────────────────────────────────────

export const DOCS_STYLE_GUIDE_EN =
  "Voice: clear, direct, active-voice, second-person ('you'). " +
  "Code blocks: fenced triple-backtick with language tag; include copy button. " +
  "Callout types: NOTE (blue) for informational asides, TIP (green) for best-practice suggestions, WARNING (amber) for gotchas, DANGER (red) for destructive or irreversible actions. " +
  "Heading hierarchy: H1 for page title only; H2 for major sections; H3 for subsections; never skip levels.";

export const DOCS_STYLE_GUIDE_UK =
  "Голос: чіткий, прямий, активний, звертання від другої особи ('ви'). " +
  "Блоки коду: огороджені потрійними зворотними лапками з тегом мови; включати кнопку копіювання. " +
  "Типи виносок: NOTE (синій) — інформаційні пояснення, TIP (зелений) — поради з найкращих практик, WARNING (бурштиновий) — застереження, DANGER (червоний) — деструктивні або незворотні дії. " +
  "Ієрархія заголовків: H1 лише для назви сторінки; H2 для основних розділів; H3 для підрозділів; ніколи не пропускати рівні.";

// ── Search ────────────────────────────────────────────────────────────────────

export const DOCS_SEARCH_NOTE_EN =
  "Cross-surface search with per-surface filter (user-docs / dev-docs / handbook). " +
  "Powered by Elasticsearch for indexed content and Pagefind for static exported surfaces. " +
  "Autocomplete enabled; 'Did you mean?' for typo correction.";

export const DOCS_SEARCH_NOTE_UK =
  "Пошук між поверхнями з фільтром за поверхнею (user-docs / dev-docs / handbook). " +
  "Працює на Elasticsearch для індексованого контенту та Pagefind для статично експортованих поверхонь. " +
  "Автодоповнення увімкнено; функція 'Чи мали ви на увазі?' для виправлення друкарських помилок.";

// ── Feedback ──────────────────────────────────────────────────────────────────

export const DOCS_FEEDBACK_NOTE_EN =
  "Per-page 'Was this helpful?' widget (thumbs up / thumbs down). " +
  "Negative feedback automatically triggers a review queue entry. " +
  "Reviewers are notified via Slack #docs-review channel within 24 hours.";

export const DOCS_FEEDBACK_NOTE_UK =
  "Віджет 'Чи була ця сторінка корисною?' на кожній сторінці (великий палець вгору/вниз). " +
  "Негативний відгук автоматично додає запис до черги перегляду. " +
  "Рецензентів повідомляють через канал Slack #docs-review протягом 24 годин.";

// ── Versioning ────────────────────────────────────────────────────────────────

export const DOCS_VERSIONING_NOTE_EN =
  "user-docs: always latest — no versioning, updated on every product release. " +
  "dev-docs: versioned by API version (/v1, /v2); previous version maintained for 18 months after next GA. " +
  "internal-handbook: unversioned — always the current living policy.";

export const DOCS_VERSIONING_NOTE_UK =
  "user-docs: завжди остання версія — без версіонування, оновлюється при кожному релізі продукту. " +
  "dev-docs: версіонується за версією API (/v1, /v2); попередня версія підтримується 18 місяців після наступного GA. " +
  "internal-handbook: без версіонування — завжди актуальна жива політика.";

// ── Locale ────────────────────────────────────────────────────────────────────

export const DOCS_LOCALE_NOTE_EN =
  "EN is the canonical language for all three surfaces. " +
  "Ukrainian (UK) localisation begins from Phase 2 for user-docs and handbook. " +
  "Technical dev-docs remain EN-only for MVP to reduce translation maintenance burden.";

export const DOCS_LOCALE_NOTE_UK =
  "Англійська (EN) є канонічною мовою для всіх трьох поверхонь. " +
  "Локалізація українською (UK) починається з Фази 2 для user-docs та handbook. " +
  "Технічна документація dev-docs залишається лише англійською для MVP, щоб зменшити навантаження на підтримку перекладів.";

// ── Freshness ─────────────────────────────────────────────────────────────────

export const DOCS_FRESHNESS_AUDIT_EN =
  "Quarterly freshness audit across all surfaces. " +
  "Pages not updated in 6 months are automatically flagged for review in the docs backlog. " +
  "Stale pages display a banner: 'This page may be out of date — last reviewed [date]'.";

export const DOCS_FRESHNESS_AUDIT_UK =
  "Щоквартальний аудит актуальності на всіх поверхнях. " +
  "Сторінки, не оновлювані протягом 6 місяців, автоматично позначаються для перегляду в беклозі документації. " +
  "Застарілі сторінки відображають банер: «Ця сторінка може бути застарілою — востаннє переглянуто [дата]».";

// ── Discoverability ───────────────────────────────────────────────────────────

export const DOCS_DISCOVERABILITY_NOTE_EN =
  "? icons in the app UI link directly to the relevant doc section (context-sensitive help). " +
  "Contextual help panels slide in from the right without leaving the current page. " +
  "Every alert, report, and workspace feature has a linked help article.";

export const DOCS_DISCOVERABILITY_NOTE_UK =
  "Іконки ? в інтерфейсі застосунку посилаються безпосередньо на відповідний розділ документації (контекстна допомога). " +
  "Панелі контекстної допомоги вислизають справа, не залишаючи поточну сторінку. " +
  "Кожне сповіщення, звіт та функція робочого простору має пов'язану статтю допомоги.";

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Returns the DocsSurfaceConfig for the given surface id, or undefined if not found.
 * Повертає DocsSurfaceConfig для вказаного id поверхні, або undefined якщо не знайдено.
 */
export function getDocsSurface(id: DocsSurface): DocsSurfaceConfig | undefined {
  return DOCS_SURFACES.find((s) => s.id === id);
}
