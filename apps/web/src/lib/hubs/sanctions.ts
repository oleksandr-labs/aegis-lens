/**
 * Aegis Lens — Sanctions Hub
 * Pure lib module (no JSX/React). UTF-8. EN + UK strings.
 */

// ---------------------------------------------------------------------------
// URLs
// ---------------------------------------------------------------------------

export const SANCTIONS_HUB_URLS = {
  pillar: '/sanctions',
  jurisdictions: {
    un: '/sanctions/un',
    eu: '/sanctions/eu',
    us: '/sanctions/us',
    ukGov: '/sanctions/uk-gov',
    ua: '/sanctions/ua',
  },
} as const;

// ---------------------------------------------------------------------------
// Pillar narrative
// ---------------------------------------------------------------------------

export const sanctionsPillarNarrative = {
  en: `International sanctions are legal instruments used by governments and multilateral
bodies to restrict financial flows, travel, and commercial activity involving
designated individuals, entities, and states. Aegis Lens aggregates and cross-references
live sanctions lists from the UN Security Council, the European Union, the United States
(OFAC), His Majesty's Treasury (UK), and the Ukrainian government — providing a
unified search interface, change-history timelines, and compliance guidance for
due-diligence practitioners, journalists, and policy researchers.`,

  uk: `Міжнародні санкції — це правові інструменти, що застосовуються урядами та
багатосторонніми організаціями для обмеження фінансових потоків, переміщення осіб і
комерційної діяльності з боку визначених фізичних осіб, суб'єктів і держав. Aegis Lens
агрегує та перехресно звіряє актуальні санкційні списки ООН, Європейського Союзу, США
(OFAC), Казначейства Його Величності (Великобританія) та уряду України — забезпечуючи
єдиний пошуковий інтерфейс, часові шкали змін та рекомендації щодо дотримання
нормативних вимог для практиків due diligence, журналістів і дослідників у сфері політики.`,
} as const;

// ---------------------------------------------------------------------------
// Jurisdiction type & status
// ---------------------------------------------------------------------------

export type SanctionsJurisdiction = 'un' | 'eu' | 'us-ofac' | 'uk-hmrc' | 'ua';

export interface JurisdictionStatus {
  jurisdiction: SanctionsJurisdiction;
  name: string;
  listUrl: string;
  updateFrequency: string;
  entityCount: number;
  sancType: string[];
}

export const JURISDICTIONS_STATUS: JurisdictionStatus[] = [
  {
    jurisdiction: 'un',
    name: 'UN Security Council Consolidated List',
    listUrl: 'https://www.un.org/securitycouncil/content/un-sc-consolidated-list',
    updateFrequency: 'ad hoc (committee decisions)',
    entityCount: 900,
    sancType: ['asset freeze', 'travel ban', 'arms embargo'],
  },
  {
    jurisdiction: 'eu',
    name: 'EU Consolidated Financial Sanctions List',
    listUrl: 'https://data.europa.eu/data/datasets/consolidated-list-of-persons-groups-and-entities-subject-to-eu-financial-sanctions',
    updateFrequency: 'daily',
    entityCount: 2300,
    sancType: ['asset freeze', 'travel ban', 'trade restriction'],
  },
  {
    jurisdiction: 'us-ofac',
    name: 'OFAC Specially Designated Nationals (SDN)',
    listUrl: 'https://ofac.treasury.gov/specially-designated-nationals-and-blocked-persons-list-sdn-human-readable-lists',
    updateFrequency: 'multiple times per week',
    entityCount: 15000,
    sancType: ['asset freeze', 'trade ban', 'correspondent banking prohibition'],
  },
  {
    jurisdiction: 'uk-hmrc',
    name: "UK OFSI Consolidated List (His Majesty's Treasury)",
    listUrl: 'https://www.gov.uk/government/publications/financial-sanctions-consolidated-list-of-targets',
    updateFrequency: 'ad hoc',
    entityCount: 1800,
    sancType: ['asset freeze', 'travel ban', 'trade restriction'],
  },
  {
    jurisdiction: 'ua',
    name: 'Ukrainian NSDC Sanctions List',
    listUrl: 'https://sanctions.nsdc.gov.ua/',
    updateFrequency: 'ad hoc (NSDC decrees)',
    entityCount: 3500,
    sancType: ['asset freeze', 'blocking of economic activity', 'visa restriction'],
  },
];

