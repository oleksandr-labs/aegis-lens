/**
 * Government & Defense persona — sovereign deployment, audit-grade, customisable intel.
 * Persona strategy: docs/audiences/personas.md §P5
 *
 * Sales note: gov sales cycles are long — trust-building (SOC 2, transparency reports)
 * starts Phase 1. Sovereign deployment options must be offered upfront.
 */

import type { PersonaFeatureSet, PersonaUseCase } from './types';

// ---------------------------------------------------------------------------
// Persona descriptors
// ---------------------------------------------------------------------------

export const GOVERNMENT_DEFENSE_FEATURES: PersonaFeatureSet = {
  personaId: 'government-defense',
  name_en: 'Government & Defense',
  name_uk: 'Уряд і оборона',
  description_en:
    'Government policy, foreign affairs, crisis-response teams, and defence academic researchers ' +
    'requiring audit-grade, sovereign-deployable, and highly customisable intelligence infrastructure.',
  description_uk:
    'Урядові органи, зовнішня політика, команди реагування на кризи та оборонні дослідники, ' +
    'яким потрібна розвідувальна інфраструктура аудиторського рівня, придатна для суверенного ' +
    'розгортання та широко налаштовувана.',
  recommendedTier: 'enterprise',
  keyFeatures_en: [
    'Sovereign deployment: on-prem, sovereign cloud (AWS GovCloud / OVH SecNumCloud / UA-resident)',
    'Air-gapped install package',
    'Custom data layers per contract',
    'Custom taxonomy and classification schemes',
    'SLA: 99.95% uptime with regional support coverage',
    'Audit log with tamper-evident storage',
    'Role-based geo-fencing per analyst clearance level',
    'Procurement pack: DUNS, security questionnaire, SBOM, vulnerability disclosure',
    'Historical archive access (5+ years)',
    'Bulk dataset exports in Parquet format',
    'Reproducible queries with versioned snapshots',
    'Citation DOIs for datasets via DataCite',
    'Embargo / pre-publication access for partner institutions',
    '/government and /defense landing pages with gated demo CTA',
    'Research collaborations directory',
  ],
  keyFeatures_uk: [
    'Суверенне розгортання: on-prem, суверенна хмара (AWS GovCloud / OVH SecNumCloud / UA-resident)',
    'Пакет для встановлення в ізольованій мережі (air-gapped)',
    'Кастомні шари даних за контрактом',
    'Власні таксономії та схеми класифікацій',
    'SLA: 99,95% доступності з регіональним покриттям підтримки',
    'Журнал аудиту з захищеним від підробки сховищем',
    'Геофенсинг на основі ролей за рівнем допуску аналітика',
    'Пакет для закупівлі: DUNS, анкета безпеки, SBOM, розкриття інформації про вразливості',
    'Доступ до архіву за 5+ років',
    'Масовий експорт наборів даних у форматі Parquet',
    'Відтворювані запити з версіонованими знімками',
    'DOI для цитування наборів даних через DataCite',
    'Ембарго / доступ до передпублікаційних даних для партнерських установ',
    'Цільові сторінки /government та /defense із CTA для демо з доступом',
    'Каталог дослідницьких партнерств',
  ],
  onboardingPath: [
    '/onboarding/welcome',
    '/onboarding/procurement-pack',
    '/onboarding/deployment-options',
    '/onboarding/custom-taxonomy',
    '/onboarding/audit-log-setup',
  ],
  ctas: {
    primary_en: 'Request a gated demo',
    primary_uk: 'Запросити демо за доступом',
    secondary_en: 'Download procurement pack',
    secondary_uk: 'Завантажити пакет для закупівлі',
  },
  landingPageSlug: 'government-defense',
};

export const GOVERNMENT_DEFENSE_USE_CASE: PersonaUseCase = {
  personaId: 'government-defense',
  jobToBeDone_en:
    'Produce audit-grade, defensible open-source intelligence briefings for senior decision-makers ' +
    'and defence researchers, with data infrastructure that satisfies sovereign procurement, ' +
    'security clearance, and compliance requirements.',
  jobToBeDone_uk:
    'Готувати розвіддані з відкритих джерел аудиторського рівня для старших посадовців ' +
    'та оборонних дослідників, з інфраструктурою даних, що відповідає вимогам суверенних ' +
    'закупівель, допусків безпеки та відповідності.',
  painPoints_en: [
    'Commercial SaaS tools cannot meet sovereign data residency requirements',
    'Long procurement cycles require extensive compliance documentation upfront',
    'Existing tools lack tamper-evident audit logs required for legal and oversight bodies',
    'Multi-tenant SaaS creates data isolation risk unacceptable for classified contexts',
    'Academic defence researchers need reproducible, citable datasets — not dashboards',
    'No structured pathway from OSINT analysis to executive-briefing format',
  ],
  workflow_en: [
    'Deploy Aegis Lens on sovereign-compliant infrastructure per contract specifications',
    'Configure custom taxonomy and classification schemes for organisational hierarchy',
    'Apply role-based geo-fencing to restrict analyst access by clearance level',
    'Monitor region-specific custom data layers with tamper-evident audit logging',
    'Generate reproducible versioned query snapshot for the period of interest',
    'Export bulk dataset in Parquet for academic or policy research processing',
    'Request DataCite DOI for published dataset citations in peer-reviewed work',
    'Deliver executive-briefing PDF with full source chain documentation',
  ],
  keyDifferentiators_en: [
    'Sovereign and air-gapped deployment options satisfy the strictest data residency requirements',
    'Tamper-evident audit log is the single most important requirement for accountability bodies',
    'Reproducible queries with stable IDs enable peer-reviewed and legally defensible analysis',
    'DataCite DOI integration makes Aegis Lens data citable in academic publications',
    'Procurement pack (DUNS, SBOM, security questionnaire) removes friction at the buying stage',
  ],
};
