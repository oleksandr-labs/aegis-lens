/**
 * Institutional grant & public funding registry.
 *
 * Реєстр інституційних грантів та публічного фінансування.
 *
 * Source: TODO/monetization/TODO_grants_public_funding.md
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type FunderType =
  | "eu"
  | "us-gov"
  | "un"
  | "private-foundation"
  | "ngo"
  | "government"
  | "academic"
  | "press-freedom";

export type GrantStatus =
  | "identified"
  | "researching"
  | "drafting"
  | "submitted"
  | "under-review"
  | "awarded"
  | "rejected"
  | "closed";

export interface Grant {
  id: string;
  funderName: string;
  programName: string;
  type: FunderType;
  status: GrantStatus;
  /** Estimated total award in USD */
  estimatedAmountUsd: number;
  /** ISO date string, e.g. "2025-03-31" */
  deadline?: string;
  /** Short description of the grant scope (English) */
  scope_en: string;
  /** 0–10: how well Aegis Lens mission aligns with funder priorities */
  alignmentScore: number;
  requiresNonProfit: boolean;
  requiresEuEntity: boolean;
  requiresOpenSource: boolean;
  applicationUrl?: string;
  notes_en: string;
  notes_uk: string;
}

// ── Registry ──────────────────────────────────────────────────────────────────

/**
 * Canonical registry of all identified grant opportunities.
 *
 * Канонічний реєстр усіх виявлених грантових можливостей.
 */
