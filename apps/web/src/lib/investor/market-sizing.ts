/**
 * Market Sizing — TAM / SAM / SOM for the conflict intelligence platform.
 *
 * TAM: entire geospatial intelligence market.
 * SAM: OSINT / open-source conflict intelligence software.
 * SOM: realistic 3-year addressable revenue.
 *
 * TAM/SAM/SOM для ринку конфліктної розвідки.
 */

// ── Market figures ────────────────────────────────────────────────────────────

/** Total Addressable Market — geospatial intelligence $8 B */
export const MARKET_TAM_USD = 8_000_000_000;

/** Serviceable Addressable Market — OSINT / conflict intel SaaS $1.2 B */
export const MARKET_SAM_USD = 1_200_000_000;

/** Serviceable Obtainable Market — 3-year realistic target $120 M */
export const MARKET_SOM_USD = 120_000_000;

// ── Market segments ───────────────────────────────────────────────────────────

export interface MarketSegment {
  id: string;
  name: string;
  /** Share of SAM — Частка SAM */
  samShare: number;
  /** Aegis Lens target customers — Цільові клієнти Aegis Lens */
  targetCustomers: string[];
  /** Average contract value in USD/year — Середня вартість контракту (USD/рік) */
  avgContractValueUsd: number;
}

export const MARKET_SEGMENTS: MarketSegment[] = [
  {
    id: 'media',
    name: 'News Media & Journalism',
    samShare: 0.20,
    targetCustomers: ['wire agencies', 'broadcast networks', 'digital newsrooms', 'freelance investigators'],
    avgContractValueUsd: 2_400,
  },
  {
    id: 'ngo-humanitarian',
    name: 'NGOs & Humanitarian Organisations',
    samShare: 0.15,
    targetCustomers: ['ICRC', 'MSF', 'UN agencies', 'conflict monitoring NGOs'],
    avgContractValueUsd: 6_000,
  },
  {
    id: 'government',
    name: 'Government & Defence',
    samShare: 0.40,
    targetCustomers: ['foreign ministries', 'defence intelligence units', 'peacekeeping forces'],
    avgContractValueUsd: 120_000,
  },
  {
    id: 'financial',
    name: 'Financial & Risk Intelligence',
    samShare: 0.15,
    targetCustomers: ['political risk consultancies', 'insurance underwriters', 'commodity traders'],
    avgContractValueUsd: 18_000,
  },
  {
    id: 'tech-osint',
    name: 'Tech & OSINT Platforms',
    samShare: 0.10,
    targetCustomers: ['cyber threat intel firms', 'data aggregators', 'OSINT tool builders'],
    avgContractValueUsd: 36_000,
  },
];

// ── Notes ─────────────────────────────────────────────────────────────────────

export const MarketSizingNote_EN =
  'TAM based on MarketsandMarkets Geospatial Intelligence 2024 report ($8.1 B, 12% CAGR). ' +
  'SAM derived from filtering for OSINT / open-source conflict monitoring software buyers. ' +
  'SOM represents 10% of SAM reachable within 3 years with current GTM.';

export const MarketSizingNote_UK =
  'TAM на основі звіту MarketsandMarkets Geospatial Intelligence 2024 ($8.1 млрд, CAGR 12%). ' +
  'SAM — фільтр для покупців OSINT-програмного забезпечення. ' +
  'SOM — 10% SAM, досяжні за 3 роки з поточним GTM.';

export const MARKET_SOURCES: string[] = [
  'MarketsandMarkets — Geospatial Intelligence Market 2024 ($8.1B, 12.4% CAGR)',
  'Grand View Research — OSINT Market 2023 ($6.9B by 2030)',
  'Crunchbase — competitor funding rounds (Janes $150M, Recorded Future $780M)',
  'ACLED — 2023 Annual Report (conflict events up 27% YoY, platform usage tripled)',
  'Reuters Institute — Digital News Report 2024 (OSINT as standard practice)',
];
