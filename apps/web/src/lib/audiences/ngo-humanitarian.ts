/**
 * NGO / Humanitarian persona — humanitarian layers, data export policy, grant eligibility.
 * Persona strategy: docs/audiences/personas.md §P4
 */

import type { PersonaFeatureSet, PersonaUseCase } from './types';

// ---------------------------------------------------------------------------
// Persona descriptors
// ---------------------------------------------------------------------------

export const NGO_HUMANITARIAN_FEATURES: PersonaFeatureSet = {
  personaId: 'ngo-humanitarian',
  name_en: 'NGO & Humanitarian Organisation',
  name_uk: 'НКО та гуманітарна організація',
  description_en:
    'Humanitarian, human-rights, and accountability NGOs documenting events for legal, ' +
    'advocacy, or aid-planning purposes. Revenue model: free/discounted tier for field ' +
    'orgs; grant-funded institutional purchases for UN/ICRC-type organisations.',
  description_uk:
    'Гуманітарні організації, організації з захисту прав людини та організації ' +
    'підзвітності, що документують події для юридичних, правозахисних або ' +
    'гуманітарних цілей.',
  recommendedTier: 'observer',
  keyFeatures_en: [
    'Humanitarian layer set: displaced populations, critical infrastructure damage, civilian-impact events',
    'Medical facilities, evacuation corridors, border crossings overlays',
    'Population-at-risk estimator with uncertainty bands',
    'Aid-route planner avoiding active conflict zones',
    'Field-team check-in via lightweight mobile app with offline cache',
    'Encrypted incident reporting from the field',
    'Shared organisational dashboard with multi-seat access',
    'UN OCHA and ReliefWeb feed coordination',
    'Data-handling agreement template for sensitive humanitarian data',
    'PII-zero mode (default for NGO tier)',
    'Audit log access for chain-of-custody documentation',
    'Anonymised data export for partner reports',
    '/humanitarian hub with per-crisis humanitarian briefs',
    'Partnership case studies (UN, MSF-style)',
  ],
  keyFeatures_uk: [
    'Гуманітарні шари: переміщені особи, пошкодження критичної інфраструктури, події з впливом на цивільних',
    'Накладення медичних закладів, коридорів евакуації, прикордонних переходів',
    'Оцінювач ризиків для населення із зазначенням невизначеності',
    'Планувальник гуманітарних маршрутів з обходом зон активних бойових дій',
    'Реєстрація місцезнаходження польових команд через мобільний застосунок з офлайн-кешем',
    'Зашифрована звітність про інциденти з поля',
    'Спільна інформаційна панель організації з багаторолевим доступом',
    'Координація з фідами ООН OCHA та ReliefWeb',
    'Шаблон угоди про обробку чутливих гуманітарних даних',
    'Режим нульових ПДн (типово для рівня НКО)',
    'Доступ до журналу аудиту для документування ланцюжка зберігання доказів',
    'Анонімізований експорт даних для партнерської звітності',
    'Хаб /humanitarian з брифами для кожної кризи',
    'Кейс-стаді партнерств (ООН, MSF-формат)',
  ],
  onboardingPath: [
    '/onboarding/welcome',
    '/onboarding/ngo-verification',
    '/onboarding/humanitarian-layers',
    '/onboarding/field-app-setup',
    '/onboarding/data-export-policy',
  ],
  ctas: {
    primary_en: 'Apply for NGO grant access',
    primary_uk: 'Подати заявку на грантовий доступ для НКО',
    secondary_en: 'View humanitarian layers demo',
    secondary_uk: 'Переглянути демо гуманітарних шарів',
  },
  landingPageSlug: 'ngo-humanitarian',
};

export const NGO_USE_CASE: PersonaUseCase = {
  personaId: 'ngo-humanitarian',
  jobToBeDone_en:
    'Determine where to send aid, which populations are at risk, and which corridors are open — ' +
    'with data rigorous enough for legal accountability reports and funder compliance.',
  jobToBeDone_uk:
    'Визначати, куди спрямувати допомогу, яке населення перебуває під загрозою та які ' +
    'коридори відкриті — з даними, достатньо суворими для юридичних звітів підзвітності ' +
    'та відповідності вимогам донорів.',
  painPoints_en: [
    'Humanitarian data scattered across UN portals, government sources, and social media',
    'Chain-of-custody for incident reports must survive legal scrutiny — most tools lack audit logs',
    'PII exposure risk when handling displaced-person data',
    'Aid routes change hourly; static maps become dangerous misinformation',
    'Field teams need offline capability in low-connectivity conflict zones',
    'Funder reporting requires anonymised aggregated datasets, not raw incident logs',
  ],
  workflow_en: [
    'Activate region-specific humanitarian layer stack for the area of operation',
    'Review population-at-risk estimator with uncertainty bands',
    'Plan aid routing around active conflict zones and known checkpoints',
    'Field team submits encrypted check-in and incident reports via mobile app',
    'Aggregate incidents into anonymised export for partner-reporting dashboard',
    'Generate compliance export with full audit log for legal documentation',
    'Cross-reference with UN OCHA and ReliefWeb feeds for situational awareness',
  ],
  keyDifferentiators_en: [
    'PII-zero mode prevents accidental exposure of displaced-person data',
    'Audit log with tamper-evident storage satisfies legal evidence requirements',
    'Offline-capable field app works in low-connectivity conflict zones',
    'Anonymisation pipeline built in — no custom ETL needed for funder reports',
    'Free NGO tier removes financial barrier for under-resourced field organisations',
  ],
};

