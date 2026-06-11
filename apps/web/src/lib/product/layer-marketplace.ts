/**
 * Layer Marketplace — Phase 4 community-curated map layer platform.
 *
 * Allows OSINT analysts and researchers to publish, share, and monetise
 * custom map layers. Layers are reviewed before public listing.
 *
 * Маркетплейс шарів фази 4: публікація, шерінг та монетизація кастомних шарів.
 */

'use server';

// ── Submission requirements ───────────────────────────────────────────────────

/**
 * Five requirements a layer submission must meet before review.
 *
 * П'ять вимог, яким має відповідати заявка на публікацію шару.
 */
export const LAYER_SUBMISSION_REQUIREMENTS = [
  'layer-must-implement-CoreLayer-interface',
  'metadata-complete-name-description-source-license',
  'no-personally-identifiable-information',
  'update-cadence-documented-minimum-weekly',
  'author-verified-account-minimum-observer-tier',
] as const;

export type LayerSubmissionRequirement = typeof LAYER_SUBMISSION_REQUIREMENTS[number];

// ── Review SLA ────────────────────────────────────────────────────────────────

/** Maximum review time in days — Максимальний час рев'ю (дні) */
export const LAYER_REVIEW_SLA_DAYS = 7;

// ── Layer listing ─────────────────────────────────────────────────────────────

export type LayerCategory =
  | 'conflict-events'
  | 'infrastructure'
  | 'humanitarian'
  | 'environment'
  | 'social-media'
  | 'satellite-derived'
  | 'economic'
  | 'other';

export type LayerLicense = 'cc-by-4.0' | 'cc-by-sa-4.0' | 'odc-odbl' | 'proprietary';

export interface MarketplaceLayer {
  id: string;
  name: string;
  authorUserId: string;
  category: LayerCategory;
  license: LayerLicense;
  /** Price in USD/month; 0 = free — Ціна (USD/міс); 0 = безкоштовно */
  priceUsdMonth: number;
  /** Update cadence description — Опис оновлення */
  updateCadence: string;
  /** Current status — Поточний статус */
  status: 'pending' | 'approved' | 'rejected' | 'deprecated';
  submittedAt: string;
  approvedAt: string | null;
}

// ── Marketplace config ────────────────────────────────────────────────────────

export interface LayerMarketplaceConfig {
  submissionRequirements: ReadonlyArray<LayerSubmissionRequirement>;
  reviewSlaDays: number;
  categories: LayerCategory[];
  licenses: LayerLicense[];
  /** Revenue share for paid layers (fraction for author) — Частка автора */
  authorRevenueShareFraction: number;
  /** Max free layers per user — Макс. безкоштовних шарів на користувача */
  maxFreeLayersPerUser: number;
  /** Max installed layers per workspace — Макс. шарів у робочому просторі */
  maxLayersPerWorkspace: number;
  /** Required tier to publish — Tier для публікації */
  publishRequiredTier: string;
}

export const LAYER_MARKETPLACE_CONFIG: LayerMarketplaceConfig = {
  submissionRequirements: LAYER_SUBMISSION_REQUIREMENTS,
  reviewSlaDays: LAYER_REVIEW_SLA_DAYS,
  categories: [
    'conflict-events', 'infrastructure', 'humanitarian', 'environment',
    'social-media', 'satellite-derived', 'economic', 'other',
  ],
  licenses: ['cc-by-4.0', 'cc-by-sa-4.0', 'odc-odbl', 'proprietary'],
  authorRevenueShareFraction: 0.70,
  maxFreeLayersPerUser: 5,
  maxLayersPerWorkspace: 20,
  publishRequiredTier: 'pro',
};

// ── Notes ─────────────────────────────────────────────────────────────────────

export const MARKETPLACE_NOTE_EN =
  'The layer marketplace is the community flywheel for Phase 4. ' +
  'Every approved layer enriches the platform for all users and creates ' +
  'passive income for OSINT researchers.';

export const MARKETPLACE_NOTE_UK =
  'Маркетплейс шарів — маховик спільноти для фази 4. ' +
  'Кожен схвалений шар збагачує платформу для всіх користувачів ' +
  'та забезпечує пасивний дохід OSINT-дослідникам.';