export const GRANT_REGISTRY: Grant[] = [
  // ── EU Programmes ──────────────────────────────────────────────────────────
  {
    id: "eu-horizon-europe-security",
    funderName: "European Commission",
    programName: "Horizon Europe — Security Research & Civic Tech (HORIZON-CL3)",
    type: "eu",
    status: "identified",
    estimatedAmountUsd: 3_000_000,
    scope_en:
      "Research and innovation projects in the area of civil security, " +
      "disaster risk reduction, border management, and conflict analysis. " +
      "Includes AI-assisted open-source intelligence tools with civic utility.",
    alignmentScore: 9,
    requiresNonProfit: false,
    requiresEuEntity: true,
    requiresOpenSource: false,
    applicationUrl: "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home",
    notes_en:
      "Requires EU-based legal entity or consortium lead. Consider applying as " +
      "part of a research consortium with a Ukrainian university partner.",
    notes_uk:
      "Потребує юридичної особи в ЄС або лідера консорціуму. Розглянути заявку " +
      "у складі дослідницького консорціуму з партнером — українським університетом.",
  },
  {
    id: "eu-cef-digital",
    funderName: "European Commission",
    programName: "Connecting Europe Facility (CEF) Digital — Cross-Border Digital Services",
    type: "eu",
    status: "identified",
    estimatedAmountUsd: 1_500_000,
    scope_en:
      "Cross-border digital infrastructure and services supporting European " +
      "digital sovereignty, data sharing, and interoperability. Relevant for " +
      "conflict-data pipelines with cross-border humanitarian utility.",
    alignmentScore: 7,
    requiresNonProfit: false,
    requiresEuEntity: true,
    requiresOpenSource: true,
    applicationUrl: "https://digital-strategy.ec.europa.eu/en/activities/cef-digital",
    notes_en:
      "Open-source deliverables required. Best suited once an EU subsidiary " +
      "or consortium partner is established.",
    notes_uk:
      "Обовʼязкові відкриті результати. Найкраще підходить після заснування " +
      "дочірньої компанії в ЄС або партнера-консорціуму.",
  },
  {
    id: "eu-creative-europe-journalism",
    funderName: "European Commission / IJ4EU",
    programName: "Creative Europe — Journalism / IJ4EU Investigative Journalism Fund",
    type: "eu",
    status: "identified",
    estimatedAmountUsd: 400_000,
    scope_en:
      "Support for investigative journalism projects with cross-border EU relevance. " +
      "IJ4EU specifically funds data-driven and OSINT-based investigations.",
    alignmentScore: 8,
    requiresNonProfit: true,
    requiresEuEntity: false,
    requiresOpenSource: false,
    applicationUrl: "https://www.investigativejournalismforeu.net/",
    notes_en:
      "IJ4EU open to non-EU applicants if investigating topics of EU relevance. " +
      "Ukraine war coverage qualifies. Requires press/media organisation status.",
    notes_uk:
      "IJ4EU відкритий для заявників поза ЄС, якщо тема стосується ЄС. " +
      "Висвітлення війни в Україні відповідає критеріям. " +
      "Потрібен статус медіаорганізації.",
  },

  // ── US Government ─────────────────────────────────────────────────────────
  {
    id: "us-state-drl",
    funderName: "US State Department — Bureau of Democracy, Human Rights, and Labor (DRL)",
    programName: "DRL Internet Freedom & Conflict Monitoring Technology Grants",
    type: "us-gov",
    status: "identified",
    estimatedAmountUsd: 500_000,
    scope_en:
      "Technology tools that advance democracy, human rights, and internet freedom " +
      "in repressive environments. Conflict-monitoring and OSINT platforms " +
      "supporting civil society in conflict zones are core priorities.",
    alignmentScore: 10,
    requiresNonProfit: true,
    requiresEuEntity: false,
    requiresOpenSource: false,
    applicationUrl: "https://www.state.gov/bureaus-offices/under-secretary-for-civilian-security-democracy-and-human-rights/bureau-of-democracy-human-rights-and-labor/",
    notes_en:
      "Highest alignment. DRL explicitly funds Ukraine civil-society tech. " +
      "Non-profit status (501c3 or equivalent) required. US co-applicant strengthens position.",
    notes_uk:
      "Найвища відповідність. DRL явно фінансує технології для громадянського " +
      "суспільства України. Потрібен статус НКО (501c3 або аналог). " +
      "Спів-заявник із США посилює позицію.",
  },
  {
    id: "us-ned",
    funderName: "National Endowment for Democracy (NED)",
    programName: "NED Core Grants — Democracy & Technology / Ukraine Focus",
    type: "us-gov",
    status: "identified",
    estimatedAmountUsd: 150_000,
    scope_en:
      "Smaller focused grants (typically $50k–$200k) for organisations strengthening " +
      "democratic governance, independent media, and civil society capacity. " +
      "Ukraine and Eastern Europe are priority regions.",
    alignmentScore: 9,
    requiresNonProfit: true,
    requiresEuEntity: false,
    requiresOpenSource: false,
    applicationUrl: "https://www.ned.org/apply-for-a-grant/",
    notes_en:
      "Smaller grant but fast cycle (6–9 months). Ideal as bridge funding while " +
      "larger grants are processed. Requires 501c3 or UA-NGO equivalent.",
    notes_uk:
      "Менший грант, але швидкий цикл (6–9 міс). Ідеально як проміжне " +
      "фінансування. Потрібен 501c3 або UA-НКО.",
  },
  {
    id: "us-otf",
    funderName: "Open Tech Fund (OTF)",
    programName: "Internet Freedom / Open Source Tech Fund",
    type: "us-gov",
    status: "identified",
    estimatedAmountUsd: 250_000,
    scope_en:
      "Funding for open-source internet freedom technologies, including tools for " +
      "circumvention, secure communications, and open-source OSINT/conflict monitoring.",
    alignmentScore: 8,
    requiresNonProfit: false,
    requiresEuEntity: false,
    requiresOpenSource: true,
    applicationUrl: "https://www.opentech.fund/",
    notes_en:
      "Open-source requirement is a firm condition. Must release core technology " +
      "under an approved open licence. Rolling applications with quarterly review.",
    notes_uk:
      "Вимога відкритого коду є жорсткою умовою. Необхідно публікувати ядро " +
      "технології під схваленою відкритою ліцензією. Постійні заявки, " +
      "квартальний розгляд.",
  },

  // ── Private Foundations ───────────────────────────────────────────────────
  {
    id: "sigrid-rausing-trust",
    funderName: "Sigrid Rausing Trust",
    programName: "Human Rights — Technology & Documentation",
    type: "private-foundation",
    status: "identified",
    estimatedAmountUsd: 300_000,
    scope_en:
      "Supports organisations documenting human-rights violations through " +
      "technology, including conflict evidence platforms and OSINT-based " +
      "accountability work.",
    alignmentScore: 9,
    requiresNonProfit: true,
    requiresEuEntity: false,
    requiresOpenSource: false,
    applicationUrl: "https://www.sigrid-rausing-trust.org/apply",
    notes_en:
      "Invitation-based; recommend establishing relationships with current grantees " +
      "to get an intro. 2-year grants typical. Strong fit for conflict-accountability angle.",
    notes_uk:
      "За запрошенням; рекомендується встановити звʼязки з поточними " +
      "грантоотримувачами для отримання рекомендації. Гранти на 2 роки. " +
      "Сильна відповідність для напряму підзвітності за конфліктом.",
  },
  {
    id: "knight-foundation",
    funderName: "Knight Foundation",
    programName: "Knight News Challenge / Technology for Democracy",
    type: "private-foundation",
    status: "identified",
    estimatedAmountUsd: 500_000,
    scope_en:
      "Funds technology and journalism projects that strengthen democracy and " +
      "informed communities. News Challenge specifically targets bold ideas at the " +
      "intersection of journalism and technology.",
    alignmentScore: 8,
    requiresNonProfit: false,
    requiresEuEntity: false,
    requiresOpenSource: false,
    applicationUrl: "https://knightfoundation.org/apply/",
    notes_en:
      "Open to US and international applicants. News Challenge has open rounds. " +
      "Strong emphasis on journalism utility and public-interest framing.",
    notes_uk:
      "Відкрито для заявників зі США та з-за кордону. News Challenge має " +
      "відкриті раунди. Сильний акцент на корисності для журналістики та " +
      "суспільно значущому позиціонуванні.",
  },
  {
    id: "mozilla-internet-society",
    funderName: "Mozilla Foundation / Internet Society Foundation",
    programName: "Mozilla Technology Fund / ISOC Grants",
    type: "private-foundation",
    status: "identified",
    estimatedAmountUsd: 200_000,
    scope_en:
      "Supports open-source technology, internet health, and digital rights. " +
      "Mozilla Technology Fund specifically targets open-source security and " +
      "privacy-preserving tools.",
    alignmentScore: 7,
    requiresNonProfit: false,
    requiresEuEntity: false,
    requiresOpenSource: true,
    applicationUrl: "https://foundation.mozilla.org/en/what-we-fund/",
    notes_en:
      "Mozilla prefers open-source projects with clear internet-health alignment. " +
      "ISOC has separate grant programmes with different focuses — apply to both.",
    notes_uk:
      "Mozilla надає перевагу проектам з відкритим кодом та явним звʼязком із " +
      "\"здоровʼям інтернету\". ISOC має окремі грантові програми — подавати до обох.",
  },

  // ── Ukrainian Government ──────────────────────────────────────────────────
  {
    id: "ua-gov-tech-grants",
    funderName: "Ukrainian Government / USAID Ukraine",
    programName: "Diia.City Tech Grants / Ukrainian Startup Fund (USF)",
    type: "government",
    status: "identified",
    estimatedAmountUsd: 100_000,
    scope_en:
      "Government and donor-supported grants for Ukrainian tech companies and " +
      "startups. Diia.City provides tax and regulatory benefits; USF provides " +
      "direct grant funding for early-stage Ukrainian tech.",
    alignmentScore: 8,
    requiresNonProfit: false,
    requiresEuEntity: false,
    requiresOpenSource: false,
    applicationUrl: "https://usf.com.ua/en/",
    notes_en:
      "Requires UA legal entity. USF grants up to $250k for early-stage tech. " +
      "Diia.City residency provides tax advantages rather than direct cash.",
    notes_uk:
      "Потребує UA юрособи. USF гранти до $250k для ранніх стадій tech. " +
      "Резидентство Diia.City надає податкові переваги, а не пряму готівку.",
  },

  // ── Regional / Bilateral Programs ─────────────────────────────────────────
  {
    id: "regional-bilateral-programs",
    funderName: "Poland / Germany / Czech / Baltic States / UK FCDO",
    programName: "Bilateral Support Programs for Ukrainian Civil Society & Tech",
    type: "government",
    status: "identified",
    estimatedAmountUsd: 250_000,
    scope_en:
      "Multiple national bilateral aid programs targeting Ukrainian civil society, " +
      "media, and technology. Includes UK FCDO Ukraine Civil Society Fund, " +
      "German Marshall Fund, Polish Support for Ukraine, and Baltic solidarity funds.",
    alignmentScore: 8,
    requiresNonProfit: true,
    requiresEuEntity: false,
    requiresOpenSource: false,
    applicationUrl: "https://www.gov.uk/guidance/uk-ukraine-tech-and-digital",
    notes_en:
      "Multiple funders — research each separately. UK FCDO has the strongest " +
      "OSINT/conflict monitoring fit. Apply through country-specific civil-society funds.",
    notes_uk:
      "Кілька донорів — досліджувати кожного окремо. UK FCDO має " +
      "найкращу відповідність OSINT/моніторингу конфліктів. Подавати через " +
      "державно-специфічні фонди громадянського суспільства.",
  },

  // ── UN / Humanitarian ─────────────────────────────────────────────────────
  {
    id: "un-ocha-iom-unhcr",
    funderName: "UN OCHA / IOM / UNHCR",
    programName: "Humanitarian Tech Innovation — Conflict Data & Displacement Monitoring",
    type: "un",
    status: "identified",
    estimatedAmountUsd: 500_000,
    scope_en:
      "UN agencies fund technology that supports humanitarian operations in " +
      "conflict zones — displacement tracking, shelter mapping, civilian safety " +
      "monitoring, and operational OSINT for humanitarian planning.",
    alignmentScore: 9,
    requiresNonProfit: true,
    requiresEuEntity: false,
    requiresOpenSource: false,
    applicationUrl: "https://www.unocha.org/cerf",
    notes_en:
      "OCHA/CERF typically for operational NGOs, not tech companies. Best path: " +
      "partner with an operational UN agency as the primary applicant, " +
      "Aegis Lens as the tech sub-grantee.",
    notes_uk:
      "OCHA/CERF зазвичай для операційних НКО, не tech-компаній. Найкращий шлях: " +
      "партнерство з операційним агентством ООН як основним заявником, " +
      "Aegis Lens як tech-суб-отримувачем.",
  },

  // ── Academic ──────────────────────────────────────────────────────────────
  {
    id: "academic-co-pi",
    funderName: "Universities / Research Councils (UKRI, NSF, ERC)",
    programName: "Academic Co-PI Research Grants — Conflict Studies & AI",
    type: "academic",
    status: "identified",
    estimatedAmountUsd: 600_000,
    scope_en:
      "Joint research grants with university principal investigators (co-PI model). " +
      "Research councils (UKRI, NSF, ERC) fund projects at the intersection of " +
      "AI, conflict studies, and open-source intelligence.",
    alignmentScore: 7,
    requiresNonProfit: false,
    requiresEuEntity: false,
    requiresOpenSource: true,
    applicationUrl: "https://www.ukri.org/opportunity/",
    notes_en:
      "Long cycle (12–18 months from conception to award). High prestige. " +
      "Identify faculty at UCL, Kings College, or Kyiv-Mohyla Academy working on " +
      "conflict data. Co-PI arrangement lets us access research funding.",
    notes_uk:
      "Довгий цикл (12–18 міс від ідеї до гранту). Висока престижність. " +
      "Знайти викладачів у UCL, Kingsʼs College або КМА, що працюють над " +
      "даними про конфлікти. Схема co-PI дає доступ до дослідницького фінансування.",
  },

  // ── Press Freedom ─────────────────────────────────────────────────────────
  {
    id: "press-freedom-orgs",
    funderName: "CPJ / RSF / ICFJ",
    programName: "Press Freedom Tech — Journalist Safety & OSINT Partnerships",
    type: "press-freedom",
    status: "identified",
    estimatedAmountUsd: 100_000,
    scope_en:
      "Partnerships and grants from press-freedom organisations supporting " +
      "technology tools for journalist safety, source protection, and conflict " +
      "reporting. CPJ, RSF, and ICFJ all have tech-partnership programmes.",
    alignmentScore: 9,
    requiresNonProfit: false,
    requiresEuEntity: false,
    requiresOpenSource: false,
    applicationUrl: "https://www.icfj.org/about/apply",
    notes_en:
      "ICFJ has direct tech partnership programmes. CPJ and RSF are primarily " +
      "advocacy orgs but can provide endorsements and introductions to funders. " +
      "Joint press-release value is high.",
    notes_uk:
      "ICFJ має прямі програми tech-партнерства. CPJ та RSF — переважно " +
      "адвокаційні організації, але можуть надати рекомендації та знайомства з " +
      "донорами. Цінність спільного прес-релізу висока.",
  },
];

// ── Query helpers ─────────────────────────────────────────────────────────────

/**
 * Filter grants by funder type.
 *
 * Фільтрувати гранти за типом фандера.
 */
export function getGrantsByType(type: FunderType): Grant[] {
  return GRANT_REGISTRY.filter((g) => g.type === type);
}

/**
 * Filter grants by current workflow status.
 *
 * Фільтрувати гранти за поточним статусом.
 */
export function getGrantsByStatus(status: GrantStatus): Grant[] {
  return GRANT_REGISTRY.filter((g) => g.status === status);
}

/**
 * Return grants sorted by alignment score, highest first.
 *
 * Повертає гранти, відсортовані за оцінкою відповідності (спадання).
 */
export function getTopAlignedGrants(limit = 5): Grant[] {
  return [...GRANT_REGISTRY]
    .sort((a, b) => b.alignmentScore - a.alignmentScore)
    .slice(0, limit);
}
