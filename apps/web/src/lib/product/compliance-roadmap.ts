/**
 * Compliance Roadmap — SOC 2 Type I/II, ISO 27001, CSA STAR milestones.
 *
 * Tracks the phased compliance certification programme from SOC 2 Type I
 * in Phase 3 through full ISO 27001 and CSA STAR in Phase 4.
 *
 * Дорожня карта відповідності: SOC 2, ISO 27001, CSA STAR.
 */

'use server';

// ── Compliance milestone ──────────────────────────────────────────────────────

export interface ComplianceMilestone {
  /** Standard identifier — Ідентифікатор стандарту */
  id: string;
  /** Standard name — Назва стандарту */
  name: string;
  /** Target product phase — Цільова фаза продукту */
  targetPhase: 3 | 4;
  /** Estimated effort in person-months — Оцінка зусиль (люд.-місяці) */
  effortPersonMonths: number;
  /** Whether it is a customer-facing requirement — Вимога клієнтів */
  customerRequirement: boolean;
  /** Auditor type — Тип аудитора */
  auditorType: 'third-party' | 'self-assessment';
  /** Status — Статус */
  status: 'planned' | 'in-progress' | 'completed';
  /** Dependencies (milestone ids) — Залежності */
  dependsOn: string[];
}

// ── Milestones ────────────────────────────────────────────────────────────────

/**
 * Compliance certification milestones across Phases 3–4.
 *
 * Сертифікаційні віхи відповідності для фаз 3–4.
 */
export const COMPLIANCE_MILESTONES: ComplianceMilestone[] = [
  {
    id: 'soc2-type-i',
    name: 'SOC 2 Type I',
    targetPhase: 3,
    effortPersonMonths: 4,
    customerRequirement: true,
    auditorType: 'third-party',
    status: 'planned',
    dependsOn: [],
  },
  {
    id: 'soc2-type-ii',
    name: 'SOC 2 Type II',
    targetPhase: 4,
    effortPersonMonths: 6,
    customerRequirement: true,
    auditorType: 'third-party',
    status: 'planned',
    dependsOn: ['soc2-type-i'],
  },
  {
    id: 'iso27001',
    name: 'ISO 27001',
    targetPhase: 4,
    effortPersonMonths: 8,
    customerRequirement: true,
    auditorType: 'third-party',
    status: 'planned',
    dependsOn: ['soc2-type-i'],
  },
  {
    id: 'csa-star',
    name: 'CSA STAR Level 1',
    targetPhase: 4,
    effortPersonMonths: 2,
    customerRequirement: false,
    auditorType: 'self-assessment',
    status: 'planned',
    dependsOn: ['iso27001'],
  },
];

export type ComplianceMilestoneId = 'soc2-type-i' | 'soc2-type-ii' | 'iso27001' | 'csa-star';

export function getMilestone(id: ComplianceMilestoneId): ComplianceMilestone | undefined {
  return COMPLIANCE_MILESTONES.find((m) => m.id === id);
}
