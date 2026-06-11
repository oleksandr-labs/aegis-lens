/**
 * OSINT Analyst persona — power-user configs, coordinate parsing, STIX export.
 * Persona strategy: docs/audiences/personas.md §P3
 */

import type { PersonaFeatureSet, PersonaUseCase } from './types';

// ---------------------------------------------------------------------------
// Persona descriptors
// ---------------------------------------------------------------------------

export const OSINT_ANALYST_FEATURES: PersonaFeatureSet = {
  personaId: 'osint-analyst',
  name_en: 'OSINT Analyst',
  name_uk: 'OSINT-аналітик',
  description_en:
    'Power users who collect, verify, geolocate, and publish open-source intelligence. ' +
    'They drive our quality bar — serve them first.',
  description_uk:
    'Досвідчені користувачі, що збирають, верифікують, геолоцюють та публікують ' +
    'розвіддані з відкритих джерел. Вони підвищують наш рівень якості — ' +
    'обслуговуємо їх насамперед.',
  recommendedTier: 'pro',
  keyFeatures_en: [
    'Raw event JSON view with JSONPath queries',
    'Coordinate parsing: MGRS, UTM, DMS, decimal degrees, Plus Codes',
    'Reverse image and video search integration',
    'Geolocation workspace — drop pin, propose location, attach clues',
    'Cross-source corroboration view',
    'Source reputation explorer',
    'Export to STIX 2.1, JSON, CSV, KML, GPX, GeoJSON',
    'CLI + Python SDK + TypeScript SDK',
    'Jupyter notebook templates',
    'Webhook, Zapier, and n8n integrations',
    'Verified-contributor badges',
    'Public leaderboard for geolocations contributed',
    'Bounties for verified geolocations',
    'Tutorial library (deep, technical)',
    'Public dataset releases',
    'Advanced filters: every field, AND/OR/NOT, saved queries',
  ],
  keyFeatures_uk: [
    'Перегляд сирого JSON подій із запитами JSONPath',
    'Розбір координат: MGRS, UTM, DMS, десяткові градуси, Plus Codes',
    'Інтеграція зворотного пошуку зображень і відео',
    'Робочий простір геолокації — маркер, пропозиція місця, прикріплення підказок',
    'Перегляд крос-джерельного підтвердження',
    'Дослідник репутації джерел',
    'Експорт у STIX 2.1, JSON, CSV, KML, GPX, GeoJSON',
    'CLI + Python SDK + TypeScript SDK',
    'Шаблони Jupyter-ноутбуків',
    'Інтеграції Webhook, Zapier та n8n',
    'Значки верифікованого учасника',
    'Публічний рейтинг за внесеними геолокаціями',
    'Бонуси за верифіковані геолокації',
    'Бібліотека навчальних матеріалів (глибокі, технічні)',
    'Публічні набори даних',
    'Розширені фільтри: будь-яке поле, AND/OR/NOT, збережені запити',
  ],
  onboardingPath: [
    '/onboarding/welcome',
    '/onboarding/api-key',
    '/onboarding/sdk-setup',
    '/onboarding/jupyter-templates',
    '/onboarding/first-geolocation',
  ],
  ctas: {
    primary_en: 'Get Pro access',
    primary_uk: 'Отримати Pro-доступ',
    secondary_en: 'View API docs',
    secondary_uk: 'Переглянути документацію API',
  },
  landingPageSlug: 'osint-analyst',
};

