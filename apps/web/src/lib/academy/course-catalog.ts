/**
 * Academy Course Catalog — Aegis Lens / Ukrainian MAP
 *
 * All products for the Academy monetization stream: free intro courses,
 * paid certifications, cohort bootcamps, and corporate training packages.
 *
 * Каталог курсів Академії: безкоштовні вступні, платні, буткемпи, корпоративні.
 * All monetary values in USD. Timestamps ISO 8601.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** Skill level required to enrol in a course. */
export type CourseLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

/** Delivery format of the course. */
export type CourseFormat =
  | "self-paced"
  | "cohort-based"
  | "corporate-private"
  | "bootcamp";

/**
 * A single course in the Academy catalog.
 *
 * Окремий курс у каталозі Академії.
 */
export interface Course {
  /** Unique stable identifier (kebab-case). */
  id: string;
  /** URL-friendly slug for routing. */
  slug: string;
  /** Course title in English. */
  title_en: string;
  /** Course title in Ukrainian. */
  title_uk: string;
  /** Short description in English (1–2 sentences). */
  description_en: string;
  /** Short description in Ukrainian (1–2 sentences). */
  description_uk: string;
  /** Skill level of the course. */
  level: CourseLevel;
  /** Delivery format. */
  format: CourseFormat;
  /** Estimated total duration in hours. */
  durationHours: number;
  /** List price in USD (0 for free courses). */
  priceUsd: number;
  /** Whether the full course is freely accessible without payment. */
  isFree: boolean;
  /** Slugs of courses that should be completed before this one. */
  prerequisites: string[];
  /** What students will be able to do after completing this course (EN). */
  learningOutcomes_en: string[];
  /** Instructor names or handles. */
  instructors: string[];
  /** Searchable tags. */
  tags: string[];
  /** Whether a certificate of completion is included. */
  certificationIncluded: boolean;
  /** Whether SCORM/xAPI export is available for enterprise LMS integration. */
  scormExportable: boolean;
  /** ISO 8601 creation date. */
  createdAt: string;
}

// ── Catalog ───────────────────────────────────────────────────────────────────

/**
 * Full course catalog.
 * Повний каталог курсів Академії.
 */
