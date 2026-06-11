/**
 * Audience persona type definitions for Aegis Lens / Ukrainian MAP.
 * All persona feature configs implement these interfaces.
 */

export type PersonaId =
  | 'osint-analyst'
  | 'journalist'
  | 'ngo-humanitarian'
  | 'civilian'
  | 'trader-finance'
  | 'security-firm'
  | 'government-defense'
  | 'academic-researcher';

/**
 * Full feature-set descriptor for a persona — used in onboarding, landing pages,
 * and persona-switcher UI.
 */
export interface PersonaFeatureSet {
  personaId: PersonaId;
  name_en: string;
  name_uk: string;
  description_en: string;
  description_uk: string;
  /** Maps to a pricing tier key, e.g. 'pro', 'observer', 'enterprise', 'free' */
  recommendedTier: string;
  keyFeatures_en: string[];
  keyFeatures_uk: string[];
  /**
   * Ordered list of route segments the user is taken through during onboarding.
   * E.g. ['/onboarding/api-key', '/onboarding/sdk', '/onboarding/jupyter']
   */
  onboardingPath: string[];
  ctas: {
    primary_en: string;
    primary_uk: string;
    secondary_en?: string;
    secondary_uk?: string;
  };
  /** Slug for the dedicated landing page, e.g. 'osint-analyst' → /for/osint-analyst */
  landingPageSlug: string;
}

/**
 * Jobs-to-be-done + pain-point detail for a persona.
 * Used in methodology docs, sales enablement, and content strategy.
 */
export interface PersonaUseCase {
  personaId: PersonaId;
  jobToBeDone_en: string;
  jobToBeDone_uk: string;
  painPoints_en: string[];
  workflow_en: string[];
  keyDifferentiators_en: string[];
}
