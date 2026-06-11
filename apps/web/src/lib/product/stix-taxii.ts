/**
 * STIX 2.1 / TAXII 2.1 Export — cyber threat intelligence sharing format.
 *
 * Enables export of Aegis Lens events and entities in the STIX 2.1 format
 * and sharing via TAXII 2.1 collections. Primarily used for threat intel
 * sharing with gov partners and ISACs.
 *
 * Експорт у STIX 2.1 та шерінг через TAXII 2.1 для держ. партнерів.
 */

'use server';

// ── Versions ──────────────────────────────────────────────────────────────────

export const STIX_VERSION = '2.1' as const;
export const TAXII_VERSION = '2.1' as const;

// ── STIX object types ─────────────────────────────────────────────────────────

/**
 * Ten STIX object types exported by Aegis Lens.
 *
 * Десять типів об'єктів STIX, що експортуються.
 */
export const STIX_OBJECT_TYPES = [
  'attack-pattern',
  'campaign',
  'course-of-action',
  'identity',
  'incident',
  'indicator',
  'location',
  'malware',
  'threat-actor',
  'vulnerability',
] as const;

export type StixObjectType = typeof STIX_OBJECT_TYPES[number];

// ── STIX config ───────────────────────────────────────────────────────────────

export interface StixConfig {
  version: typeof STIX_VERSION;
  /** Producer identity name — Назва продюсера */
  producerName: string;
  /** Producer identity class — Клас ідентичності */
  producerIdentityClass: string;
  /** Supported STIX object types — Підтримувані типи */
  objectTypes: ReadonlyArray<StixObjectType>;
  /** Whether to include raw text in custom extension — Чи включати raw text */
  includeRawExtension: boolean;
  /** TLP marking level — Рівень маркування TLP */
  defaultTlp: 'white' | 'green' | 'amber' | 'red';
}

// ── TAXII config ──────────────────────────────────────────────────────────────

export interface TaxiiConfig {
  version: typeof TAXII_VERSION;
  /** TAXII server root URL — Кореневий URL сервера TAXII */
  serverUrl: string;
  /** Collection identifiers — Ідентифікатори колекцій */
  collections: string[];
  /** Max objects per response page — Макс. об'єктів на сторінку відповіді */
  maxPageSize: number;
  /** Auth method — Метод авторизації */
  authMethod: 'basic' | 'bearer' | 'api-key';
}

// ── Combined config ───────────────────────────────────────────────────────────

export interface StixTaxiiConfig {
  stix: StixConfig;
  taxii: TaxiiConfig;
  /** Required tier — Необхідний tier */
  requiredTier: string;
}

export const STIX_TAXII_CONFIG: StixTaxiiConfig = {
  stix: {
    version: STIX_VERSION,
    producerName: 'Aegis Lens',
    producerIdentityClass: 'organization',
    objectTypes: STIX_OBJECT_TYPES,
    includeRawExtension: true,
    defaultTlp: 'amber',
  },
  taxii: {
    version: TAXII_VERSION,
    serverUrl: 'https://taxii.aegislens.com/taxii/',
    collections: ['aegis-events', 'aegis-entities', 'aegis-attribution'],
    maxPageSize: 1_000,
    authMethod: 'bearer',
  },
  requiredTier: 'enterprise',
};

// ── Notes ─────────────────────────────────────────────────────────────────────

export const STIX_NOTE_EN =
  'STIX/TAXII export maps Aegis Lens event classes to STIX incident and indicator objects. ' +
  'Custom x-aegis extension preserves confidence scores and geo coordinates.';

export const STIX_NOTE_UK =
  'Експорт STIX/TAXII відображає класи подій Aegis Lens на об'єкти STIX incident та indicator. ' +
  'Кастомне розширення x-aegis зберігає оцінки confidence та гео-координати.';
