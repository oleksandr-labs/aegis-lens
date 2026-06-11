/**
 * Moat — competitive defensibility pillars for the investor narrative.
 *
 * Five structural advantages that compound over time and are hard to replicate.
 *
 * П'ять структурних переваг, що важко відтворити конкурентам.
 */

// ── Moat pillar ───────────────────────────────────────────────────────────────

export interface MoatPillar {
  id: string;
  /** Short name — Коротка назва */
  name: string;
  /** Description — Опис */
  description: string;
  /** Why it's hard to copy — Чому важко скопіювати */
  defensibility: string;
  /** Time to replicate estimate — Оцінка часу для копіювання */
  replicationEstimate: string;
  /** Compounding effect — Ефект накопичення */
  compoundingEffect: string;
}

// ── Pillars ───────────────────────────────────────────────────────────────────

/**
 * The five moat pillars.
 *
 * П'ять стовпів захисного рову.
 */
export const MOAT_PILLARS: MoatPillar[] = [
  {
    id: 'verification-network',
    name: 'Verification Network',
    description:
      'A growing community of vetted OSINT analysts who corroborate, annotate, ' +
      'and flag events directly in the platform.',
    defensibility:
      'Trust takes years to build; competitors cannot buy a verification community.',
    replicationEstimate: '3+ years',
    compoundingEffect:
      'Each analyst interaction improves confidence-score calibration, ' +
      'reducing false-positive rates and increasing stickiness.',
  },
  {
    id: 'ai-data-flywheel',
    name: 'AI Data Flywheel',
    description:
      'Every analyst correction, every alert rule, and every case file ' +
      'feeds labelled training data back into the classification and scoring models.',
    defensibility:
      'Proprietary labelled conflict-event dataset impossible to replicate without the user base.',
    replicationEstimate: '2+ years of usage data',
    compoundingEffect:
      'Model accuracy improves with scale, widening the gap vs. generic LLM wrappers.',
  },
  {
    id: 'osint-community',
    name: 'OSINT Community Positioning',
    description:
      'Open-source tools, methodologies published openly, and active presence ' +
      'in the Bellingcat / OSINT.team / Trace Labs communities.',
    defensibility:
      'Community trust is non-transferable; it must be earned through transparency.',
    replicationEstimate: '5+ years',
    compoundingEffect:
      'Community members become advocates, beta testers, and marketplace layer publishers.',
  },
  {
    id: 'structured-event-schema',
    name: 'Structured Event Schema',
    description:
      'A canonical PostGIS event schema (v1) that integrates seamlessly with STIX, ' +
      'GeoJSON, and every downstream intelligence format.',
    defensibility:
      'Schema lock-in for enterprise integrations; migration costs are high once embedded in workflows.',
    replicationEstimate: '1 year + enterprise adoption time',
    compoundingEffect:
      'Schema adoption grows integration surface area and becomes a de-facto industry standard.',
  },
  {
    id: 'trust-brand',
    name: 'Trust Brand',
    description:
      'In intelligence, accuracy is the brand. Every verified event, every ' +
      'retraction handled transparently, builds a trust premium over aggregators.',
    defensibility:
      'Trust is destroyed instantly by one major error; slow to rebuild for challengers.',
    replicationEstimate: 'Cannot be bought; earned over years',
    compoundingEffect:
      'High-trust brand commands premium pricing and drives enterprise procurement decisions.',
  },
];

// ── Notes ─────────────────────────────────────────────────────────────────────

export const MOAT_NOTE_EN =
  'The verification network and AI data flywheel are the primary compounding moats. ' +
  'The OSINT community positioning is the fastest to build and the hardest to copy.';

export const MOAT_NOTE_UK =
  'Мережа верифікації та маховик AI-даних — головні накопичувальні переваги. ' +
  'Позиціонування в OSINT-спільноті — найшвидше будується і найважче копіюється.';
