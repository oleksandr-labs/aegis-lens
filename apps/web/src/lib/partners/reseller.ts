/**
 * Partner & Reseller Program — canonical registry and helpers.
 * Covers referral partners, resellers, OEM / white-label, and systems integrators.
 * Channel-driven revenue: especially relevant in gov / defence / regulated markets
 * where direct sales cycles are long.
 *
 * Реєстр партнерської та реселерської програми.
 * Охоплює реферальних партнерів, реселерів, OEM / white-label та системних інтеграторів.
 * Канальний дохід: особливо актуальний у ринках gov / оборони / регульованих.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type PartnerTier =
  | "referral"
  | "reseller"
  | "oem-white-label"
  | "systems-integrator";

// ── Interface ─────────────────────────────────────────────────────────────────

export interface PartnerProgramTier {
  id: PartnerTier;
  name_en: string;
  name_uk: string;
  /** Revshare as a decimal fraction (e.g. 0.15 = 15%). Null when custom / negotiated. */
  revsharePercent: number | null;
  /** Minimum annual commitment in USD. Null when no commit required. */
  minCommitUsdPerYear: number | null;
  features_en: string[];
  features_uk: string[];
  notes_en: string;
  notes_uk: string;
}

// ── Registry ──────────────────────────────────────────────────────────────────

