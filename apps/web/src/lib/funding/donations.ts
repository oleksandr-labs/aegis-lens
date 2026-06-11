/**
 * Donations & patronage — tiers, channels, rules, and templates.
 *
 * Пожертвування та патронаж — рівні, канали, правила та шаблони.
 *
 * Source: TODO/monetization/TODO_donations_patronage.md
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PatronageTier {
  id: string;
  name_en: string;
  name_uk: string;
  monthlyAmountUsd: number;
  perks_en: string[];
  perks_uk: string[];
  /** Short label shown on the donor wall badge */
  badgeLabel: string;
  /** Stripe Product ID — set when created in Stripe dashboard */
  stripeProductId?: string;
}

export type DonationChannel =
  | "stripe"
  | "paypal"
  | "crypto-btc"
  | "crypto-eth"
  | "crypto-usdt"
  | "ua-bank"
  | "open-collective"
  | "donor-advised-fund";

// ── Patronage Tiers ───────────────────────────────────────────────────────────

/**
 * Five-tier patronage ladder.
 * Perks are cumulative: higher tiers include all lower-tier perks.
 *
 * Пʼятирівнева структура патронажу.
 * Переваги накопичувальні.
 */
export const PATRONAGE_TIERS: PatronageTier[] = [
  {
    id: "supporter",
    name_en: "Supporter",
    name_uk: "Прихильник",
    monthlyAmountUsd: 3,
    perks_en: [
      "Ad-free public directory",
      "Supporter badge on profile",
      "Monthly digest email with platform updates",
    ],
    perks_uk: [
      "Публічний каталог без реклами",
      "Значок прихильника в профілі",
      "Щомісячний дайджест із оновленнями платформи",
    ],
    badgeLabel: "Supporter",
  },
  {
    id: "contributor",
    name_en: "Contributor",
    name_uk: "Учасник",
    monthlyAmountUsd: 10,
    perks_en: [
      "All Supporter perks",
      "Ambassador badge on public profile",
      "Behind-the-scenes product brief (monthly)",
      "Early access to beta features",
    ],
    perks_uk: [
      "Усі переваги Прихильника",
      "Значок амбасадора в публічному профілі",
      "Щомісячний огляд продукту за лаштунками",
      "Ранній доступ до бета-функцій",
    ],
    badgeLabel: "Contributor",
  },
  {
    id: "analyst",
    name_en: "Analyst",
    name_uk: "Аналітик",
    monthlyAmountUsd: 25,
    perks_en: [
      "All Contributor perks",
      "Named on donor wall (opt-in)",
      "Quarterly Q&A with the team (group call)",
      "Access to raw research notes (Analyst Notes channel)",
    ],
    perks_uk: [
      "Усі переваги Учасника",
      "Ім'я на стіні донорів (за бажанням)",
      "Щоквартальний Q&A з командою (груповий дзвінок)",
      "Доступ до необроблених дослідницьких нотаток",
    ],
    badgeLabel: "Analyst",
  },
  {
    id: "patron",
    name_en: "Patron",
    name_uk: "Патрон",
    monthlyAmountUsd: 100,
    perks_en: [
      "All Analyst perks",
      "Annual 1:1 call with founding team (30 min)",
      "Name in annual transparency report (opt-in)",
      "Priority feedback channel for feature requests",
    ],
    perks_uk: [
      "Усі переваги Аналітика",
      "Щорічний індивідуальний дзвінок із командою засновників (30 хв)",
      "Ім'я в щорічному звіті про прозорість (за бажанням)",
      "Пріоритетний канал зворотного зв'язку для запитів на функції",
    ],
    badgeLabel: "Patron",
  },
  {
    id: "founding-patron",
    name_en: "Founding Patron",
    name_uk: "Фундаторський Патрон",
    monthlyAmountUsd: 500,
    perks_en: [
      "All Patron perks",
      "Named as Founding Patron in all major communications",
      "Quarterly strategic briefing (private group call with team)",
      "Input into civic feature roadmap (non-binding advisory)",
      "Complimentary Pro+ subscription for the duration of patronage",
    ],
    perks_uk: [
      "Усі переваги Патрона",
      "Зазначений як Фундаторський Патрон у всіх ключових комунікаціях",
      "Щоквартальний стратегічний брифінг (приватний груповий дзвінок)",
      "Участь у формуванні дорожньої карти громадянських функцій (дорадчо)",
      "Безкоштовна підписка Pro+ на весь час патронажу",
    ],
    badgeLabel: "Founding Patron",
  },
];

