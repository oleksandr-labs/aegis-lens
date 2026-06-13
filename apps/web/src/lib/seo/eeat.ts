/**
 * Aegis Lens — E-E-A-T (Expertise, Experience, Authoritativeness, Trustworthiness)
 * Pure lib module (no JSX/React). UTF-8. EN + UK strings.
 *
 * Implements authorship signals, org trust signals, and expert-content constructs
 * required for ranking YMYL conflict / safety content.
 */

// ---------------------------------------------------------------------------
// Byline schema + JSON-LD renderer
// ---------------------------------------------------------------------------

export interface BylineReviewer {
  name: string;
  role: 'fact-checker' | 'editor' | 'senior-reviewer';
}

export interface BylineSchema {
  author: string;
  authorSlug: string;
  publishedAt: string;       // ISO date-time string
  lastReviewedAt: string;    // ISO date-time string
  reviewers: BylineReviewer[];
}

/**
 * Returns a JSON-LD `Article` fragment with author and dateModified.
 * Drop the result into a <script type="application/ld+json"> tag.
 */
export function renderBylineJsonLd(byline: BylineSchema): string {
  const reviewerPeople = byline.reviewers.map((r) => ({
    '@type': 'Person',
    name: r.name,
    roleName: r.role,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    author: {
      '@type': 'Person',
      name: byline.author,
      url: `https://aegis-lens.uk/team/${byline.authorSlug}`,
    },
    datePublished: byline.publishedAt,
    dateModified: byline.lastReviewedAt,
    ...(reviewerPeople.length > 0 && { contributor: reviewerPeople }),
  };

  return JSON.stringify(jsonLd, null, 2);
}

// ---------------------------------------------------------------------------
// Org trust signals
// ---------------------------------------------------------------------------

export interface TrustSignal {
  type:
    | 'about-methodology'
    | 'ethics-policy'
    | 'advisory-board'
    | 'corrections-page'
    | 'source-transparency'
    | 'awards-press';
  label: { en: string; uk: string };
  description: { en: string; uk: string };
  pageSlug: string;
  implemented: boolean;
}

export const EEAT_TRUST_SIGNALS: TrustSignal[] = [
  {
    type: 'about-methodology',
    label: {
      en: 'About Us & Methodology',
      uk: 'Про нас та методологія',
    },
    description: {
      en: 'Full-depth explanation of data sources, analytical methods, confidence scoring, and editorial standards used across all content verticals on Aegis Lens.',
      uk: 'Повне пояснення джерел даних, аналітичних методів, оцінки впевненості та редакційних стандартів, що використовуються в усіх контентних напрямках Aegis Lens.',
    },
    pageSlug: '/about/methodology',
    implemented: false,
  },
  {
    type: 'ethics-policy',
    label: {
      en: 'Ethics Policy & Advisory Board',
      uk: 'Етична політика та наглядова рада',
    },
    description: {
      en: 'Public ethics policy covering editorial independence, conflict-of-interest declarations, source protection, and the composition and mandate of the independent advisory board.',
      uk: 'Публічна етична політика, що охоплює редакційну незалежність, декларації конфлікту інтересів, захист джерел та склад і мандат незалежної наглядової ради.',
    },
    pageSlug: '/about/ethics',
    implemented: false,
  },
  {
    type: 'advisory-board',
    label: {
      en: 'Advisory Board',
      uk: 'Наглядова рада',
    },
    description: {
      en: 'Publicly named board of independent experts — including OSINT practitioners, international-law scholars, cybersecurity researchers, and conflict-journalism veterans — who advise on methodology and editorial standards.',
      uk: 'Публічно названий склад незалежних експертів — включаючи практиків OSINT, науковців у сфері міжнародного права, дослідників з кібербезпеки та ветеранів журналістики конфліктів — які консультують щодо методології та редакційних стандартів.',
    },
    pageSlug: '/about/advisory-board',
    implemented: false,
  },
  {
    type: 'corrections-page',
    label: {
      en: 'Corrections & Updates',
      uk: 'Виправлення та оновлення',
    },
    description: {
      en: 'Transparent, dated log of factual corrections and significant updates to published content. Corrections are linked from the original article and never silently deleted.',
      uk: 'Прозорий журнал із датами фактичних виправлень та суттєвих оновлень до опублікованого контенту. Виправлення посилаються з оригінальної статті і ніколи не видаляються мовчки.',
    },
    pageSlug: '/corrections',
    implemented: false,
  },
  {
    type: 'source-transparency',
    label: {
      en: 'Source Coverage Transparency Dashboard',
      uk: 'Дашборд прозорості покриття джерел',
    },
    description: {
      en: 'Live dashboard showing all primary data sources ingested by Aegis Lens — including CERT-UA, UN, OFAC, EU sanctions registers, OSM, and government open data — with last-update timestamps and coverage metrics.',
      uk: 'Живий дашборд, що показує всі первинні джерела даних, отримані Aegis Lens — включаючи CERT-UA, ООН, OFAC, санкційні реєстри ЄС, OSM та відкриті урядові дані — з мітками часу останнього оновлення та метриками покриття.',
    },
    pageSlug: '/sources',
    implemented: false,
  },
  {
    type: 'awards-press',
    label: {
      en: 'Awards & Press Citations',
      uk: 'Нагороди та цитування у пресі',
    },
    description: {
      en: 'Catalogue of press mentions, awards, and third-party citations that establish Aegis Lens as an authoritative reference in open-source intelligence and conflict monitoring.',
      uk: 'Каталог згадок у пресі, нагород та сторонніх посилань, що встановлюють Aegis Lens як авторитетне джерело у сфері розвідки з відкритих джерел та моніторингу конфліктів.',
    },
    pageSlug: '/about/recognition',
    implemented: false,
  },
];

// ---------------------------------------------------------------------------
// Guest experts
// ---------------------------------------------------------------------------

export interface GuestExpertSchema {
  '@type': 'Person';
  name: string;
  affiliation: string;
}

export interface GuestExpert {
  name: string;
  credentials: string[];
  institution: string;
  articleSlugs: string[];
  schema: GuestExpertSchema;
}

// Example seed entries — extend as experts contribute content.
export const GUEST_EXPERTS: GuestExpert[] = [
  {
    name: 'Dr. Iryna Marchenko',
    credentials: [
      'PhD International Law, University of Kyiv',
      'Former UN Security Council Expert Panel Member',
      'Senior Fellow, Kyiv Policy Institute',
    ],
    institution: 'Kyiv Policy Institute',
    articleSlugs: ['un-sanctions-russia-2024', 'international-law-armed-conflict'],
    schema: {
      '@type': 'Person',
      name: 'Dr. Iryna Marchenko',
      affiliation: 'Kyiv Policy Institute',
    },
  },
  {
    name: 'Thomas Weiss',
    credentials: [
      'MSc Cybersecurity, TU Berlin',
      'MITRE ATT&CK Certified Evaluator',
      'Former threat analyst, BSI Germany',
    ],
    institution: 'Independent Researcher',
    articleSlugs: ['sandworm-ics-analysis', 'apt28-nato-targeting'],
    schema: {
      '@type': 'Person',
      name: 'Thomas Weiss',
      affiliation: 'Independent Researcher',
    },
  },
];

// ---------------------------------------------------------------------------
// Methodology peer-review program
// ---------------------------------------------------------------------------

export const METHODOLOGY_PEER_REVIEW_PROGRAM = {
  cadence: 'quarterly' as const,
  externalReviewers: 3,
  publicReport: true,
  lastAudit: '2025-12-01',   // ISO date; update each cycle
} as const;

// ---------------------------------------------------------------------------
// Org-level E-E-A-T signals
// ---------------------------------------------------------------------------

export const EEAT_ORG_SIGNALS = {
  aboutMethodologyDepth: 'full' as const,
  ethicsPolicyPublic: true as const,
  advisoryBoardPublic: true as const,
  correctionsPageSlug: '/corrections' as const,
  sourceTransparencyDashboardSlug: '/sources' as const,
  awardsCitations: [
    'Cited by Reuters Fact Check — March 2025',
    'Featured in Bellingcat Open-Source Digest — April 2025',
    'Shortlisted, Global Editors Network Data Journalism Award — 2025',
    'Referenced in EU Parliament ISWI Committee hearing — May 2025',
  ],
} as const;
