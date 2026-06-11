/**
 * Traders & Financial Analysts persona — geopolitical signal → financial alpha.
 * Persona strategy: docs/audiences/personas.md §P8
 *
 * COMPLIANCE NOTE: Pure OSINT pedigree (no insider info, no non-public data).
 * Do not make microsecond latency claims — measure end-to-end before marketing.
 */

import type { PersonaFeatureSet, PersonaUseCase } from './types';

// ---------------------------------------------------------------------------
// Persona descriptors
// ---------------------------------------------------------------------------

export const TRADERS_FINANCE_FEATURES: PersonaFeatureSet = {
  personaId: 'trader-finance',
  name_en: 'Trader & Financial Analyst',
  name_uk: 'Трейдер і фінансовий аналітик',
  description_en:
    'Financial-services analysts and traders converting geopolitical signal into actionable ' +
    'financial alpha — fast, structured, machine-readable. Pure OSINT pedigree; no insider ' +
    'information or non-public data.',
  description_uk:
    'Аналітики фінансових послуг і трейдери, що перетворюють геополітичні сигнали на ' +
    'придатну до дії фінансову альфу — швидко, структуровано, машинозчитувально. ' +
    'Виключно на основі OSINT; жодної інсайдерської або непублічної інформації.',
  recommendedTier: 'pro',
  keyFeatures_en: [
    'Commodity-impact tagging: energy infra hits → gas/oil; grain corridors; metals',
    'Asset-mapping layer: refineries, ports, pipelines, mines (public sources only)',
    'Pre-market AI brief at 06:00 ET and 06:00 CET',
    'Event → ticker mapping (curated)',
    'Low-latency alert webhooks (target < 5 s after verification)',
    'Backtestable historical dataset',
    'Bloomberg / Refinitiv-style snippet exports',
    'Anomaly score time-series per region as a feature for quant models',
    '/finance use-case page',
    '"Geopolitical alpha" content series',
    'Quant-friendly dataset documentation',
    'Per-tier latency SLA with webhook push',
    'Compliance: pure OSINT pedigree documentation',
  ],
  keyFeatures_uk: [
    'Теги впливу на сировинні товари: удари по енергетичній інфраструктурі → газ/нафта; зернові коридори; метали',
    'Шар картографування активів: НПЗ, порти, трубопроводи, шахти (лише публічні джерела)',
    'Ранковий AI-бриф о 06:00 ET та 06:00 CET',
    'Зіставлення подій з тікерами (куровано)',
    'Вебхуки оповіщень з низькою затримкою (ціль < 5 с після верифікації)',
    'Ретроспективний набір даних для бектесту',
    'Експорт зведень у стилі Bloomberg / Refinitiv',
    'Часовий ряд оцінки аномалій за регіонами як ознака для квантових моделей',
    'Сторінка варіанту використання /finance',
    'Контент-серія «Геополітична альфа»',
    'Документація набору даних, зручна для квантових аналітиків',
    'SLA затримки по рівнях з push-вебхуком',
    'Відповідність: документація щодо чистоти OSINT-родоводу',
  ],
  onboardingPath: [
    '/onboarding/welcome',
    '/onboarding/finance-use-case',
    '/onboarding/webhook-setup',
    '/onboarding/ticker-mapping',
    '/onboarding/historical-dataset',
  ],
  ctas: {
    primary_en: 'Start free trial — Finance tier',
    primary_uk: 'Почати безкоштовне пробне використання — Фінансовий рівень',
    secondary_en: 'View sample data export',
    secondary_uk: 'Переглянути зразок експорту даних',
  },
  landingPageSlug: 'trader-finance',
};

export const TRADERS_USE_CASE: PersonaUseCase = {
  personaId: 'trader-finance',
  jobToBeDone_en:
    'Get structured, machine-readable geopolitical signals fast enough to inform pre-market ' +
    'positioning and quantitative models, with full OSINT-pedigree documentation for ' +
    'compliance sign-off.',
  jobToBeDone_uk:
    'Отримувати структуровані, машинозчитувані геополітичні сигнали достатньо швидко ' +
    'для позиціонування перед відкриттям ринку та квантових моделей, із повною ' +
    'документацією OSINT-родоводу для затвердження відповідальності.',
  painPoints_en: [
    'Geopolitical events move markets before structured data arrives via traditional feeds',
    'Manual monitoring of conflict sources is not scalable for trading desks',
    'Compliance teams require explicit pedigree: no insider info, no non-public data',
    'Bloomberg / Refinitiv alerts are structured but miss OSINT-sourced early signals',
    'Historical dataset unavailable from most OSINT platforms — no backtesting possible',
    'Webhook delivery is unreliable or high-latency in competing tools',
  ],
  workflow_en: [
    'Receive pre-market AI brief at 06:00 ET with commodity-impact summary',
    'Review high-confidence events with commodity and ticker tags',
    'Monitor real-time webhook stream for new verified events',
    'Pull anomaly score time-series for affected region via API',
    'Cross-reference event against asset-mapping layer to quantify exposure',
    'Export Bloomberg-style snippet for desk morning note',
    'Archive event in backtestable dataset for quant model training',
  ],
  keyDifferentiators_en: [
    'Commodity-impact tagging converts raw events to tradeable signals automatically',
    'Sub-5-second webhook delivery (Pro/Enterprise tiers) beats traditional alert services',
    'Historical archive enables backtesting — no other OSINT platform offers this',
    'Full OSINT pedigree documentation satisfies compliance and legal review',
    'Anomaly score time-series is a drop-in feature for quant models',
  ],
};

