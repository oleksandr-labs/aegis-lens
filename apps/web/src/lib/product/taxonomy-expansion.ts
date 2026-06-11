/**
 * Taxonomy Expansion — Phase 4 multi-region conflict taxonomy.
 *
 * Extends the Ukraine/Black Sea core taxonomy to 10 additional conflict
 * and crisis regions, each with a regional event class extension.
 *
 * Розширення таксономії фази 4: 10 регіонів за межами України/Чорного моря.
 */

'use server';

// ── Taxonomy region ───────────────────────────────────────────────────────────

export interface TaxonomyRegion {
  id: string;
  /** Display name — Назва */
  name: string;
  /** ISO country codes in scope — ISO-коди країн */
  countryCodes: string[];
  /** Primary conflict type — Тип конфлікту */
  conflictType: 'interstate' | 'civil' | 'insurgency' | 'hybrid' | 'crisis';
  /** Region-specific event class extensions — Регіональні розширення класів */
  eventClassExtensions: string[];
  /** Launch phase — Фаза запуску */
  launchPhase: 4;
  /** Status — Статус */
  status: 'planned' | 'in-progress' | 'live';
}

// ── Phase 4 regions ───────────────────────────────────────────────────────────

/**
 * Ten regions added in Phase 4 beyond the Ukraine/Black Sea core.
 *
 * Десять регіонів, що додаються у фазі 4.
 */
export const PHASE4_TAXONOMY_REGIONS: TaxonomyRegion[] = [
  { id: 'middle-east',    name: 'Middle East (Gaza/Lebanon/Syria)',   countryCodes: ['PS','IL','LB','SY'],    conflictType: 'interstate',  eventClassExtensions: ['siege', 'ceasefire-violation'],  launchPhase: 4, status: 'planned' },
  { id: 'taiwan-strait',  name: 'Taiwan Strait',                     countryCodes: ['TW','CN'],              conflictType: 'interstate',  eventClassExtensions: ['gray-zone-operation'],           launchPhase: 4, status: 'planned' },
  { id: 'south-china-sea',name: 'South China Sea',                   countryCodes: ['CN','PH','VN','MY'],    conflictType: 'interstate',  eventClassExtensions: ['maritime-incursion'],            launchPhase: 4, status: 'planned' },
  { id: 'sahel',          name: 'Sahel (Mali/Burkina/Niger)',         countryCodes: ['ML','BF','NE'],         conflictType: 'insurgency',  eventClassExtensions: ['coup', 'pmf-activity'],          launchPhase: 4, status: 'planned' },
  { id: 'horn-of-africa', name: 'Horn of Africa',                    countryCodes: ['ET','SO','ER','DJ'],    conflictType: 'civil',       eventClassExtensions: ['famine-alert', 'displacement'],  launchPhase: 4, status: 'planned' },
  { id: 'sudan',          name: 'Sudan / South Sudan',               countryCodes: ['SD','SS'],              conflictType: 'civil',       eventClassExtensions: ['para-military', 'aid-blockade'], launchPhase: 4, status: 'planned' },
  { id: 'caucasus',       name: 'South Caucasus',                    countryCodes: ['AM','AZ','GE'],         conflictType: 'interstate',  eventClassExtensions: ['border-incident'],               launchPhase: 4, status: 'planned' },
  { id: 'myanmar',        name: 'Myanmar',                           countryCodes: ['MM'],                   conflictType: 'civil',       eventClassExtensions: ['junta-airstrike', 'pdo-attack'],  launchPhase: 4, status: 'planned' },
  { id: 'haiti',          name: 'Haiti',                             countryCodes: ['HT'],                   conflictType: 'crisis',      eventClassExtensions: ['gang-control', 'aid-access'],    launchPhase: 4, status: 'planned' },
  { id: 'arctic',         name: 'Arctic / High North',               countryCodes: ['NO','FI','SE','RU'],    conflictType: 'hybrid',      eventClassExtensions: ['ice-route', 'subsea-cable'],     launchPhase: 4, status: 'planned' },
];

// ── Expansion config ──────────────────────────────────────────────────────────

export interface TaxonomyExpansionConfig {
  phase4Regions: TaxonomyRegion[];
  /** Core regions (always present) — Базові регіони (завжди присутні) */
  coreRegions: string[];
  /** Max event class extensions per region — Макс. розширень на регіон */
  maxExtensionsPerRegion: number;
}

export const TAXONOMY_EXPANSION_CONFIG: TaxonomyExpansionConfig = {
  phase4Regions: PHASE4_TAXONOMY_REGIONS,
  coreRegions: ['ukraine', 'black-sea'],
  maxExtensionsPerRegion: 10,
};
