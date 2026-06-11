/**
 * Design System Documentation (Storybook) configuration.
 * Конфігурація документації дизайн-системи (Storybook).
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** Top-level sections in the Storybook documentation. */
export type StorybookSection =
  | "foundations"
  | "components"
  | "patterns"
  | "themes"
  | "locales"
  | "guidelines";

/** Documentation completeness status for a single component. */
export type ComponentDocStatus =
  | "documented"
  | "partial"
  | "missing"
  | "deprecated";

/** Categories within the Foundations section. */
export type FoundationsCategory =
  | "color"
  | "spacing"
  | "typography"
  | "motion"
  | "shadows"
  | "icons"
  | "grid"
  | "breakpoints";

/** Full configuration for a single Storybook section. */
export interface StorybookSectionConfig {
  id: StorybookSection;
  name_en: string;
  name_uk: string;
  description_en: string;
  description_uk: string;
  items: string[];
  notes_en: string;
  notes_uk: string;
}

// ── Section Configs ───────────────────────────────────────────────────────────

export const STORYBOOK_SECTIONS: StorybookSectionConfig[] = [
  {
    id: "foundations",
    name_en: "Foundations",
    name_uk: "Основи",
    description_en:
      "Core design tokens and primitives that underpin every component.",
    description_uk:
      "Основні дизайн-токени та примітиви, на яких базується кожен компонент.",
    items: [
      "color",
      "spacing",
      "typography",
      "motion",
      "shadows",
      "icons",
      "grid",
      "breakpoints",
    ],
    notes_en:
      "All tokens auto-synced from Figma via Tokens Studio. Changes to tokens here propagate to all components automatically.",
    notes_uk:
      "Всі токени автоматично синхронізуються з Figma через Tokens Studio. Зміни токенів тут автоматично поширюються на всі компоненти.",
  },
  {
    id: "components",
    name_en: "Components",
    name_uk: "Компоненти",
    description_en:
      "All UI components with props documentation, variants, examples, and accessibility notes.",
    description_uk:
      "Всі UI-компоненти з документацією пропсів, варіантами, прикладами та нотатками про доступність.",
    items: [
      "Button",
      "Input",
      "Select",
      "Checkbox",
      "Radio",
      "Toggle",
      "Modal",
      "Drawer",
      "Tooltip",
      "Popover",
      "DataTable",
      "Chip",
      "SourcePill",
      "Badge",
      "Avatar",
      "Alert",
      "Banner",
      "Spinner",
      "Skeleton",
      "ProgressBar",
      "Tabs",
      "Breadcrumb",
      "Pagination",
      "DatePicker",
      "TimePicker",
      "SearchInput",
      "CommandPalette",
      "DropdownMenu",
      "ContextMenu",
      "Toast",
    ],
    notes_en:
      "Every component story must include: default state, all variants, disabled state, loading state (where applicable), and keyboard navigation demo.",
    notes_uk:
      "Кожна story компонента повинна включати: стан за замовчуванням, всі варіанти, вимкнений стан, стан завантаження (де застосовно) та демонстрацію навігації з клавіатури.",
  },
  {
    id: "patterns",
    name_en: "Patterns",
    name_uk: "Патерни",
    description_en:
      "Reusable UI patterns combining multiple components into common interaction flows.",
    description_uk:
      "Багаторазові UI-патерни, що поєднують кілька компонентів у типові потоки взаємодії.",
    items: [
      "forms",
      "tables",
      "dialogs",
      "empty-states",
      "navigation",
      "map-overlays",
    ],
    notes_en:
      "Patterns document the 'how to combine' — not individual components but compositional guidance for recurring page-level problems.",
    notes_uk:
      "Патерни документують «як комбінувати» — не окремі компоненти, а композиційні поради для типових проблем рівня сторінки.",
  },
  {
    id: "themes",
    name_en: "Themes",
    name_uk: "Теми",
    description_en:
      "Visual theme previews: dark, tactical, and light, plus white-label custom theme preview.",
    description_uk:
      "Попередній перегляд візуальних тем: темна, тактична та світла, а також попередній перегляд теми для white-label.",
    items: ["dark", "tactical", "light", "white-label-custom"],
    notes_en:
      "Tactical theme: high-contrast, reduced-colour palette optimised for low-light field use. White-label theme preview allows enterprise customers to preview brand colour injection.",
    notes_uk:
      "Тактична тема: висококонтрастна, зменшена колірна палітра, оптимізована для використання в умовах поганого освітлення. Попередній перегляд white-label теми дозволяє корпоративним клієнтам переглядати впровадження фірмових кольорів.",
  },
  {
    id: "locales",
    name_en: "Locales",
    name_uk: "Локалі",
    description_en:
      "Locale switcher for long-string overflow preview and RTL layout testing.",
    description_uk:
      "Перемикач локалі для попереднього перегляду переповнення довгих рядків та тестування RTL-макету.",
    items: ["en", "uk", "de", "pl", "ar-rtl"],
    notes_en:
      "Every component must be previewed in at least EN, UK, and AR (RTL) to catch overflow and layout breakage before shipping. DE and PL catch long-string overflow common in Germanic and Slavic languages.",
    notes_uk:
      "Кожен компонент повинен переглядатись щонайменше в EN, UK та AR (RTL), щоб виявляти переповнення та порушення макету до відправки. DE та PL виявляють переповнення довгих рядків, типове для германських та слов'янських мов.",
  },
  {
    id: "guidelines",
    name_en: "Guidelines",
    name_uk: "Рекомендації",
    description_en:
      "Public-facing component guidelines for white-label customers integrating the design system.",
    description_uk:
      "Публічні рекомендації щодо компонентів для white-label клієнтів, що інтегрують дизайн-систему.",
    items: [
      "component-usage",
      "brand-customisation",
      "accessibility-requirements",
      "embed-guidelines",
    ],
    notes_en:
      "Guidelines section is publicly accessible (no auth required). Covers usage dos and don'ts, accessibility requirements, and how to customise tokens for white-label deployments.",
    notes_uk:
      "Розділ рекомендацій є загальнодоступним (без автентифікації). Охоплює правила та заборони використання, вимоги доступності та спосіб налаштування токенів для white-label розгортань.",
  },
];