// ---------------------------------------------------------------------------
// Humanitarian layers
// ---------------------------------------------------------------------------

export const HUMANITARIAN_LAYERS: {
  layerId: string;
  name_en: string;
  name_uk: string;
  dataSource: string;
  updateFrequency: string;
  freeForNGOs: boolean;
}[] = [
  {
    layerId: 'idp-tracking',
    name_en: 'IDP Tracking',
    name_uk: 'Відстеження ВПО',
    dataSource: 'UNHCR / IOM / national registry feeds',
    updateFrequency: 'Daily',
    freeForNGOs: true,
  },
  {
    layerId: 'casualty-datasets',
    name_en: 'Casualty Datasets',
    name_uk: 'Набори даних про втрати',
    dataSource: 'ACLED / UN OHCHR / Monitoring Mission cross-reference',
    updateFrequency: 'Daily',
    freeForNGOs: true,
  },
  {
    layerId: 'shelter-index',
    name_en: 'Shelter Index',
    name_uk: 'Реєстр укриттів',
    dataSource: 'Municipal data + OpenStreetMap + UNHCR shelter registry',
    updateFrequency: 'Weekly',
    freeForNGOs: true,
  },
  {
    layerId: 'evacuation-routing',
    name_en: 'Evacuation Routing',
    name_uk: 'Маршрути евакуації',
    dataSource: 'Government corridor announcements + community verification',
    updateFrequency: 'Real-time (as announced)',
    freeForNGOs: true,
  },
  {
    layerId: 'hospital-locations',
    name_en: 'Hospital & Medical Facility Locations',
    name_uk: 'Розташування лікарень і медичних закладів',
    dataSource: 'Ministry of Health / WHO / OpenStreetMap',
    updateFrequency: 'Weekly',
    freeForNGOs: true,
  },
  {
    layerId: 'checkpoint-activity',
    name_en: 'Checkpoint Activity',
    name_uk: 'Активність на блокпостах',
    dataSource: 'Community reports + OSINT monitoring',
    updateFrequency: 'Near real-time',
    freeForNGOs: true,
  },
  {
    layerId: 'water-food-access',
    name_en: 'Water & Food Access',
    name_uk: 'Доступ до води та їжі',
    dataSource: 'WFP / UNICEF / local NGO partner feeds',
    updateFrequency: 'Daily',
    freeForNGOs: true,
  },
  {
    layerId: 'landmine-contamination',
    name_en: 'Landmine Contamination Areas',
    name_uk: 'Зони мінного забруднення',
    dataSource: 'HALO Trust / UN Mine Action / Demining authority disclosures',
    updateFrequency: 'Weekly',
    freeForNGOs: true,
  },
  {
    layerId: 'border-crossing-status',
    name_en: 'Border Crossing Status',
    name_uk: 'Статус прикордонних переходів',
    dataSource: 'State Border Guard Service + UNHCR border monitoring',
    updateFrequency: 'Hourly',
    freeForNGOs: true,
  },
];

// ---------------------------------------------------------------------------
// NGO data export policy
// ---------------------------------------------------------------------------

export const NGO_DATA_EXPORT_POLICY: {
  anonymizationRequired: boolean;
  noPiiExport: boolean;
  partnerReportingAllowed: boolean;
  openDataCommitment: boolean;
  licenseType: string;
} = {
  anonymizationRequired: true,
  noPiiExport: true,
  partnerReportingAllowed: true,
  openDataCommitment: true,
  licenseType: 'CC BY 4.0 (aggregated datasets); proprietary (raw incident logs)',
};

// ---------------------------------------------------------------------------
// NGO grant eligibility
// ---------------------------------------------------------------------------

export const NGO_GRANT_ELIGIBILITY: {
  qualificationCriteria_en: string[];
  requiredDocs: string[];
  grantedTierId: string;
  discountPct: number;
} = {
  qualificationCriteria_en: [
    'Registered non-profit or NGO with active legal status',
    'Primary mission in humanitarian relief, human rights, or civilian protection',
    'Operations active in or directly serving conflict-affected populations',
    'Agreement to data-handling policy (PII-zero mode, no commercial redistribution)',
    'Agreement to attribute Aegis Lens in any public reports using platform data',
  ],
  requiredDocs: [
    'Certificate of registration (NGO or non-profit)',
    'Brief description of use case and geographic area of operation',
    'Contact details of designated data officer',
  ],
  grantedTierId: 'observer',
  discountPct: 100,
};
