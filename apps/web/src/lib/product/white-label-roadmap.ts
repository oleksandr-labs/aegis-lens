/**
 * White-Label Roadmap — Phase 3 white-labelling milestone spec.
 *
 * See apps/web/src/lib/licensing/white-label.ts for full implementation.
 * This file tracks the roadmap milestone and launch phase only.
 *
 * Рородмап white-label фази 3. Повна реалізація — у lib/licensing/white-label.ts.
 */

'use server';

// ── Launch phase ──────────────────────────────────────────────────────────────

export const WHITE_LABEL_LAUNCH_PHASE = 3 as const;

// ── Milestone config ──────────────────────────────────────────────────────────

export interface WhiteLabelRoadmapConfig {
  launchPhase: typeof WHITE_LABEL_LAUNCH_PHASE;
  /** Features included in white-label — Функції, включені у white-label */
  includedFeatures: string[];
  /** Features excluded from white-label — Функції, виключені з white-label */
  excludedFeatures: string[];
  /** Customisation options — Опції кастомізації */
  customisationOptions: string[];
  /** Full implementation reference — Посилання на повну реалізацію */
  implementationRef: string;
  /** Required tier — Необхідний tier */
  requiredTier: string;
}

export const WHITE_LABEL_ROADMAP_CONFIG: WhiteLabelRoadmapConfig = {
  launchPhase: WHITE_LABEL_LAUNCH_PHASE,
  includedFeatures: [
    'custom-domain',
    'custom-logo',
    'custom-colour-scheme',
    'custom-email-templates',
    'custom-login-page',
    'branded-pdf-reports',
    'remove-aegis-attribution',
  ],
  excludedFeatures: [
    'aegis-lens-api-attribution',    // Must remain in API responses
    'source-verification-badging',   // Verification marks remain for integrity
  ],
  customisationOptions: [
    'primary-colour',
    'secondary-colour',
    'logo-url',
    'favicon-url',
    'custom-domain',
    'support-email',
    'terms-url',
    'privacy-url',
  ],
  implementationRef: 'apps/web/src/lib/licensing/white-label.ts',
  requiredTier: 'enterprise',
};