// ── Deployment Note ───────────────────────────────────────────────────────────

export const STORYBOOK_DEPLOYMENT_NOTE_EN =
  "Storybook is deployed at design.<domain> (e.g. design.aegislens.com). " +
  "Internal sections (components, patterns, themes, locales) are behind basic auth for internal team use. " +
  "The guidelines section is publicly accessible for white-label customers.";

export const STORYBOOK_DEPLOYMENT_NOTE_UK =
  "Storybook розгорнуто на design.<домен> (наприклад, design.aegislens.com). " +
  "Внутрішні розділи (components, patterns, themes, locales) захищені базовою автентифікацією для внутрішньої команди. " +
  "Розділ guidelines є загальнодоступним для white-label клієнтів.";

// ── Visual Regression ─────────────────────────────────────────────────────────

export const VISUAL_REGRESSION_NOTE_EN =
  "Visual regression testing powered by Chromatic (primary) or Percy (fallback). " +
  "Every PR runs a visual diff against the baseline snapshot. " +
  "Diffs greater than 0.1% block PR merge until reviewed and accepted. " +
  "Baselines are updated by the design lead on each release.";

export const VISUAL_REGRESSION_NOTE_UK =
  "Тестування візуальних регресій за допомогою Chromatic (основний) або Percy (запасний). " +
  "Кожен PR запускає візуальне порівняння з базовим знімком. " +
  "Різниці більше 0.1% блокують злиття PR до перегляду та підтвердження. " +
  "Базові лінії оновлюються дизайн-лідом при кожному релізі.";

// ── Accessibility Testing ─────────────────────────────────────────────────────

export const A11Y_TESTING_NOTE_EN =
  "axe-core integration in every Storybook story via @storybook/addon-a11y. " +
  "Zero a11y violations required to merge — any violation blocks the PR. " +
  "Stories must pass WCAG 2.1 AA minimum; AAA for critical components (alerts, modals, navigation).";

export const A11Y_TESTING_NOTE_UK =
  "Інтеграція axe-core в кожну Storybook story через @storybook/addon-a11y. " +
  "Для злиття необхідна відсутність порушень доступності — будь-яке порушення блокує PR. " +
  "Stories повинні відповідати мінімуму WCAG 2.1 AA; AAA для критичних компонентів (сповіщення, модальні вікна, навігація).";

// ── Interaction Testing ───────────────────────────────────────────────────────

export const INTERACTION_TESTING_NOTE_EN =
  "Storybook interaction tests using play() functions for complex components. " +
  "Covers: modal open/close, form submission, dropdown selection, table sort/filter, drawer slide, and command palette navigation. " +
  "Tests run in CI via @storybook/test-runner.";

export const INTERACTION_TESTING_NOTE_UK =
  "Тести взаємодії Storybook з використанням функцій play() для складних компонентів. " +
  "Охоплює: відкриття/закриття модального вікна, відправку форми, вибір у випадаючому списку, сортування/фільтрацію таблиці, слайд drawer та навігацію командної палети. " +
  "Тести запускаються в CI через @storybook/test-runner.";

// ── Figma Sync ────────────────────────────────────────────────────────────────

export const FIGMA_SYNC_NOTE_EN =
  "Figma library mirrors Storybook component structure 1:1. " +
  "Design tokens auto-synced via Tokens Studio plugin: changes pushed from Figma generate a PR updating the tokens JSON. " +
  "Storybook and Figma must stay in sync; any manual divergence is flagged in the weekly design–engineering sync.";

export const FIGMA_SYNC_NOTE_UK =
  "Бібліотека Figma відображає структуру компонентів Storybook 1:1. " +
  "Дизайн-токени автоматично синхронізуються через плагін Tokens Studio: зміни, відправлені з Figma, генерують PR, що оновлює JSON токенів. " +
  "Storybook та Figma повинні залишатись синхронізованими; будь-яке ручне розходження позначається на щотижневій синхронізації дизайн–інженерія.";

// ── Code Snippets ─────────────────────────────────────────────────────────────

export const CODE_SNIPPETS_NOTE_EN =
  "Every story includes a copyable code snippet showing minimal usage. " +
  "Snippet panel shows framework variants: React (primary), Vue (for white-label embed scenarios). " +
  "Snippets are auto-generated from story args where possible; hand-curated for complex examples.";

export const CODE_SNIPPETS_NOTE_UK =
  "Кожна story містить придатний для копіювання фрагмент коду, що показує мінімальне використання. " +
  "Панель фрагментів показує варіанти фреймворків: React (основний), Vue (для сценаріїв white-label вбудовування). " +
  "Фрагменти автоматично генеруються з args story де можливо; вручну підготовлені для складних прикладів.";

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Returns the StorybookSectionConfig for the given section id, or undefined if not found.
 * Повертає StorybookSectionConfig для вказаного id розділу, або undefined якщо не знайдено.
 */
export function getStorybookSection(
  id: StorybookSection,
): StorybookSectionConfig | undefined {
  return STORYBOOK_SECTIONS.find((s) => s.id === id);
}
