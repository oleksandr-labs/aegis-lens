/**
 * Vision Milestones — 1-year, 3-year, and 5-year strategic targets.
 *
 * Ties the product roadmap to investor-facing narrative outcomes.
 *
 * Стратегічні цілі: 1, 3, 5 років для інвесторів.
 */

// ── Vision milestone ──────────────────────────────────────────────────────────

export interface VisionMilestone {
  /** Year horizon — Горизонт */
  year: 1 | 3 | 5;
  /** Headline goal — Головна ціль */
  headline: string;
  /** Key metrics to hit — Ключові метрики */
  keyMetrics: string[];
  /** Product state — Стан продукту */
  productState: string;
  /** Market position — Ринкова позиція */
  marketPosition: string;
}

// ── Milestones ────────────────────────────────────────────────────────────────

export const VISION_MILESTONES: VisionMilestone[] = [
  {
    year: 1,
    headline: 'MVP live: 10 paying customers, recognised in OSINT community',
    keyMetrics: [
      '$500K ARR',
      '10 paying customers (media + NGO)',
      '3,000 MAU on free tier',
      '1M+ verified events in database',
      'Public live map launched',
    ],
    productState:
      'Phase 1 complete: live map, AI summaries, alert system, analyst workspace. ' +
      'EN + UK locales. Telegram + RSS + NASA FIRMS + ADS-B ingestion live.',
    marketPosition:
      'Recognised as the best free OSINT map for Ukraine conflict. ' +
      'First press coverage in major journalism outlets.',
  },
  {
    year: 3,
    headline: '500K MAU, global expansion, $12M ARR, Series A closed',
    keyMetrics: [
      '$12M ARR',
      '500K MAU',
      '300 paying organisations',
      '10 conflict regions covered',
      'Series A ($10–15M) closed',
    ],
    productState:
      'Phase 2 + 3 complete: social media ingestion, SAR, AIS, anomaly detection, ' +
      'enterprise SSO/SCIM, commercial satellite tasking, STIX/TAXII export. ' +
      'SOC 2 Type I certified.',
    marketPosition:
      'Category-defining conflict intelligence platform. ' +
      'Featured by Bellingcat, Reuters Institute, OCCRP. ' +
      'Gov/defence pilots in 3 NATO member states.',
  },
  {
    year: 5,
    headline: 'Predictive-crisis standard + public utility layer for global media',
    keyMetrics: [
      '$50M+ ARR',
      '2M+ MAU',
      'Crisis Index covering 50 countries',
      'Public API with 500+ integrations',
      'Layer marketplace with 200+ community layers',
    ],
    productState:
      'Phase 4 complete: 10+ conflict regions, 8+ locales, layer marketplace, ' +
      'crisis index, full API ecosystem, partner programme. ' +
      'SOC 2 Type II + ISO 27001 certified.',
    marketPosition:
      'Aegis Lens is the Reuters terminal for conflict intelligence. ' +
      'Embedded in journalism schools, NGO toolkits, and government threat-assessment workflows worldwide.',
  },
];