export const OSINT_ANALYST_USE_CASE: PersonaUseCase = {
  personaId: 'osint-analyst',
  jobToBeDone_en:
    'Rapidly collect, verify, and geolocate open-source events, then publish findings ' +
    'with full source provenance so editors and courts can independently verify them.',
  jobToBeDone_uk:
    'Швидко збирати, верифікувати та геолоцювати події з відкритих джерел, ' +
    'потім публікувати висновки з повним відстеженням джерел для незалежної перевірки.',
  painPoints_en: [
    'Switching between 10+ tools for collection, verification, and export',
    'Coordinate format soup — MGRS from military sources, DMS from imagery, decimal from APIs',
    'No canonical source-reputation layer; must rebuild trust judgments from scratch each time',
    'STIX/structured export is missing from most open-source tools',
    'Jupyter and CLI workflows break when UI-only tools gatekeep the data',
    'Contributor recognition missing — no incentive to share geolocations publicly',
  ],
  workflow_en: [
    'Monitor Telegram channels and social feeds for new incident reports',
    'Ingest event into Aegis Lens; view raw JSON and apply JSONPath filters',
    'Parse coordinates from various formats into a unified workspace',
    'Cross-reference across sources using corroboration view',
    'Attach satellite / street-level imagery clues and propose geolocation',
    'Validate with reverse image search and source reputation score',
    'Export verified event bundle as STIX 2.1 or GeoJSON',
    'Publish leaderboard contribution; claim bounty if applicable',
  ],
  keyDifferentiators_en: [
    'Unified coordinate parser handles every military and civilian format',
    'STIX 2.1 export built in — no third-party converter needed',
    'Source reputation layer aggregates cross-community trust signals',
    'API + SDK + Jupyter pathway means zero UI-only lock-in',
    'Verified-contributor system creates professional accountability',
  ],
};

// ---------------------------------------------------------------------------
// Coordinate format registry
// ---------------------------------------------------------------------------

export const COORDINATE_FORMATS: {
  format: string;
  description_en: string;
  example: string;
  regex: string;
}[] = [
  {
    format: 'MGRS',
    description_en:
      'Military Grid Reference System — used in NATO military communications and field reports.',
    example: '37UDB 12345 67890',
    regex: '^\\d{1,2}[A-Z][A-Z]{2}\\s*\\d{5}\\s*\\d{5}$',
  },
  {
    format: 'UTM',
    description_en:
      'Universal Transverse Mercator — zone + easting + northing, common in GIS exports.',
    example: '37N 674500 5362300',
    regex: '^\\d{1,2}[A-Z]\\s+\\d{6}\\s+\\d{7}$',
  },
  {
    format: 'DMS',
    description_en:
      'Degrees, Minutes, Seconds — appears in imagery metadata and legacy OSINT sources.',
    example: "48°23'15\"N 037°48'30\"E",
    regex:
      "^\\d{1,3}[°\\s]\\d{1,2}['\\s]\\d{1,2}(\\.\\d+)?[\"\\s]?[NSns]\\s*\\d{1,3}[°\\s]\\d{1,2}['\\s]\\d{1,2}(\\.\\d+)?[\"\\s]?[EWew]$",
  },
  {
    format: 'Decimal Degrees',
    description_en:
      'Standard decimal latitude/longitude — output of most APIs and mapping libraries.',
    example: '48.3875, 37.8083',
    regex:
      '^-?\\d{1,2}\\.\\d+\\s*,\\s*-?\\d{1,3}\\.\\d+$',
  },
  {
    format: 'Plus Codes',
    description_en:
      'Open Location Codes (Google Plus Codes) — compact shareable location codes used in humanitarian contexts.',
    example: '9G86+5W Mariupol',
    regex: '^[23456789CFGHJMPQRVWX]{4,8}\\+[23456789CFGHJMPQRVWX]{2,3}(\\s+.+)?$',
  },
  {
    format: 'Decimal Degrees (unsigned with hemisphere)',
    description_en:
      'Decimal degrees with explicit N/S/E/W hemisphere designators — common in aviation and maritime reports.',
    example: 'N48.3875 E037.8083',
    regex:
      '^[NSns]\\s*\\d{1,2}\\.\\d+\\s+[EWew]\\s*\\d{1,3}\\.\\d+$',
  },
];

// ---------------------------------------------------------------------------
// Coordinate parser
// ---------------------------------------------------------------------------

/**
 * Parses a coordinate string in any supported format to decimal degrees.
 * Returns null if the input cannot be recognised.
 */