export const COURSE_CATALOG: Course[] = [
  // ── 1. OSINT 101 ────────────────────────────────────────────────────────────
  {
    id: "osint-101",
    slug: "osint-101",
    title_en: "OSINT 101: Introduction to Open-Source Intelligence",
    title_uk: "OSINT 101: Вступ до розвідки з відкритих джерел",
    description_en:
      "Learn the foundations of OSINT — what it is, why it matters, and how to get started responsibly. No prior experience required.",
    description_uk:
      "Вивчіть основи OSINT — що це таке, чому це важливо та як відповідально розпочати. Досвід не потрібен.",
    level: "beginner",
    format: "self-paced",
    durationHours: 4,
    priceUsd: 0,
    isFree: true,
    prerequisites: [],
    learningOutcomes_en: [
      "Define OSINT and distinguish it from other intelligence disciplines",
      "Identify reliable public sources and evaluate their credibility",
      "Conduct a basic person or organisation lookup using free tools",
      "Understand legal and ethical boundaries of open-source research",
      "Write a short intelligence summary from collected data",
    ],
    instructors: ["Aegis Lens Team"],
    tags: ["osint", "beginner", "intelligence", "free", "intro"],
    certificationIncluded: false,
    scormExportable: false,
    createdAt: "2024-01-15",
  },

  // ── 2. Photo / Video Verification ───────────────────────────────────────────
  {
    id: "photo-video-verification",
    slug: "photo-video-verification",
    title_en: "Photo & Video Verification Fundamentals",
    title_uk: "Основи верифікації фото та відео",
    description_en:
      "Detect manipulated images and videos using reverse-image search, metadata analysis, and geolocation techniques. Practical, case-based learning.",
    description_uk:
      "Виявляйте маніпульовані зображення та відео за допомогою зворотного пошуку, аналізу метаданих і геолокації. Практичне навчання на реальних кейсах.",
    level: "beginner",
    format: "self-paced",
    durationHours: 3,
    priceUsd: 0,
    isFree: true,
    prerequisites: [],
    learningOutcomes_en: [
      "Perform reverse-image search across Google, Yandex, TinEye, and Bing",
      "Extract and interpret EXIF/metadata from images and videos",
      "Identify common manipulation artefacts (cloning, splicing, AI generation)",
      "Date-stamp media using contextual clues and online tools",
      "Document verification findings for editorial or legal use",
    ],
    instructors: ["Aegis Lens Team"],
    tags: [
      "verification",
      "photo",
      "video",
      "fact-checking",
      "beginner",
      "free",
    ],
    certificationIncluded: false,
    scormExportable: false,
    createdAt: "2024-01-15",
  },

  // ── 3. Geolocation Fundamentals ─────────────────────────────────────────────
  {
    id: "geolocation-fundamentals",
    slug: "geolocation-fundamentals",
    title_en: "Geolocation Fundamentals",
    title_uk: "Основи геолокації",
    description_en:
      "Master open-source geolocation — from satellite imagery cross-referencing to shadow analysis and terrain matching. Covers Ukraine-specific workflows.",
    description_uk:
      "Оволодійте геолокацією з відкритих джерел — від порівняння супутникових знімків до аналізу тіней і зіставлення рельєфу. Охоплює специфічні для України робочі процеси.",
    level: "intermediate",
    format: "self-paced",
    durationHours: 8,
    priceUsd: 99,
    isFree: false,
    prerequisites: ["osint-101"],
    learningOutcomes_en: [
      "Use Google Earth, Sentinel Hub, and Planet Labs imagery for location verification",
      "Apply shadow and sun-angle analysis to date and locate media",
      "Match terrain, vegetation, and infrastructure across imagery sources",
      "Build a repeatable geolocation methodology for conflict zones",
      "Use Aegis Lens Copilot to accelerate geolocation tasks",
      "Document confidence levels and provenance for each location fix",
    ],
    instructors: ["Aegis Lens Geolocation Unit"],
    tags: ["geolocation", "satellite", "imagery", "intermediate", "ukraine"],
    certificationIncluded: false,
    scormExportable: true,
    createdAt: "2024-02-01",
  },

  // ── 4. Advanced Copilot Mastery ─────────────────────────────────────────────
  {
    id: "advanced-copilot-mastery",
    slug: "advanced-copilot-mastery",
    title_en: "Advanced Copilot Mastery",
    title_uk: "Просунуте опанування Copilot",
    description_en:
      "Deep-dive into Aegis Lens AI Copilot — prompt engineering for OSINT, custom rule builders, automated workflows, and API integration patterns.",
    description_uk:
      "Поглиблений огляд AI Copilot Aegis Lens — проєктування промптів для OSINT, конструктори правил, автоматизовані робочі процеси та патерни API-інтеграцій.",
    level: "advanced",
    format: "self-paced",
    durationHours: 6,
    priceUsd: 199,
    isFree: false,
    prerequisites: ["osint-101", "geolocation-fundamentals"],
    learningOutcomes_en: [
      "Write effective prompts for OSINT research and media verification",
      "Build and share custom Copilot rules for recurring tasks",
      "Connect Copilot to external APIs and data sources",
      "Design automated investigation workflows using the rule builder",
      "Measure Copilot output quality and reduce hallucination risk",
      "Integrate Copilot into team investigation processes",
    ],
    instructors: ["Aegis Lens AI Team"],
    tags: ["copilot", "ai", "advanced", "automation", "prompting"],
    certificationIncluded: false,
    scormExportable: true,
    createdAt: "2024-03-01",
  },

  // ── 5. Open-Source Conflict Intelligence ────────────────────────────────────
  {
    id: "open-source-conflict-intelligence",
    slug: "open-source-conflict-intelligence",
    title_en: "Open-Source Conflict Intelligence",
    title_uk: "Розвідка конфліктів з відкритих джерел",
    description_en:
      "Comprehensive course covering the full intelligence cycle for conflict environments: collection, processing, analysis, and dissemination using OSINT tools and structured analytic techniques.",
    description_uk:
      "Комплексний курс, що охоплює повний розвідувальний цикл для конфліктних середовищ: збір, обробка, аналіз та розповсюдження за допомогою OSINT-інструментів і структурованих аналітичних технік.",
    level: "advanced",
    format: "self-paced",
    durationHours: 10,
    priceUsd: 299,
    isFree: false,
    prerequisites: [
      "osint-101",
      "geolocation-fundamentals",
      "photo-video-verification",
    ],
    learningOutcomes_en: [
      "Apply the full intelligence cycle to a conflict monitoring task",
      "Build and maintain a knowledge graph of entities and events",
      "Conduct battle-damage assessment using open-source imagery",
      "Track unit movements, equipment, and logistics via OSINT",
      "Produce publication-ready intelligence reports with proper sourcing",
      "Manage information security and source protection in hostile environments",
      "Use structured analytic techniques (ACH, SWOT, red-teaming) for OSINT analysis",
    ],
    instructors: ["Aegis Lens Conflict Analysis Team"],
    tags: [
      "conflict",
      "intelligence",
      "advanced",
      "analysis",
      "ukraine",
      "military-osint",
    ],
    certificationIncluded: false,
    scormExportable: true,
    createdAt: "2024-03-15",
  },

  // ── 6. OSINT for Journalists ─────────────────────────────────────────────────
  {
    id: "osint-for-journalists",
    slug: "osint-for-journalists",
    title_en: "OSINT for Journalists",
    title_uk: "OSINT для журналістів",
    description_en:
      "Practical OSINT skills tailored for journalists — corporate ownership research, source verification, data-driven storytelling, and digital safety. Includes certification exam.",
    description_uk:
      "Практичні навички OSINT для журналістів — дослідження корпоративної власності, верифікація джерел, сторітелінг на основі даних та цифрова безпека. Включає іспит на сертифікацію.",
    level: "intermediate",
    format: "self-paced",
    durationHours: 5,
    priceUsd: 149,
    isFree: false,
    prerequisites: ["osint-101"],
    learningOutcomes_en: [
      "Trace company ownership structures through public registries",
      "Verify identities and claims using OSINT before publication",
      "Use data-journalism tools to visualise OSINT findings",
      "Protect sources and personal digital security while investigating",
      "Meet editorial standards for OSINT evidence in published pieces",
    ],
    instructors: ["Aegis Lens Editorial Team"],
    tags: ["journalism", "verification", "intermediate", "certification"],
    certificationIncluded: true,
    scormExportable: true,
    createdAt: "2024-04-01",
  },

  // ── 7. OSINT Bootcamp (cohort) ──────────────────────────────────────────────
  {
    id: "osint-bootcamp-cohort",
    slug: "osint-bootcamp-cohort",
    title_en: "OSINT Bootcamp (Cohort)",
    title_uk: "Буткемп з OSINT (когортний формат)",
    description_en:
      "Intensive 4–8-week instructor-led cohort. Live sessions, real investigation cases, TA support, peer review, and certificate of completion. Next cohort: quarterly intake.",
    description_uk:
      "Інтенсивний 4–8-тижневий когортний курс під керівництвом інструктора. Живі сесії, реальні розслідування, підтримка TA, пірингове рецензування та сертифікат. Наступний набір: щоквартально.",
    level: "advanced",
    format: "cohort-based",
    durationHours: 120,
    priceUsd: 1999,
    isFree: false,
    prerequisites: ["osint-101", "photo-video-verification"],
    learningOutcomes_en: [
      "Complete a full investigation from tasking to publication-ready report",
      "Collaborate in an OSINT team using shared tooling and workflows",
      "Apply advanced geolocation, entity tracking, and network analysis",
      "Present findings to a live audience and respond to questions",
      "Earn the Certified OSINT Analyst credential upon passing the final exam",
    ],
    instructors: ["Aegis Lens Lead Instructors", "Senior Analysts"],
    tags: [
      "bootcamp",
      "cohort",
      "advanced",
      "live",
      "certification",
      "intensive",
    ],
    certificationIncluded: true,
    scormExportable: false,
    createdAt: "2024-04-15",
  },

  // ── 8. Corporate Training Package ───────────────────────────────────────────
  {
    id: "corporate-training-package",
    slug: "corporate-training-package",
    title_en: "Corporate Training Package",
    title_uk: "Корпоративний тренінговий пакет",
    description_en:
      "Private instructor-led training programme customised for your organisation. Includes needs assessment, bespoke curriculum, dedicated TA, branded SCORM export, and group certification. Pricing from $5,000 to $25,000 depending on scope and headcount.",
    description_uk:
      "Приватна навчальна програма під керівництвом інструктора, адаптована для вашої організації. Включає оцінку потреб, індивідуальну навчальну програму, виділеного TA, брендований SCORM-експорт і групову сертифікацію. Ціна від $5 000 до $25 000 залежно від обсягу та кількості учасників.",
    level: "expert",
    format: "corporate-private",
    durationHours: 40,
    priceUsd: 10000,
    isFree: false,
    prerequisites: [],
    learningOutcomes_en: [
      "Customised to your team's specific intelligence requirements and workflows",
      "All staff trained to a consistent, auditable standard",
      "Branded digital certificates for all graduates",
      "Integration with your existing LMS via SCORM/xAPI",
      "Quarterly refresher options and re-certification support",
    ],
    instructors: ["Aegis Lens Corporate Training Division"],
    tags: [
      "corporate",
      "private",
      "custom",
      "expert",
      "enterprise",
      "scorm",
      "certification",
    ],
    certificationIncluded: true,
    scormExportable: true,
    createdAt: "2024-05-01",
  },
];

// ── Helper functions ──────────────────────────────────────────────────────────

/**
 * Return all courses with isFree === true.
 * Повертає всі безкоштовні курси.
 */
export function getFreeCourses(): Course[] {
  return COURSE_CATALOG.filter((c) => c.isFree);
}

/**
 * Return a single course by its slug, or undefined if not found.
 * Повертає курс за slug або undefined якщо не знайдено.
 */
export function getCourseBySlug(slug: string): Course | undefined {
  return COURSE_CATALOG.find((c) => c.slug === slug);
}

/**
 * Return courses filtered by level.
 * Повертає курси за рівнем складності.
 */
export function getCoursesByLevel(level: CourseLevel): Course[] {
  return COURSE_CATALOG.filter((c) => c.level === level);
}

/**
 * Return courses filtered by format.
 * Повертає курси за форматом.
 */
export function getCoursesByFormat(format: CourseFormat): Course[] {
  return COURSE_CATALOG.filter((c) => c.format === format);
}
