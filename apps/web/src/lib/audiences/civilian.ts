/**
 * Civilian persona — safety features (all free, no paywall), free guarantee, audit record.
 * Persona strategy: docs/audiences/personas.md §P1
 *
 * KEY CONSTRAINT: All civilian safety features are free forever.
 * Misinformation harm risk is highest for this persona — conservative thresholds,
 * plain-language labels (Calm / Elevated / Active / High), never raw danger scores.
 */

import type { PersonaFeatureSet, PersonaUseCase } from './types';

// ---------------------------------------------------------------------------
// Persona descriptors
// ---------------------------------------------------------------------------

export const CIVILIAN_FEATURES: PersonaFeatureSet = {
  personaId: 'civilian',
  name_en: 'Civilian',
  name_uk: 'Цивільний',
  description_en:
    'Informed civilians answering "Is it safe here? What is happening near me or my family?" ' +
    'Mobile-first, plain-language, no jargon. All safety features are free forever.',
  description_uk:
    'Поінформовані цивільні, які шукають відповідь: «Чи безпечно тут? Що відбувається ' +
    'поблизу мене або моєї родини?» Мобільний пріоритет, зрозумілі тексти, без жаргону. ' +
    'Усі функції безпеки безкоштовні назавжди.',
  recommendedTier: 'free',
  keyFeatures_en: [
    'Air alert map — real-time alerts with region scope (always free)',
    'Nearest shelter finder with walking and driving directions (always free)',
    'Evacuation routes — current safe passage corridors (always free)',
    'Safe passage corridors — live status (always free)',
    'Medical facility locations — hospitals, clinics, pharmacies (always free)',
    'Missing person cross-reference — public search tool (always free)',
    'Family reunification resources — directory and contact list (always free)',
    'Emergency contact numbers — per-region directory (always free)',
    'Simple "safety near me" view — geolocation-based, opt-in (always free)',
    'Air-raid push notifications via PWA, browser, and Telegram bot (always free)',
    'Family watchlist — save locations, receive region-scoped alerts (always free)',
    'Plain-language event summaries with severity labels: Calm / Elevated / Active / High',
    'Daily digest email — low frequency, opt-in (always free)',
    'Regional safety pages /safety/<region>',
    'Mobile-first PWA installable experience',
  ],
  keyFeatures_uk: [
    'Карта повітряних тривог — сповіщення в реальному часі за регіоном (завжди безкоштовно)',
    'Пошук найближчого укриття з маршрутами пішки та на автомобілі (завжди безкоштовно)',
    'Маршрути евакуації — актуальні безпечні коридори (завжди безкоштовно)',
    'Безпечні коридори — статус у реальному часі (завжди безкоштовно)',
    'Розташування медичних закладів — лікарні, клініки, аптеки (завжди безкоштовно)',
    'Пошук зниклих осіб — публічний інструмент пошуку (завжди безкоштовно)',
    'Ресурси возз\'єднання сімей — довідник і список контактів (завжди безкоштовно)',
    'Екстрені номери телефонів — довідник за регіонами (завжди безкоштовно)',
    'Простий огляд «безпека поруч» — на основі геолокації, за погодженням (завжди безкоштовно)',
    'Push-сповіщення про повітряну тривогу через PWA, браузер і Telegram-бот (завжди безкоштовно)',
    'Сімейний список відстеження — збереження місць, сповіщення за регіоном (завжди безкоштовно)',
    'Зрозумілі зведення подій з рівнями серйозності: Спокійно / Підвищено / Активно / Висок',
    'Щоденний дайджест електронною поштою — рідко, за погодженням (завжди безкоштовно)',
    'Регіональні сторінки безпеки /safety/<регіон>',
    'Мобільний PWA-застосунок для встановлення',
  ],
  onboardingPath: [
    '/onboarding/welcome',
    '/onboarding/safety-overview',
    '/onboarding/enable-notifications',
    '/onboarding/family-watchlist',
    '/onboarding/shelter-finder',
  ],
  ctas: {
    primary_en: 'Check safety near me — free',
    primary_uk: 'Перевірити безпеку поруч — безкоштовно',
    secondary_en: 'Enable air-raid alerts',
    secondary_uk: 'Увімкнути сповіщення про тривоги',
  },
  landingPageSlug: 'civilian',
};

export const CIVILIAN_USE_CASE: PersonaUseCase = {
  personaId: 'civilian',
  jobToBeDone_en:
    'Quickly understand whether a location is safe, receive timely alerts for family members, ' +
    'and find shelter or evacuation routes — without needing any OSINT expertise.',
  jobToBeDone_uk:
    'Швидко зрозуміти, чи безпечне місце, отримувати своєчасні сповіщення для членів ' +
    'сім\'ї та знаходити укриття або маршрути евакуації — без будь-яких знань OSINT.',
  painPoints_en: [
    'Raw event feeds are alarming and hard to interpret without context',
    'Shelter locations and evacuation routes change — static lists become dangerous',
    'No single trusted source for air-raid alerts, shelters, and family safety',
    'Low-bandwidth mobile conditions in conflict areas make heavy apps unusable',
    'Paywalls on safety tools are morally unacceptable in active conflict',
    'Missing-person search requires contacting multiple fragmented registries',
  ],
  workflow_en: [
    'Open safety map — view region safety label (Calm / Elevated / Active / High)',
    'Receive push notification when alert status changes in a watched region',
    'Find nearest shelter with walking route and occupancy status',
    'Check evacuation route corridors before travel',
    'Cross-reference missing person in public database',
    'Access emergency contacts for the relevant region',
    'Read plain-language event summary — no jargon, just clear severity and context',
  ],
  keyDifferentiators_en: [
    'All safety features permanently free — no upsell, no paywall, no exception',
    'Plain-language severity labels prevent misinterpretation (no raw danger scores)',
    'PWA works on low-end devices with limited connectivity',
    'Family watchlist covers multiple locations with a single notification stream',
    'Shelter finder updates in near-real-time as status changes',
  ],
};