// ── Donation Channels ─────────────────────────────────────────────────────────

/**
 * Supported donation channels with enablement status and minimum amounts.
 *
 * Підтримувані канали пожертвувань.
 */
export const DONATION_CHANNELS: {
  channel: DonationChannel;
  enabled: boolean;
  minAmountUsd: number;
  notes_en: string;
}[] = [
  {
    channel: "stripe",
    enabled: true,
    minAmountUsd: 1,
    notes_en: "Primary channel. Supports one-off and recurring. Card + Apple/Google Pay.",
  },
  {
    channel: "paypal",
    enabled: true,
    minAmountUsd: 1,
    notes_en: "Secondary channel for users without card access. Redirect flow.",
  },
  {
    channel: "crypto-btc",
    enabled: true,
    minAmountUsd: 10,
    notes_en: "Bitcoin donations via static wallet address. No receipt automation yet.",
  },
  {
    channel: "crypto-eth",
    enabled: true,
    minAmountUsd: 5,
    notes_en: "Ethereum donations via static wallet address.",
  },
  {
    channel: "crypto-usdt",
    enabled: true,
    minAmountUsd: 5,
    notes_en: "USDT (TRC-20 or ERC-20) for stablecoin donors.",
  },
  {
    channel: "ua-bank",
    enabled: true,
    minAmountUsd: 1,
    notes_en:
      "Ukrainian bank account for UAH donations. Primary channel for UA-based " +
      "donors. Mono/Privat bank QR codes on donation page.",
  },
  {
    channel: "open-collective",
    enabled: false,
    minAmountUsd: 1,
    notes_en:
      "Open Collective fiscal host — transparent public ledger. " +
      "Enable once fiscal sponsorship is established. Pending.",
  },
  {
    channel: "donor-advised-fund",
    enabled: false,
    minAmountUsd: 500,
    notes_en:
      "Fidelity / Schwab Charitable / similar DAF pipeline. " +
      "Requires 501(c)(3) or equivalently recognised entity. Pending legal setup.",
  },
];

// ── Anti-Pattern Guards ───────────────────────────────────────────────────────

/**
 * Non-negotiable rules for donation UX and data handling.
 *
 * Незмінні правила UX пожертвувань та обробки даних.
 */
export const DONATION_ANTI_PATTERNS: { rule_en: string; rule_uk: string }[] = [
  {
    rule_en:
      "No tier-gated 'must donate to use safety features' — civic safety features " +
      "are permanently free. Never paywall evacuation routes, shelter locations, " +
      "or active-incident alerts.",
    rule_uk:
      "Жодних функцій безпеки за умови пожертвування — функції громадянської " +
      "безпеки є постійно безкоштовними. Ніколи не закривати платним доступом " +
      "маршрути евакуації, місця укриттів або сповіщення про активні інциденти.",
  },
  {
    rule_en:
      "No dark-pattern nudges. No countdown timers on donation prompts, " +
      "no guilt-framing copy, no pre-checked recurring donation upsells, " +
      "no exit-intent popups demanding donations.",
    rule_uk:
      "Жодних маніпулятивних прийомів. Без таймерів зворотного відліку, " +
      "без тексту з відчуттям провини, без заздалегідь відмічених " +
      "повторюваних пожертвувань, без спливаючих вікон при виході.",
  },
  {
    rule_en:
      "Donor data is not sold, rented, shared with third parties, or used " +
      "for advertising targeting. Donor emails are stored only for receipt " +
      "and transparency-report opt-in purposes.",
    rule_uk:
      "Дані донорів не продаються, не передаються в оренду, не надаються " +
      "третім особам і не використовуються для таргетованої реклами. " +
      "Електронні адреси зберігаються лише для квитанцій та звітності.",
  },
];

