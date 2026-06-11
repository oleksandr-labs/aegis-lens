/**
 * Report Generator Config — AI-powered intelligence report generation + delivery.
 *
 * Supports four report types with four delivery channels.
 * Reports are generated asynchronously and queued via the same AI summary
 * infrastructure (backed by Claude).
 *
 * Генератор звітів: 4 типи + 4 канали доставки на базі Claude.
 */

'use server';

// ── Report types ──────────────────────────────────────────────────────────────

export type ReportType =
  | 'daily-brief'
  | 'weekly-summary'
  | 'custom-query'
  | 'attribution';

export const REPORT_TYPES: ReportType[] = [
  'daily-brief',
  'weekly-summary',
  'custom-query',
  'attribution',
];

// ── Delivery channels ─────────────────────────────────────────────────────────

export const REPORT_DELIVERY_CHANNELS = ['email', 'webhook', 'in-app', 'pdf-download'] as const;
export type ReportDeliveryChannel = typeof REPORT_DELIVERY_CHANNELS[number];

// ── Report type metadata ──────────────────────────────────────────────────────

export interface ReportTypeMeta {
  type: ReportType;
  /** Display name — Назва */
  name: string;
  /** Typical generation time in seconds — Типовий час генерації (сек) */
  generationTimeSec: number;
  /** Approximate token budget — Приблизний бюджет токенів */
  tokenBudget: number;
  /** Whether it can be scheduled — Чи можна запланувати */
  schedulable: boolean;
  /** Required tier — Необхідний tier */
  requiredTier: string;
}

export const REPORT_TYPE_META: Record<ReportType, ReportTypeMeta> = {
  'daily-brief': {
    type: 'daily-brief',
    name: 'Daily Intelligence Brief',
    generationTimeSec: 30,
    tokenBudget: 2_000,
    schedulable: true,
    requiredTier: 'pro',
  },
  'weekly-summary': {
    type: 'weekly-summary',
    name: 'Weekly Summary',
    generationTimeSec: 60,
    tokenBudget: 4_000,
    schedulable: true,
    requiredTier: 'pro',
  },
  'custom-query': {
    type: 'custom-query',
    name: 'Custom Intelligence Query',
    generationTimeSec: 45,
    tokenBudget: 3_000,
    schedulable: false,
    requiredTier: 'pro',
  },
  'attribution': {
    type: 'attribution',
    name: 'Attribution Analysis',
    generationTimeSec: 120,
    tokenBudget: 6_000,
    schedulable: false,
    requiredTier: 'enterprise',
  },
};

// ── Generator config ──────────────────────────────────────────────────────────

export interface ReportGeneratorConfig {
  reportTypes: ReportType[];
  deliveryChannels: ReadonlyArray<ReportDeliveryChannel>;
  typeMeta: Record<ReportType, ReportTypeMeta>;
  /** Max queued reports per user — Макс. звітів у черзі на користувача */
  maxQueuedReportsPerUser: number;
  /** Report retention in days — Зберігання звітів (дні) */
  retentionDays: number;
  /** Max scheduled reports per user — Макс. запланованих звітів */
  maxScheduledReportsPerUser: number;
}

export const REPORT_GENERATOR_CONFIG: ReportGeneratorConfig = {
  reportTypes: REPORT_TYPES,
  deliveryChannels: REPORT_DELIVERY_CHANNELS,
  typeMeta: REPORT_TYPE_META,
  maxQueuedReportsPerUser: 5,
  retentionDays: 90,
  maxScheduledReportsPerUser: 10,
};
