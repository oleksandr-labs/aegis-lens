/**
 * Security & Private Intel Firms persona — API-first, reseller, white-label.
 * Persona strategy: docs/audiences/personas.md §P6
 * Highest revenue per seat/call — optimise API DX relentlessly.
 */

import type { PersonaFeatureSet, PersonaUseCase } from './types';

// ---------------------------------------------------------------------------
// Persona descriptors
// ---------------------------------------------------------------------------

export const SECURITY_FIRM_FEATURES: PersonaFeatureSet = {
  personaId: 'security-firm',
  name_en: 'Security & Private Intel Firm',
  name_uk: 'Охоронна та приватна розвідувальна компанія',
  description_en:
    'API-first enterprise customers who resell, embed, or augment their products with ' +
    'Aegis Lens data. Highest revenue per seat — API DX is the primary differentiator.',
  description_uk:
    'Підприємства з пріоритетом API, які перепродають, вбудовують або доповнюють ' +
    'свої продукти даними Aegis Lens. Найвищий дохід на місце — DX API є основним диференціатором.',
  recommendedTier: 'enterprise',
  keyFeatures_en: [
    'Enterprise API with high rate limits and contractual SLA',
    'Bulk historical export',
    'Webhook delivery with replay capability',
    'White-label option: custom domain, branding, and theme',
    'Co-branded reports',
    'Custom AOI (Area of Interest) monitoring — priced per AOI',
    'Travel-risk module — per-city scoring for client travel',
    'Asset-protection module — per-facility monitoring',
    'Reseller agreement template',
    'Partner portal: leads, commissions, joint marketing',
    'SOC 2 + ISO 27001 attestations',
    '/partners/security-firms landing page',
    '"vs in-house build" calculator',
    'STIX 2.1, TAXII 2.1, MISP, OpenIOC, CSV export formats',
    'Threat intelligence integration packages',
  ],
  keyFeatures_uk: [
    'Корпоративний API з високими лімітами запитів і договірним SLA',
    'Масовий експорт архівних даних',
    'Вебхук-доставка з можливістю повторного відтворення',
    'Опція White-label: власний домен, брендування та тема',
    'Спільні брендовані звіти',
    'Моніторинг власних AOI (зон інтересів) — ціна за AOI',
    'Модуль оцінки ризиків для подорожей — оцінка за містом',
    'Модуль захисту активів — моніторинг за об\'єктом',
    'Шаблон договору реселера',
    'Партнерський портал: ліди, комісійні, спільний маркетинг',
    'Атестації SOC 2 + ISO 27001',
    'Цільова сторінка /partners/security-firms',
    'Калькулятор «у порівнянні з власною розробкою»',
    'Формати експорту STIX 2.1, TAXII 2.1, MISP, OpenIOC, CSV',
    'Пакети інтеграції розвідки загроз',
  ],
  onboardingPath: [
    '/onboarding/welcome',
    '/onboarding/enterprise-api-keys',
    '/onboarding/webhook-configuration',
    '/onboarding/aoi-setup',
    '/onboarding/white-label-options',
  ],
  ctas: {
    primary_en: 'Talk to enterprise sales',
    primary_uk: 'Зв\'язатися з відділом корпоративних продажів',
    secondary_en: 'View API documentation',
    secondary_uk: 'Переглянути документацію API',
  },
  landingPageSlug: 'security-firm',
};

export const SECURITY_FIRM_USE_CASE: PersonaUseCase = {
  personaId: 'security-firm',
  jobToBeDone_en:
    'Embed real-time conflict and threat intelligence into client products and reports, ' +
    'with API reliability and export formats that integrate cleanly into existing analyst stacks.',
  jobToBeDone_uk:
    'Вбудовувати розвідку про конфлікти та загрози в реальному часі в клієнтські продукти ' +
    'та звіти, з надійністю API та форматами експорту, що легко інтегруються в наявні ' +
    'аналітичні стеки.',
  painPoints_en: [
    'Building proprietary conflict-monitoring capability in-house is cost-prohibitive',
    'Existing data vendors lack OSINT-sourced early signals from conflict zones',
    'Client deliverables require structured formats (STIX, MISP) — JSON-only APIs fall short',
    'White-label capability missing — cannot serve clients under own brand using third-party data',
    'No reseller structure — no commercial pathway for embedding data in client platforms',
    'SOC 2 / ISO 27001 compliance required by enterprise clients before API onboarding',
  ],
  workflow_en: [
    'Ingest Aegis Lens event stream via high-rate-limit enterprise API',
    'Configure custom AOI monitoring for client watchlists',
    'Set up webhook with replay for resilient delivery to client systems',
    'Export threat intelligence in STIX 2.1 or MISP format for SIEM integration',
    'Generate co-branded or white-label report from curated event set',
    'Run travel-risk module to produce per-city safety scores for client travel desk',
    'Deliver asset-protection alert to facility security team via webhook',
  ],
  keyDifferentiators_en: [
    'STIX 2.1, TAXII 2.1, MISP, and OpenIOC exports cover all major SIEM and TIP platforms',
    'White-label option enables resale without exposing Aegis Lens branding to end clients',
    'Partner portal creates a structured commercial pathway — not just API access',
    'SOC 2 + ISO 27001 attestations satisfy enterprise procurement requirements',
    'Webhook replay ensures zero event loss even during downstream system downtime',
  ],
};

// ---------------------------------------------------------------------------
// Threat intel export formats
// ---------------------------------------------------------------------------

export const THREAT_INTEL_EXPORT_FORMATS: {
  format: string;
  version: string;
  supported: boolean;
  note_en: string;
}[] = [
  {
    format: 'STIX',
    version: '2.1',
    supported: true,
    note_en:
      'Full STIX 2.1 bundle export including Indicator, Threat-Actor, Attack-Pattern, ' +
      'Observed-Data, Location, Malware, and Tool objects.',
  },
  {
    format: 'TAXII',
    version: '2.1',
    supported: true,
    note_en:
      'TAXII 2.1 server endpoint available for enterprise tier; supports Collection ' +
      'and Channel patterns for pull and push consumption.',
  },
  {
    format: 'MISP',
    version: '2.4',
    supported: true,
    note_en:
      'MISP-compatible JSON export with event, attribute, and tag structure. ' +
      'Direct MISP feed URL available for automated sync.',
  },
  {
    format: 'OpenIOC',
    version: '1.1',
    supported: true,
    note_en:
      'OpenIOC XML export for legacy SIEM and endpoint detection platforms. ' +
      'Indicator logic mapped from verified OSINT events.',
  },
  {
    format: 'CSV',
    version: 'n/a',
    supported: true,
    note_en:
      'Flat CSV export with configurable field selection. Suitable for spreadsheet ' +
      'analysis and import into non-standard toolchains.',
  },
];

// ---------------------------------------------------------------------------
// Corporate security use cases
// ---------------------------------------------------------------------------

export const CORPORATE_SECURITY_USE_CASES_EN: string[] = [
  'Travel risk assessment — per-city and per-region safety scoring for employee travel planning',
  'Facility security monitoring — real-time alerts for events in the vicinity of client assets',
  'Executive protection — threat intelligence overlay for executive movement planning',
  'Supply chain risk — monitoring of logistics corridors, ports, and supplier regions',
  'Cyber threat correlation — mapping physical OSINT events to concurrent cyber threat indicators',
  'Crisis response planning — pre-built scenario playbooks triggered by event type and severity',
  'Counterparty due diligence — sanctions and conflict-exposure checks on business partners',
  'Sector risk reporting — regular threat landscape briefings for specific verticals',
];