// ── Donor Wall Config ─────────────────────────────────────────────────────────

/**
 * Configuration for the public donor recognition wall on the Trust Center.
 *
 * Конфігурація публічної стіни визнання донорів у Центрі довіри.
 */
export const DONOR_WALL_CONFIG: {
  optIn: boolean;
  anonymousOption: boolean;
  displayFormat: "name" | "amount-range" | "both";
} = {
  optIn: true,
  anonymousOption: true,
  displayFormat: "both",
};

// ── Tax Receipt Builder ───────────────────────────────────────────────────────

/**
 * Build a tax receipt data template for a donation.
 * Returns a Markdown-formatted receipt string for rendering or PDF export.
 *
 * Генерує шаблон даних податкової квитанції для пожертвування.
 */
export function buildTaxReceiptData(donation: {
  amount: number;
  currency: string;
  donorEmail: string;
  channel: DonationChannel;
}): string {
  const date = new Date().toISOString().split("T")[0];
  const receiptId = `RECEIPT-${Date.now()}`;

  return [
    `# Donation Receipt`,
    ``,
    `**Receipt ID:** ${receiptId}`,
    `**Date:** ${date}`,
    `**Amount:** ${donation.amount.toFixed(2)} ${donation.currency.toUpperCase()}`,
    `**Channel:** ${donation.channel}`,
    `**Donor Email:** ${donation.donorEmail}`,
    ``,
    `---`,
    ``,
    `**Organisation:** Aegis Lens / [LEGAL ENTITY NAME]`,
    `**Registration:** [REGISTRATION NUMBER]`,
    `**Address:** [REGISTERED ADDRESS]`,
    ``,
    `This donation was made to support the civic mission of Aegis Lens, ` +
      `an open-source intelligence platform for conflict monitoring and ` +
      `humanitarian information services.`,
    ``,
    `---`,
    ``,
    `**Tax Deductibility Disclaimer:**`,
    ``,
    `_US donors:_ This organisation [is / is not yet] recognised as a ` +
      `501(c)(3) tax-exempt organisation. Until 501(c)(3) status is confirmed, ` +
      `donations may not be tax-deductible under US law. Please consult your ` +
      `tax advisor.`,
    ``,
    `_UK donors:_ This organisation [is / is not yet] registered as a charity ` +
      `with the Charity Commission for England and Wales. Gift Aid may not apply ` +
      `until charitable status is confirmed.`,
    ``,
    `_EU donors:_ Tax deductibility varies by member state. Please consult ` +
      `your local tax authority.`,
    ``,
    `_Ukrainian donors:_ [LEGAL ENTITY NAME] is [registered / pending ` +
      `registration] as a non-profit organisation in Ukraine under the Civil Code.`,
    ``,
    `For questions about this receipt, contact: donations@aegislens.uk`,
  ].join("\n");
}

// ── Transparency Report Templates ─────────────────────────────────────────────

/**
 * Quarterly transparency report template (English).
 *
 * Шаблон щоквартального звіту про прозорість (англійська).
 */