// ---------------------------------------------------------------------------
// Civilian safety features (all free)
// ---------------------------------------------------------------------------

export const CIVILIAN_SAFETY_FEATURES: {
  id: string;
  name_en: string;
  name_uk: string;
  alwaysFree: boolean;
  requiresLogin: boolean;
  description_en: string;
}[] = [
  {
    id: 'air-alert-map',
    name_en: 'Air Alert Map',
    name_uk: 'Карта повітряних тривог',
    alwaysFree: true,
    requiresLogin: false,
    description_en:
      'Real-time map of active air-raid alerts across all regions. ' +
      'Shows regional status with plain-language severity labels.',
  },
  {
    id: 'shelter-finder',
    name_en: 'Nearest Shelter Finder',
    name_uk: 'Пошук найближчого укриття',
    alwaysFree: true,
    requiresLogin: false,
    description_en:
      'Locates the nearest official shelters with walking and driving directions, ' +
      'capacity estimates, and last-verified status.',
  },
  {
    id: 'evacuation-routes',
    name_en: 'Evacuation Routes',
    name_uk: 'Маршрути евакуації',
    alwaysFree: true,
    requiresLogin: false,
    description_en:
      'Current government-announced and community-verified evacuation corridors, ' +
      'updated in real-time as announcements are made.',
  },
  {
    id: 'safe-passage-corridors',
    name_en: 'Safe Passage Corridors',
    name_uk: 'Безпечні коридори',
    alwaysFree: true,
    requiresLogin: false,
    description_en:
      'Live status of humanitarian corridors, including open/closed state, ' +
      'transit points, and known hazards.',
  },
  {
    id: 'medical-facilities',
    name_en: 'Medical Facility Locations',
    name_uk: 'Розташування медичних закладів',
    alwaysFree: true,
    requiresLogin: false,
    description_en:
      'Map of operational hospitals, clinics, emergency rooms, and pharmacies ' +
      'with contact details and current operational status.',
  },
  {
    id: 'missing-person-search',
    name_en: 'Missing Person Cross-Reference',
    name_uk: 'Пошук зниклих осіб',
    alwaysFree: true,
    requiresLogin: false,
    description_en:
      'Public cross-reference tool that searches across multiple missing-person registries ' +
      'simultaneously. No personal data stored.',
  },
  {
    id: 'family-reunification',
    name_en: 'Family Reunification Resources',
    name_uk: 'Ресурси возз\'єднання сімей',
    alwaysFree: true,
    requiresLogin: false,
    description_en:
      'Directory of official and NGO family reunification services with direct contact ' +
      'information, organised by region.',
  },
  {
    id: 'emergency-contacts',
    name_en: 'Emergency Contact Numbers',
    name_uk: 'Екстрені номери телефонів',
    alwaysFree: true,
    requiresLogin: false,
    description_en:
      'Per-region directory of emergency services: police, fire, medical, civil defence, ' +
      'and humanitarian helplines.',
  },
  {
    id: 'safety-near-me',
    name_en: 'Safety Near Me',
    name_uk: 'Безпека поруч',
    alwaysFree: true,
    requiresLogin: false,
    description_en:
      'Opt-in geolocation view that shows safety status, nearby shelters, and active alerts ' +
      'for the user\'s current location. No location data stored server-side.',
  },
  {
    id: 'family-watchlist',
    name_en: 'Family Watchlist',
    name_uk: 'Список відстеження родини',
    alwaysFree: true,
    requiresLogin: true,
    description_en:
      'Save multiple locations (home, school, relatives) and receive alerts whenever ' +
      'the safety status of those regions changes.',
  },
];

// ---------------------------------------------------------------------------
// Free guarantee (non-negotiable policy statement)
// ---------------------------------------------------------------------------

export const CIVILIAN_FREE_GUARANTEE_EN =
  'All civilian safety features — including air-raid alerts, shelter finder, evacuation routes, ' +
  'safe passage corridors, medical facility locations, missing person search, family reunification ' +
  'resources, and emergency contacts — are FREE FOREVER. ' +
  'No paywall, no subscription, no upsell will ever be placed between a civilian and safety information. ' +
  'This is a non-negotiable product commitment of Aegis Lens.';

export const CIVILIAN_FREE_GUARANTEE_UK =
  'Усі функції безпеки для цивільних — включаючи сповіщення про повітряні тривоги, ' +
  'пошук укриттів, маршрути евакуації, безпечні коридори, розташування медичних закладів, ' +
  'пошук зниклих осіб, ресурси возз\'єднання сімей та екстрені контакти — ' +
  'БЕЗКОШТОВНІ НАЗАВЖДИ. ' +
  'Жодний платіжний бар\'єр, передплата або спроба продати додаткові послуги ніколи ' +
  'не стане між цивільною людиною та інформацією безпеки. ' +
  'Це беззастережне зобов\'язання продукту Aegis Lens.';

// ---------------------------------------------------------------------------
// Safety feature audit record
// ---------------------------------------------------------------------------

export const SAFETY_FEATURE_AUDIT: {
  lastAuditDate: string;
  auditedBy: string;
  allFeaturesConfirmedFree: boolean;
  nextAuditDate: string;
} = {
  lastAuditDate: '2026-06-10',
  auditedBy: 'Aegis Lens Product Team',
  allFeaturesConfirmedFree: true,
  nextAuditDate: '2026-09-10',
};
