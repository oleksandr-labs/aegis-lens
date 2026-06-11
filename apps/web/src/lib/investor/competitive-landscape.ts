/**
 * Competitive Landscape — honest competitor analysis for the pitch deck.
 *
 * Five main competitors mapped across price, strengths, and weaknesses.
 * Aegis Lens positioning: real-time OSINT + AI verification at analyst price.
 *
 * Конкурентний аналіз: 5 гравців, позиціонування Aegis Lens.
 */

// ── Competitor ────────────────────────────────────────────────────────────────

export interface Competitor {
  id: string;
  name: string;
  category: string;
  /** Annual price for comparable tier — Річна ціна за порівнянний tier */
  annualPriceUsd: number | string;
  strengths: string[];
  weaknesses: string[];
  /** Primary customer segment — Основний сегмент клієнтів */
  primarySegment: string;
  /** Funding to date in USD (approx) — Залучене фінансування (приблизно) */
  fundingUsd: number | string;
}

// ── Competitor list ───────────────────────────────────────────────────────────

export const COMPETITORS: Competitor[] = [
  {
    id: 'liveuamap',
    name: 'LiveUAMap',
    category: 'Conflict Map',
    annualPriceUsd: 0,
    strengths: [
      'Large organic audience and brand recognition in Ukraine conflict',
      'Extensive historical event archive',
      'Free tier drives viral adoption',
    ],
    weaknesses: [
      'Manual curation bottleneck — no automation or AI',
      'No analyst workspace, case files, or alerts',
      'Zero API / enterprise offering',
      'Source verification is opaque',
    ],
    primarySegment: 'General public / journalists',
    fundingUsd: 'bootstrap',
  },
  {
    id: 'janes',
    name: 'Janes (defense intelligence)',
    category: 'Defence Intel Platform',
    annualPriceUsd: 150_000,
    strengths: [
      'Decades of curated defence data and deep institutional trust',
      'Strong gov/military procurement relationships',
      'Broad OOB (order of battle) coverage',
    ],
    weaknesses: [
      'Extremely high cost bars out media, NGO, research users',
      'Slow data update cycle (days, not minutes)',
      'Legacy UX designed for desktop warrooms',
      'No real-time open-source ingestion',
    ],
    primarySegment: 'Defence / government',
    fundingUsd: 'private (Montagu PE)',
  },
  {
    id: 'palantir',
    name: 'Palantir (Gotham / AIP)',
    category: 'Enterprise Data Platform',
    annualPriceUsd: 1_000_000,
    strengths: [
      'Best-in-class data integration and graph analytics',
      'Strong gov/IC customer base',
      'Substantial AI/ML investment',
    ],
    weaknesses: [
      'Multi-million dollar contracts inaccessible to media/NGO',
      'Requires months of onboarding and professional services',
      'Controversial reputation limits adoption in civil society',
      'Not OSINT-native or open-source-community-facing',
    ],
    primarySegment: 'Government / large enterprise',
    fundingUsd: '$3B+ (public)',
  },
  {
    id: 'recorded-future',
    name: 'Recorded Future',
    category: 'Cyber / Threat Intel Platform',
    annualPriceUsd: 50_000,
    strengths: [
      'World-class NLP and entity extraction for threat intelligence',
      'Huge customer base (1,600+ enterprises)',
      'Strong dark-web and SIGINT integrations',
    ],
    weaknesses: [
      'Focused on cyber threat intel — not geospatial conflict events',
      'No satellite imagery or ADS-B integration',
      'No humanitarian / journalist use-case support',
      'High price for non-enterprise buyers',
    ],
    primarySegment: 'Enterprise security / financial',
    fundingUsd: '$780M (Insight PE)',
  },
  {
    id: 'bellingcat',
    name: 'Bellingcat',
    category: 'OSINT Investigation Platform / Media',
    annualPriceUsd: 0,
    strengths: [
      'Unmatched community trust and investigative credibility',
      'Open methodology and free tools (Aleph, etc.)',
      'Strong brand in journalism and human rights',
    ],
    weaknesses: [
      'Not a commercial product — no real-time alert or API',
      'Investigation-focused, not situational-awareness map',
      'No AI-automated ingestion pipeline',
      'Cannot scale to enterprise or government SLAs',
    ],
    primarySegment: 'Journalists / NGOs / researchers',
    fundingUsd: 'donations + grants',
  },
];

// ── Competitive matrix ────────────────────────────────────────────────────────

export interface CompetitiveMatrixRow {
  dimension: string;
  aegisLens: string;
  liveuamap: string;
  janes: string;
  palantir: string;
  recordedFuture: string;
  bellingcat: string;
}

/**
 * Build a competitive positioning matrix.
 *
 * Будує матрицю конкурентного позиціонування.
 */
export function buildCompetitiveMatrix(): object {
  const dimensions: CompetitiveMatrixRow[] = [
    { dimension: 'Real-time ingestion (<60s)',   aegisLens: 'yes', liveuamap: 'partial', janes: 'no',  palantir: 'partial', recordedFuture: 'partial', bellingcat: 'no'  },
    { dimension: 'AI verification',              aegisLens: 'yes', liveuamap: 'no',      janes: 'no',  palantir: 'yes',     recordedFuture: 'yes',     bellingcat: 'no'  },
    { dimension: 'Analyst workspace + alerts',   aegisLens: 'yes', liveuamap: 'no',      janes: 'yes', palantir: 'yes',     recordedFuture: 'yes',     bellingcat: 'no'  },
    { dimension: 'Open-source friendly',         aegisLens: 'yes', liveuamap: 'yes',     janes: 'no',  palantir: 'no',      recordedFuture: 'no',      bellingcat: 'yes' },
    { dimension: 'Journalist / NGO pricing',     aegisLens: 'yes', liveuamap: 'yes',     janes: 'no',  palantir: 'no',      recordedFuture: 'partial', bellingcat: 'yes' },
    { dimension: 'Satellite + SAR integration',  aegisLens: 'yes', liveuamap: 'no',      janes: 'yes', palantir: 'partial', recordedFuture: 'no',      bellingcat: 'no'  },
    { dimension: 'Public API',                   aegisLens: 'yes', liveuamap: 'no',      janes: 'no',  palantir: 'yes',     recordedFuture: 'yes',     bellingcat: 'no'  },
  ];

  return {
    columns: ['Aegis Lens', 'LiveUAMap', 'Janes', 'Palantir', 'Recorded Future', 'Bellingcat'],
    rows: dimensions,
    positioning:
      'Aegis Lens is the only platform combining real-time AI-verified OSINT, ' +
      'an analyst workspace, and journalist/NGO-accessible pricing.',
  };
}