export const PARTNER_PROGRAM_TIERS: PartnerProgramTier[] = [
  {
    id: "referral",
    name_en: "Referral Partner",
    name_uk: "Реферальний партнер",
    revsharePercent: 0.15,
    minCommitUsdPerYear: null,
    features_en: [
      "15% first-year revshare on all closed revenue from referred leads",
      "No minimum annual commitment — pass leads when you have them",
      "Access to partner portal: deal registration, lead tracking, marketing assets",
      "Co-branded landing pages and referral link tracking",
      "Free partner certification training (aligned with Aegis Lens Academy)",
      "Quarterly partner newsletter and product roadmap updates",
      "Stripe Connect payout: revshare disbursed monthly after deal closes",
    ],
    features_uk: [
      "15% revshare за перший рік з усього закритого доходу від переданих лідів",
      "Без мінімальних річних зобов'язань — передавайте ліди коли є можливість",
      "Доступ до партнерського порталу: реєстрація угод, відстеження лідів, маркетингові матеріали",
      "Co-branded цільові сторінки та відстеження реферальних посилань",
      "Безкоштовне навчання для партнерської сертифікації (у відповідності з Aegis Lens Academy)",
      "Щоквартальний партнерський newsletter та оновлення дорожньої карти продукту",
      "Виплата через Stripe Connect: revshare нараховується щомісяця після закриття угоди",
    ],
    notes_en:
      "Referral tier is zero-commit, zero-risk for the partner. Ideal for consultancies, individual experts, and NGOs who encounter potential customers in their networks.",
    notes_uk:
      "Реферальний рівень — без зобов'язань і ризику для партнера. Ідеально для консалтингових компаній, індивідуальних експертів і НУО, які зустрічають потенційних клієнтів у своїх мережах.",
  },

  {
    id: "reseller",
    name_en: "Reseller Partner",
    name_uk: "Реселер-партнер",
    revsharePercent: 0.275,
    minCommitUsdPerYear: 50000,
    features_en: [
      "25–30% revshare on all closed revenue (blended rate; exact % set in partner agreement)",
      "Minimum $50,000 annual revenue commitment required",
      "Sells Aegis Lens under our brand with full sales support",
      "Dedicated partner success manager",
      "Deal registration with protected pricing and lead exclusivity window",
      "Access to all partner portal features: deal-reg, leads, training, marketing assets",
      "Co-op marketing budget (MDF — market development funds) for qualifying partners",
      "Quarterly business reviews (QBR) with Aegis Lens leadership",
      "Priority support SLA: 4-hour response for partner-escalated issues",
      "Free partner certification training and sandbox environment",
      "Stripe Connect payout: revshare disbursed monthly",
    ],
    features_uk: [
      "25–30% revshare з усього закритого доходу (змішана ставка; точний % в угоді партнера)",
      "Мінімальне річне зобов'язання по доходу $50,000",
      "Продає Aegis Lens під нашим брендом з повною підтримкою продажів",
      "Виділений менеджер успіху партнера",
      "Реєстрація угод із захищеним ціноутворенням і вікном ексклюзивності ліда",
      "Доступ до всіх функцій партнерського порталу: реєстрація угод, ліди, навчання, маркетингові матеріали",
      "Кооперативний маркетинговий бюджет (MDF) для кваліфікованих партнерів",
      "Щоквартальні бізнес-огляди (QBR) з керівництвом Aegis Lens",
      "Пріоритетний SLA підтримки: відповідь протягом 4 годин для проблем, ескалованих партнером",
      "Безкоштовне навчання для партнерської сертифікації та середовище пісочниці",
      "Виплата через Stripe Connect: revshare нараховується щомісяця",
    ],
    notes_en:
      "Resellers carry the most sales responsibility and thus earn the highest revshare bracket. The $50k minimum commit ensures they are motivated to actively sell rather than passively refer.",
    notes_uk:
      "Реселери несуть найбільшу відповідальність за продажі і тому отримують найвищу частку revshare. Мінімальне зобов'язання в $50k гарантує, що вони мотивовані активно продавати, а не пасивно рекомендувати.",
  },

  {
    id: "oem-white-label",
    name_en: "OEM / White-Label Partner",
    name_uk: "OEM / White-Label партнер",
    revsharePercent: null,
    minCommitUsdPerYear: null,
    features_en: [
      "Sells under their own brand — full white-label capability",
      "Custom revshare: negotiated based on volume, vertical, and exclusivity",
      "Full API access + white-label embed SDK",
      "Custom domain, theming, and brand removal",
      "Dedicated infrastructure namespace (data isolation)",
      "OEM agreement required — see white-label module for full specification",
      "Partner portal access: deal-reg, training, dedicated technical integration support",
      "Custom SLA agreed in OEM contract",
      "Stripe Connect payout or invoice-based settlement depending on agreement",
    ],
    features_uk: [
      "Продає під власним брендом — повні можливості white-label",
      "Кастомний revshare: узгоджується на основі обсягу, вертикалі та ексклюзивності",
      "Повний доступ до API + white-label SDK для вбудовування",
      "Власний домен, тематизація та видалення бренду Aegis Lens",
      "Виділений простір імен інфраструктури (ізоляція даних)",
      "Потрібна OEM угода — повну специфікацію дивіться в модулі white-label",
      "Доступ до партнерського порталу: реєстрація угод, навчання, виділена технічна підтримка інтеграції",
      "Кастомний SLA, узгоджений в OEM контракті",
      "Виплата через Stripe Connect або розрахунок за рахунком-фактурою залежно від угоди",
    ],
    notes_en:
      "OEM / white-label partners resell under their own brand. Commercial terms are fully custom. See the white-label module (TODO_white_label.md) for platform capability detail.",
    notes_uk:
      "OEM / white-label партнери перепродують під власним брендом. Комерційні умови повністю кастомні. Деталі платформних можливостей дивіться в модулі white-label (TODO_white_label.md).",
  },

  {
    id: "systems-integrator",
    name_en: "Systems Integrator",
    name_uk: "Системний інтегратор",
    revsharePercent: null,
    minCommitUsdPerYear: null,
    features_en: [
      "Bundles Aegis Lens into larger gov / defence / regulated-sector deals",
      "Custom commercial terms: negotiated per-deal or as a standing framework agreement",
      "Deep technical integration support: API, webhooks, on-premise data feeds",
      "Access to classified-compatible deployment documentation (where applicable)",
      "Dedicated partner success manager + engineering liaison",
      "Deal registration with full lead exclusivity for named accounts",
      "Partner portal: deal-reg, marketing assets, training, SI-specific collateral",
      "Quarterly business reviews (QBR) with Aegis Lens leadership",
      "MDF available for joint go-to-market activities in target verticals",
      "Free partner certification and sandbox environment",
    ],
    features_uk: [
      "Пакетує Aegis Lens у більші угоди gov / оборони / регульованого сектору",
      "Кастомні комерційні умови: узгоджуються на кожну угоду або як постійна рамкова угода",
      "Глибока підтримка технічної інтеграції: API, вебхуки, on-premise дата-фіди",
      "Доступ до документації для deployments, сумісних з класифікованими системами (де застосовно)",
      "Виділений менеджер успіху партнера + технічний ліason",
      "Реєстрація угод з повною ексклюзивністю лідів для іменних акаунтів",
      "Партнерський портал: реєстрація угод, маркетингові матеріали, навчання, SI-специфічні матеріали",
      "Щоквартальні бізнес-огляди (QBR) з керівництвом Aegis Lens",
      "MDF доступний для спільних go-to-market активностей у цільових вертикалях",
      "Безкоштовна партнерська сертифікація та середовище пісочниці",
    ],
    notes_en:
      "Systems integrators operate in markets where direct sales are slow due to procurement rules, security clearances, or incumbent vendor relationships. They are force-multipliers, not direct salespeople.",
    notes_uk:
      "Системні інтегратори працюють на ринках, де прямі продажі повільні через правила закупівель, дозволи безпеки або відносини з incumbent-постачальниками. Вони — мультиплікатори сили, а не прямі продавці.",
  },
];