// ---------------------------------------------------------------------------
// Market signal types
// ---------------------------------------------------------------------------

export const MARKET_SIGNAL_TYPES: {
  signalType: string;
  description_en: string;
  exampleEvents_en: string[];
  leadTimeTypical: string;
  latencyRequired: string;
}[] = [
  {
    signalType: 'energy-supply-disruption',
    description_en:
      'Strikes or damage to energy infrastructure: pipelines, refineries, power generation, ' +
      'or transmission assets affecting supply flow.',
    exampleEvents_en: [
      'Pipeline terminal fire confirmed via satellite',
      'Refinery production halt following strike',
      'Power grid segment disruption affecting industrial consumers',
    ],
    leadTimeTypical: '30 min – 4 h ahead of newswire',
    latencyRequired: '< 5 s',
  },
  {
    signalType: 'logistics-shipping-disruption',
    description_en:
      'Closure, mining, or interdiction of key shipping lanes, rail lines, or road arteries ' +
      'that route commodity exports.',
    exampleEvents_en: [
      'Port closure confirmed by AIS vessel pattern change',
      'Bridge strike disrupting grain export corridor',
      'Rail hub damage affecting containerised cargo flow',
    ],
    leadTimeTypical: '1 – 6 h ahead of newswire',
    latencyRequired: '< 10 s',
  },
  {
    signalType: 'commodity-region-damage',
    description_en:
      'Physical damage to commodity-producing regions: grain fields, mining operations, ' +
      'or agricultural processing facilities.',
    exampleEvents_en: [
      'Grain silo cluster destruction in major producing oblast',
      'Open-pit mine suspended due to proximity to active conflict',
      'Agricultural equipment depot strike',
    ],
    leadTimeTypical: '2 – 12 h ahead of newswire',
    latencyRequired: '< 30 s',
  },
  {
    signalType: 'regulatory-sanctions-change',
    description_en:
      'New sanctions designations, export controls, or regulatory decisions affecting ' +
      'counterparty risk or commodity flows.',
    exampleEvents_en: [
      'New entity added to OFAC SDN list',
      'Export licence revoked for dual-use technology category',
      'EU Council adopts new sanctions package',
    ],
    leadTimeTypical: 'Minutes (official publication) – real-time',
    latencyRequired: '< 5 s',
  },
  {
    signalType: 'key-infrastructure-strike',
    description_en:
      'Confirmed strike on infrastructure with direct market implications: energy hubs, ' +
      'industrial facilities, or critical transport nodes.',
    exampleEvents_en: [
      'Thermal power plant turbine hall destroyed',
      'Steel works production halted after strike',
      'Gas compressor station taken offline',
    ],
    leadTimeTypical: '15 min – 2 h ahead of newswire',
    latencyRequired: '< 5 s',
  },
  {
    signalType: 'political-instability-spillover',
    description_en:
      'Political events — leadership changes, coup indicators, border tensions — that ' +
      'signal elevated counterparty, currency, or sovereign risk in adjacent markets.',
    exampleEvents_en: [
      'Emergency decree suspending parliamentary session',
      'Central bank governor resignation announced',
      'Border force mobilisation detected via satellite',
    ],
    leadTimeTypical: '30 min – 8 h ahead of market repricing',
    latencyRequired: '< 30 s',
  },
];

// ---------------------------------------------------------------------------
// Finance latency SLA
// ---------------------------------------------------------------------------

export const FINANCE_LATENCY_SLA: {
  tier: string;
  maxLatencyMs: number;
  webhookPush: boolean;
  slaGuarantee: boolean;
}[] = [
  {
    tier: 'free',
    maxLatencyMs: 300000, // 5 min
    webhookPush: false,
    slaGuarantee: false,
  },
  {
    tier: 'observer',
    maxLatencyMs: 60000, // 1 min
    webhookPush: false,
    slaGuarantee: false,
  },
  {
    tier: 'pro',
    maxLatencyMs: 5000, // 5 s target
    webhookPush: true,
    slaGuarantee: false,
  },
  {
    tier: 'enterprise',
    maxLatencyMs: 2000, // 2 s target with SLA
    webhookPush: true,
    slaGuarantee: true,
  },
];