export const TRANSPARENCY_REPORT_TEMPLATE_EN = `# Aegis Lens — Quarterly Transparency Report
## Q[N] [YEAR]

> Published: [DATE]
> Period: [START DATE] – [END DATE]

---

## Donation & Patronage Income

| Channel | Amount (USD) | Donor Count | Notes |
|---|---|---|---|
| Stripe (one-off) | $[X] | [N] | — |
| Stripe (recurring) | $[X] | [N] | Monthly patrons |
| PayPal | $[X] | [N] | — |
| Crypto (BTC/ETH/USDT) | $[X] | [N] | Converted at receipt |
| UA Bank | $[X equiv.] | [N] | UAH converted at avg. rate |
| Open Collective | $[X] | [N] | — |
| **Total** | **$[TOTAL]** | **[N total]** | — |

---

## How Donated Funds Were Used

| Category | Amount Spent | Description |
|---|---|---|
| Infrastructure (servers, data APIs) | $[X] | [Detail] |
| Civic access grants (journalists/NGOs/UA) | $[X equiv.] | [N beneficiaries] |
| Product development | $[X] | [Feature(s)] |
| Translation & localisation | $[X] | [Languages] |
| Security audit | $[X] | [Auditor, if any] |
| **Total Spent** | **$[TOTAL]** | — |

---

## Grant Income (this quarter)

| Grant | Funder | Amount | Status |
|---|---|---|---|
| [GRANT NAME] | [FUNDER] | $[X] | [Active / Closed] |

---

## Civic Access Granted (Free / Discounted)

| Programme | Users Granted Access | Equiv. Value |
|---|---|---|
| Journalist grant | [N] | $[X] |
| NGO grant | [N] | $[X] |
| Ukrainian resident discount | [N] | $[X] |
| Academic / student | [N] | $[X] |

---

## Next Quarter Plans

[Narrative: what donated funds will support in Q[N+1]]

---

*For questions: transparency@aegislens.uk*
`;

/**
 * Quarterly transparency report template (Ukrainian).
 *
 * Шаблон щоквартального звіту про прозорість (українська).
 */
export const TRANSPARENCY_REPORT_TEMPLATE_UK = `# Aegis Lens — Щоквартальний звіт про прозорість
## Q[N] [РІК]

> Опубліковано: [ДАТА]
> Період: [ПОЧАТОК] – [КІНЕЦЬ]

---

## Доходи від пожертвувань та патронажу

| Канал | Сума (USD) | Кількість донорів | Примітки |
|---|---|---|---|
| Stripe (разові) | $[X] | [N] | — |
| Stripe (регулярні) | $[X] | [N] | Щомісячні патрони |
| PayPal | $[X] | [N] | — |
| Крипто (BTC/ETH/USDT) | $[X] | [N] | Конвертовано при отриманні |
| Українські банки | $[X екв.] | [N] | Гривня за середнім курсом |
| Open Collective | $[X] | [N] | — |
| **Разом** | **$[ВСЬОГО]** | **[N всього]** | — |

---

## Використання пожертвуваних коштів

| Категорія | Витрачено | Опис |
|---|---|---|
| Інфраструктура (сервери, API даних) | $[X] | [Деталі] |
| Гранти доступу (журналісти/НКО/UA) | $[X екв.] | [N бенефіціарів] |
| Розробка продукту | $[X] | [Функції] |
| Переклад та локалізація | $[X] | [Мови] |
| Аудит безпеки | $[X] | [Аудитор] |
| **Разом витрачено** | **$[ВСЬОГО]** | — |

---

## Грантові доходи (цього кварталу)

| Грант | Фандер | Сума | Статус |
|---|---|---|---|
| [НАЗВА ГРАНТУ] | [ФАНДЕР] | $[X] | [Активний / Закрито] |

---

## Надано громадянського доступу (безкоштовно / зі знижкою)

| Програма | Користувачів | Еквівалентна вартість |
|---|---|---|
| Грант для журналістів | [N] | $[X] |
| Грант для НКО | [N] | $[X] |
| Знижка для мешканців України | [N] | $[X] |
| Академічні / студентські | [N] | $[X] |

---

## Плани на наступний квартал

[Наратив: на що будуть спрямовані кошти у Q[N+1]]

---

*Питання: transparency@aegislens.uk*
`;