// ── Policy strings ─────────────────────────────────────────────────────────────

export const PARTNER_PORTAL_FEATURES_EN =
  "The Aegis Lens Partner Portal provides deal registration, lead tracking, training modules, " +
  "marketing assets (slide decks, one-pagers, case studies), and co-branded collateral. " +
  "Partners can register deals to lock pricing and lead exclusivity for a 90-day window. " +
  "Training is free for all partners and aligned with the Aegis Lens Academy certification curriculum.";

export const PARTNER_PORTAL_FEATURES_UK =
  "Партнерський портал Aegis Lens надає реєстрацію угод, відстеження лідів, навчальні модулі, " +
  "маркетингові матеріали (слайди, one-pager'и, кейс-стаді) та co-branded матеріали. " +
  "Партнери можуть реєструвати угоди для фіксації ціноутворення та ексклюзивності ліда на 90 днів. " +
  "Навчання безкоштовне для всіх партнерів і відповідає навчальному плану сертифікації Aegis Lens Academy.";

export const STRIPE_CONNECT_PAYOUT_NOTE_EN =
  "Revshare payouts are processed via Stripe Connect. " +
  "Partners complete the Stripe Connect onboarding once; payouts are disbursed monthly " +
  "within 30 days of the billing period close. " +
  "Minimum payout threshold: $50. Amounts below threshold roll over to the next period. " +
  "Partner-led revenue is tracked separately from direct-sales revenue in reporting.";

export const STRIPE_CONNECT_PAYOUT_NOTE_UK =
  "Виплати revshare обробляються через Stripe Connect. " +
  "Партнери проходять onboarding у Stripe Connect один раз; виплати здійснюються щомісяця " +
  "протягом 30 днів після закриття розрахункового періоду. " +
  "Мінімальний поріг виплати: $50. Суми нижче порогу переносяться на наступний період. " +
  "Дохід від партнерських продажів відстежується окремо від прямих продажів у звітності.";

export const PARTNER_MDF_NOTE_EN =
  "Market Development Funds (MDF) are available for reseller and systems integrator partners meeting volume thresholds. " +
  "MDF is co-invested in joint marketing activities: events, sponsored content, regional campaigns. " +
  "MDF requests are submitted via the partner portal and approved within 10 business days. " +
  "Typical allocation: up to 3% of prior-year partner-sourced revenue.";

