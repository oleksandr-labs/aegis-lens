/**
 * Audience personas barrel — re-exports all persona configs and provides
 * PERSONA_REGISTRY with lookup helpers.
 *
 * Usage:
 *   import { PERSONA_REGISTRY, getPersonaById } from '@/lib/audiences';
 */

export * from './types';

export * from './osint-analyst';
export * from './journalist';
export * from './ngo-humanitarian';
export * from './civilian';
export * from './traders-finance';
export * from './security-firm';
export * from './government-defense';

import type { PersonaFeatureSet, PersonaId } from './types';
import { OSINT_ANALYST_FEATURES } from './osint-analyst';
import { JOURNALIST_FEATURES } from './journalist';
import { NGO_HUMANITARIAN_FEATURES } from './ngo-humanitarian';
import { CIVILIAN_FEATURES } from './civilian';
import { TRADERS_FINANCE_FEATURES } from './traders-finance';
import { SECURITY_FIRM_FEATURES } from './security-firm';
import { GOVERNMENT_DEFENSE_FEATURES } from './government-defense';

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

/** All configured persona feature sets in priority order (P1 → P8). */
export const PERSONA_REGISTRY: PersonaFeatureSet[] = [
  CIVILIAN_FEATURES,           // P1
  JOURNALIST_FEATURES,          // P2
  OSINT_ANALYST_FEATURES,       // P3
  NGO_HUMANITARIAN_FEATURES,    // P4
  GOVERNMENT_DEFENSE_FEATURES,  // P5
  SECURITY_FIRM_FEATURES,       // P6
  TRADERS_FINANCE_FEATURES,     // P8 (no P7 academic defined yet)
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Look up a persona by its `PersonaId`.
 * Returns `undefined` if the id is not in the registry.
 */
export function getPersonaById(id: PersonaId): PersonaFeatureSet | undefined {
  return PERSONA_REGISTRY.find((p) => p.personaId === id);
}

/**
 * Return all personas whose `recommendedTier` matches the given tier id.
 */
export function getPersonaForTier(tierId: string): PersonaFeatureSet[] {
  return PERSONA_REGISTRY.filter((p) => p.recommendedTier === tierId);
}