// ---------------------------------------------------------------------------
// Sanctioned entity interface
// ---------------------------------------------------------------------------

export interface SanctionedEntity {
  entityId: string;
  name: string;
  aliases: string[];
  jurisdiction: SanctionsJurisdiction[];
  listed: string;        // ISO date string
  reason: string;
  kgSlug: string;        // knowledge-graph slug for deep-link
}

// ---------------------------------------------------------------------------
// Compliance use-cases
// ---------------------------------------------------------------------------

export interface ComplianceUseCase {
  id: 'due-diligence' | 'kyc' | 'supply-chain' | 'investment-screening';
  title: { en: string; uk: string };
  description: { en: string; uk: string };
  audience: { en: string; uk: string };
}

export const COMPLIANCE_USE_CASES: ComplianceUseCase[] = [
  {
    id: 'due-diligence',
    title: {
      en: 'Corporate Due Diligence',
      uk: 'Корпоративна перевірка (due diligence)',
    },
    description: {
      en: 'Screen counterparties, beneficial owners, and board members against all five major sanctions lists before entering a business relationship. Aegis Lens provides batch-screening APIs and human-readable change diffs.',
      uk: "Перевіряйте контрагентів, кінцевих бенефіціарів і членів ради директорів за п'ятьма основними санкційними списками перед встановленням ділових відносин. Aegis Lens надає API для масового скринінгу та зрозумілі дифи змін.",
    },
    audience: {
      en: 'Corporate counsel, M&A advisors, compliance officers',
      uk: 'Корпоративні юристи, консультанти з M&A, офіцери комплаєнсу',
    },
  },
  {
    id: 'kyc',
    title: {
      en: 'Know Your Customer (KYC)',
      uk: 'Знай свого клієнта (KYC)',
    },
    description: {
      en: 'Financial institutions use real-time sanctions screening as a mandatory KYC control gate. Our webhook-driven update alerts ensure screening databases stay current within minutes of list changes.',
      uk: 'Фінансові установи використовують скринінг санкцій у реальному часі як обов\'язковий контрольний вузол KYC. Сповіщення оновлень через вебхуки гарантують актуальність баз даних скринінгу протягом хвилин після змін у списках.',
    },
    audience: {
      en: 'Banks, payment processors, crypto exchanges',
      uk: 'Банки, платіжні процесори, криптовалютні біржі',
    },
  },
  {
    id: 'supply-chain',
    title: {
      en: 'Supply Chain Integrity',
      uk: 'Цілісність ланцюга постачання',
    },
    description: {
      en: 'Map supplier networks to detect indirect exposure to sanctioned entities — including subsidiary relationships, shipping agents, and port-of-loading flags associated with evasion networks.',
      uk: 'Картуйте мережі постачальників для виявлення непрямого контакту із санкційними суб\'єктами — включаючи дочірні структури, агентів з доставки та прапори порту завантаження, пов\'язані з мережами ухилення.',
    },
    audience: {
      en: 'Procurement teams, trade-finance desks, logistics firms',
      uk: 'Відділи закупівель, торговельно-фінансові підрозділи, логістичні компанії',
    },
  },
  {
    id: 'investment-screening',
    title: {
      en: 'Investment Screening',
      uk: 'Інвестиційний скринінг',
    },
    description: {
      en: 'Assess portfolio companies and fund investors for sanctions exposure before capital deployment. Includes sector-based restrictions (e.g., Russian energy and defence under EU/UK/US regimes).',
      uk: 'Оцінюйте портфельні компанії та інвесторів фонду на предмет санкційного ризику перед розміщенням капіталу. Включає секторні обмеження (наприклад, російська енергетика та оборона в рамках режимів ЄС/Великобританії/США).',
    },
    audience: {
      en: 'Private equity, hedge funds, sovereign wealth managers',
      uk: 'Приватний капітал, хедж-фонди, менеджери суверенних фондів',
    },
  },
];