export const PARTNER_MDF_NOTE_UK =
  "Фонди розвитку ринку (MDF) доступні для партнерів-реселерів та системних інтеграторів, що досягають порогових значень обсягу. " +
  "MDF спільно інвестується в joint marketing активності: заходи, спонсорський контент, регіональні кампанії. " +
  "Запити MDF подаються через партнерський портал і затверджуються протягом 10 робочих днів. " +
  "Типове виділення: до 3% від партнерського доходу за попередній рік.";

export const PARTNER_QBR_NOTE_EN =
  "Quarterly Partner Business Reviews (QBRs) are held with reseller and systems integrator partners. " +
  "Each QBR covers: pipeline review, deal status, product roadmap updates, co-marketing planning, and MDF utilisation. " +
  "QBRs are hosted by the partner success manager and attended by Aegis Lens commercial leadership.";

export const PARTNER_QBR_NOTE_UK =
  "Щоквартальні партнерські бізнес-огляди (QBR) проводяться з партнерами-реселерами та системними інтеграторами. " +
  "Кожен QBR охоплює: огляд воронки, статус угод, оновлення дорожньої карти продукту, планування co-marketing та використання MDF. " +
  "QBR проводяться менеджером успіху партнера за участю комерційного керівництва Aegis Lens.";

export const DEAL_REG_CONFLICT_POLICY_EN =
  "Deal registration conflicts are resolved as follows: " +
  "(1) First valid deal registration wins — 'first-in' rule applies. " +
  "(2) Registration is valid for 90 days from submission, renewable once with partner success manager approval. " +
  "(3) If the same account is registered by two partners simultaneously, the partner with the prior registration date retains exclusivity. " +
  "(4) Aegis Lens direct sales will not re-engage a registered account without notifying the registering partner. " +
  "(5) Disputes are escalated to the VP of Partnerships within 5 business days.";

export const DEAL_REG_CONFLICT_POLICY_UK =
  "Конфлікти реєстрації угод вирішуються наступним чином: " +
  "(1) Перша дійсна реєстрація угоди виграє — діє правило 'першого'. " +
  "(2) Реєстрація дійсна протягом 90 днів з дати подання, продовжується один раз за погодженням менеджера успіху партнера. " +
  "(3) Якщо один і той самий акаунт зареєстрований двома партнерами одночасно, партнер з ранішою датою реєстрації зберігає ексклюзивність. " +
  "(4) Прямі продажі Aegis Lens не будуть знову залучатись до зареєстрованого акаунту без сповіщення партнера, що реєстрував. " +
  "(5) Суперечки ескалуються до VP з партнерств протягом 5 робочих днів.";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Compute first-year revshare payout for a referral or reseller partner.
 * Returns null for tiers with custom / negotiated revshare (OEM, systems integrator).
 *
 * Розраховує виплату revshare за перший рік для реферального або реселер-партнера.
 * Повертає null для рівнів з кастомним / узгодженим revshare (OEM, системний інтегратор).
 *
 * @param totalContractUsd  Total first-year contract value in USD.
 * @param tier              The partner program tier.
 * @returns                 Payout in USD, or null if revshare is custom.
 */
export function computeFirstYearRevshare(
  totalContractUsd: number,
  tier: PartnerTier
): number | null {
  const programTier = PARTNER_PROGRAM_TIERS.find((t) => t.id === tier);
  if (!programTier || programTier.revsharePercent === null) return null;
  return Math.round(totalContractUsd * programTier.revsharePercent * 100) / 100;
}

/**
 * Look up a partner program tier by its id.
 *
 * Пошук рівня партнерської програми за ідентифікатором.
 */
export function getPartnerProgramTier(
  tier: PartnerTier
): PartnerProgramTier | undefined {
  return PARTNER_PROGRAM_TIERS.find((t) => t.id === tier);
}