export class CoordinateParser {
  /**
   * Attempt to parse `input` into decimal degrees.
   * Tries formats in priority order: Decimal → DMS → Hemisphere-prefixed → MGRS → UTM → Plus Codes.
   */
  parse(input: string): { lat: number; lon: number; format: string } | null {
    const s = input.trim();

    // 1. Decimal degrees: "48.3875, 37.8083" or "48.3875 37.8083"
    const decimalMatch = s.match(
      /^(-?\d{1,2}\.\d+)\s*[,\s]\s*(-?\d{1,3}\.\d+)$/
    );
    if (decimalMatch) {
      const lat = parseFloat(decimalMatch[1]);
      const lon = parseFloat(decimalMatch[2]);
      if (this._validLatLon(lat, lon)) {
        return { lat, lon, format: 'Decimal Degrees' };
      }
    }

    // 2. DMS: 48°23'15"N 037°48'30"E
    const dmsMatch = s.match(
      /^(\d{1,3})[°\s](\d{1,2})['′\s](\d{1,2}(?:\.\d+)?)[""″\s]?([NSns])\s+(\d{1,3})[°\s](\d{1,2})['′\s](\d{1,2}(?:\.\d+)?)[""″\s]?([EWew])$/
    );
    if (dmsMatch) {
      const lat = this._dmsToDecimal(
        parseFloat(dmsMatch[1]),
        parseFloat(dmsMatch[2]),
        parseFloat(dmsMatch[3]),
        dmsMatch[4].toUpperCase() as 'N' | 'S'
      );
      const lon = this._dmsToDecimal(
        parseFloat(dmsMatch[5]),
        parseFloat(dmsMatch[6]),
        parseFloat(dmsMatch[7]),
        dmsMatch[8].toUpperCase() as 'E' | 'W'
      );
      if (this._validLatLon(lat, lon)) {
        return { lat, lon, format: 'DMS' };
      }
    }

    // 3. Hemisphere-prefixed decimal: N48.3875 E037.8083
    const hemiMatch = s.match(
      /^([NSns])\s*(\d{1,2}\.\d+)\s+([EWew])\s*(\d{1,3}\.\d+)$/
    );
    if (hemiMatch) {
      const lat =
        parseFloat(hemiMatch[2]) * (hemiMatch[1].toUpperCase() === 'S' ? -1 : 1);
      const lon =
        parseFloat(hemiMatch[4]) * (hemiMatch[3].toUpperCase() === 'W' ? -1 : 1);
      if (this._validLatLon(lat, lon)) {
        return { lat, lon, format: 'Decimal Degrees' };
      }
    }

    // 4. UTM (heuristic only — full projection requires a math library)
    // Return null with a note rather than silently wrong coords
    const utmMatch = s.match(/^(\d{1,2})([A-Z])\s+(\d{5,7})\s+(\d{5,7})$/);
    if (utmMatch) {
      // Placeholder: real UTM→ latlon conversion requires proj4
      // Return null so callers know to delegate to a projection library
      return null;
    }

    // 5. MGRS (heuristic — real decode requires a library)
    const mgrsMatch = s.match(/^\d{1,2}[A-Z][A-Z]{2}\s*\d{4,10}$/);
    if (mgrsMatch) {
      // Placeholder: real MGRS→latlon conversion requires mgrs.js or proj4
      return null;
    }

    // 6. Plus Codes — heuristic bounding box (would require openlocationcode lib for exact)
    const plusMatch = s.match(
      /^([23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3})/
    );
    if (plusMatch) {
      return null; // delegate to openlocationcode library
    }

    return null;
  }

  private _dmsToDecimal(
    deg: number,
    min: number,
    sec: number,
    hemi: 'N' | 'S' | 'E' | 'W'
  ): number {
    const decimal = deg + min / 60 + sec / 3600;
    return hemi === 'S' || hemi === 'W' ? -decimal : decimal;
  }

  private _validLatLon(lat: number, lon: number): boolean {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  }
}

/**
 * Convenience function — creates a `CoordinateParser` and calls `.parse()`.
 */
export function parseCoordinate(
  input: string
): { lat: number; lon: number; format: string } | null {
  return new CoordinateParser().parse(input);
}

// ---------------------------------------------------------------------------
// STIX 2.1 export config
// ---------------------------------------------------------------------------

export const STIX_EXPORT_CONFIG: {
  version: '2.1';
  bundleId: string;
  producer: string;
  supportedObjectTypes: string[];
} = {
  version: '2.1',
  bundleId: 'bundle--aegis-lens-export',
  producer: 'Aegis Lens / Ukrainian MAP',
  supportedObjectTypes: [
    'indicator',
    'threat-actor',
    'attack-pattern',
    'observed-data',
    'location',
    'malware',
    'tool',
  ],
};