// ---------------------------------------------------------------------------
// Sanctions updates feed config
// ---------------------------------------------------------------------------

export const SANCTIONS_UPDATES_FEED = {
  url: 'https://aegis-lens.uk/api/sanctions/feed.json',
  format: 'JSON' as const,
  updateInterval: 'PT15M',    // ISO 8601 duration — every 15 minutes
  fields: ['entityId', 'name', 'jurisdiction', 'action', 'effectiveDate', 'sourceUrl'],
} as const;

// ---------------------------------------------------------------------------
// FAQ (10 Q&As)
// ---------------------------------------------------------------------------

export interface FaqItem {
  question: { en: string; uk: string };
  answer: { en: string; uk: string };
}

export const SANCTIONS_FAQ: FaqItem[] = [
  {
    question: {
      en: 'What is a sanctions list?',
      uk: 'Що таке санкційний список?',
    },
    answer: {
      en: 'A sanctions list is an official register of individuals, organisations, vessels, or states subject to legally binding restrictions on financial transactions, travel, trade, or other activities, maintained by a government or multilateral body.',
      uk: 'Санкційний список — це офіційний реєстр фізичних осіб, організацій, суден або держав, які підпадають під юридично обов\'язкові обмеження щодо фінансових операцій, пересування, торгівлі або іншої діяльності, що ведеться урядом або багатосторонньою організацією.',
    },
  },
  {
    question: {
      en: 'What is the difference between UN, EU, US, and UK sanctions?',
      uk: 'У чому різниця між санкціями ООН, ЄС, США та Великобританії?',
    },
    answer: {
      en: 'UN sanctions require Security Council unanimity and are legally binding on all member states. EU, US, and UK regimes are autonomous — they can be broader or narrower than the UN baseline and reflect each jurisdiction\'s foreign-policy priorities.',
      uk: 'Санкції ООН вимагають одностайності Ради Безпеки та є юридично обов\'язковими для всіх держав-членів. Режими ЄС, США та Великобританії є автономними — вони можуть бути ширшими або вужчими за базовий рівень ООН і відображають зовнішньополітичні пріоритети кожної юрисдикції.',
    },
  },
  {
    question: {
      en: 'How often are sanctions lists updated?',
      uk: 'Як часто оновлюються санкційні списки?',
    },
    answer: {
      en: 'Update frequency varies by regime. OFAC (US) can update multiple times a week; the EU publishes changes in the Official Journal, often daily during active conflict periods; UN changes are ad hoc via committee decisions.',
      uk: 'Частота оновлень залежить від режиму. OFAC (США) може оновлюватися кілька разів на тиждень; ЄС публікує зміни в Офіційному журналі, часто щодня в активні конфліктні періоди; зміни ООН є позаплановими рішеннями комітету.',
    },
  },
  {
    question: {
      en: 'What does "designated" mean on a sanctions list?',
      uk: 'Що означає «внесено до списку» (designated) у санкційному переліку?',
    },
    answer: {
      en: '"Designated" means a competent authority has formally identified the individual or entity as subject to specific restrictions. Assets must be frozen and transactions blocked without a licence.',
      uk: '«Внесено до списку» означає, що компетентний орган офіційно визначив фізичну особу або суб\'єкта як підпорядкованих конкретним обмеженням. Активи підлягають заморозці, а транзакції — блокуванню без спеціального дозволу.',
    },
  },
  {
    question: {
      en: 'Can a company be fined for an inadvertent sanctions breach?',
      uk: 'Чи може компанія отримати штраф за ненавмисне порушення санкцій?',
    },
    answer: {
      en: 'Yes. Sanctions regimes (especially OFAC) impose strict liability — intent is not required for a violation to occur. However, robust compliance programmes and voluntary self-disclosure can significantly reduce penalties.',
      uk: 'Так. Санкційні режими (особливо OFAC) передбачають сувору відповідальність — намір не є обов\'язковою умовою для порушення. Однак надійні програми відповідності та добровільне саморозкриття можуть суттєво зменшити санкції.',
    },
  },
  {
    question: {
      en: 'What is an OFAC General Licence?',
      uk: 'Що таке Загальна ліцензія OFAC?',
    },
    answer: {
      en: 'A General Licence (GL) is a pre-authorised class exemption issued by OFAC that permits certain categories of transaction with designated parties without requiring an individual licence — for example, payment of legal fees or humanitarian assistance.',
      uk: 'Загальна ліцензія (GL) — це заздалегідь авторизоване класове виключення, видане OFAC, яке дозволяє певні категорії операцій з визначеними сторонами без необхідності отримання індивідуальної ліцензії — наприклад, оплата юридичних послуг або гуманітарна допомога.',
    },
  },
  {
    question: {
      en: 'How does Aegis Lens handle false positives in name matching?',
      uk: 'Як Aegis Lens обробляє хибні спрацювання при співставленні імен?',
    },
    answer: {
      en: 'Aegis Lens uses a multi-signal matching pipeline: transliteration normalisation, alias expansion, birth-date and nationality cross-checks, and a confidence score. Matches below the configured threshold are flagged for manual review rather than auto-blocked.',
      uk: 'Aegis Lens використовує багатосигнальний конвеєр зіставлення: нормалізацію транслітерації, розширення псевдонімів, перехресну перевірку дати народження та громадянства, а також оцінку впевненості. Збіги нижче налаштованого порогу позначаються для ручної перевірки, а не автоматичного блокування.',
    },
  },
  {
    question: {
      en: 'What are secondary sanctions?',
      uk: 'Що таке вторинні санкції?',
    },
    answer: {
      en: 'Secondary sanctions target non-US (or non-issuing-jurisdiction) entities that conduct significant transactions with primary sanctions targets. They extend the compliance obligation extraterritorially and are a key feature of US OFAC\'s Russia-related programmes.',
      uk: 'Вторинні санкції спрямовані на суб\'єктів (не громадян США або країни-емітента), які здійснюють значні операції з основними санкційними цілями. Вони поширюють зобов\'язання щодо відповідності екстратериторіально та є ключовою особливістю програм OFAC, пов\'язаних з Росією.',
    },
  },
  {
    question: {
      en: 'How does Ukraine\'s NSDC sanctions list relate to EU/US lists?',
      uk: 'Як санкційний список РНБО України пов\'язаний зі списками ЄС/США?',
    },
    answer: {
      en: 'Ukraine\'s National Security and Defence Council (NSDC) maintains an autonomous list that frequently includes individuals and entities not yet designated by the EU or US — particularly oligarchs and state-adjacent actors. Cross-referencing all five lists is best practice for Ukraine-focused compliance.',
      uk: 'Рада національної безпеки і оборони (РНБО) України веде автономний список, який часто включає фізичних осіб і суб\'єктів, ще не визначених ЄС або США — зокрема олігархів та пов\'язаних з державою акторів. Перехресна перевірка всіх п\'яти списків є кращою практикою для відповідності, орієнтованої на Україну.',
    },
  },
  {
    question: {
      en: 'Can sanctioned assets be unfrozen?',
      uk: 'Чи можна розморозити заморожені активи?',
    },
    answer: {
      en: 'Yes, through delisting or a specific licence. Delisting requires demonstrating to the competent authority that the designation criteria are no longer met. The UN 1267 Committee Ombudsperson and EU courts are the formal review mechanisms; individual delisting is rare but has occurred.',
      uk: 'Так, шляхом виключення зі списку або отримання спеціальної ліцензії. Виключення зі списку вимагає доведення компетентному органу того, що критерії визначення більше не відповідають дійсності. Омбудсмен Комітету ООН 1267 і суди ЄС є офіційними механізмами перегляду; індивідуальне виключення зі списку рідкісне, але траплялося.',
    },
  },
];
