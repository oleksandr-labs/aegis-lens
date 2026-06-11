/**
 * Partnership registry — strategic partners across data, distribution, research, NGO, cloud, and media.
 * A single anchor newsroom + a single anchor NGO = a year of organic growth.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type PartnerType =
  | "data-provider"
  | "distribution"
  | "research"
  | "ngo"
  | "media"
  | "cloud"
  | "academic";

export type PartnerStatus =
  | "prospect"
  | "outreach"
  | "in-discussion"
  | "signed"
  | "active"
  | "paused";

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  status: PartnerStatus;
  description_en: string;
  description_uk: string;
  contactEmail?: string;
  /** Plain-English description of expected strategic value */
  estimatedValue_en: string;
  /** Priority score 1–10 (10 = highest) */
  priorityScore: number;
  requiresLegalReview: boolean;
  /** URL of partner's public homepage */
  website?: string;
}

// ── Partner Registry ─────────────────────────────────────────────────────────

export const PARTNER_REGISTRY: Partner[] = [
  // ── Data providers ────────────────────────────────────────────────────────
  {
    id: "sentinel-hub",
    name: "Sentinel Hub (Sinergise)",
    type: "data-provider",
    status: "prospect",
    description_en:
      "Programmatic access to Copernicus Sentinel-1 SAR and Sentinel-2 optical imagery. Essential for the satellite change-detection layer.",
    description_uk:
      "Програмний доступ до знімків Copernicus Sentinel-1 SAR та Sentinel-2. Необхідно для рівня виявлення змін з супутника.",
    estimatedValue_en:
      "Unlocks satellite change-detection layer (Phase 1 core feature). Commercial API agreement needed.",
    priorityScore: 10,
    requiresLegalReview: true,
    website: "https://www.sentinel-hub.com",
  },
  {
    id: "planet-labs",
    name: "Planet Labs",
    type: "data-provider",
    status: "prospect",
    description_en:
      "Daily high-resolution commercial satellite imagery. Planet's SkySat constellation enables near-real-time change detection.",
    description_uk:
      "Щоденні комерційні супутникові знімки високої роздільної здатності. Constellation SkySat від Planet.",
    estimatedValue_en:
      "Phase 2 commercial satellite layer — differentiates Aegis from free-imagery-only platforms.",
    priorityScore: 8,
    requiresLegalReview: true,
    website: "https://www.planet.com",
  },
  {
    id: "aisstream",
    name: "AISStream",
    type: "data-provider",
    status: "prospect",
    description_en:
      "Real-time AIS maritime vessel tracking via WebSocket API. Covers Black Sea, Mediterranean, and global shipping lanes.",
    description_uk:
      "Відстеження морських суден AIS у реальному часі через WebSocket API. Чорне море, Середземномор'я та глобальні маршрути.",
    estimatedValue_en:
      "Enables Black Sea maritime tracking (1-Year target coverage). Low cost, high impact.",
    priorityScore: 9,
    requiresLegalReview: false,
    website: "https://aisstream.io",
  },
  {
    id: "spire-maritime",
    name: "Spire Global (Maritime)",
    type: "data-provider",
    status: "prospect",
    description_en:
      "Satellite AIS with dark-vessel detection and gap-filling for vessels that disable transponders.",
    description_uk:
      "Супутниковий AIS з виявленням 'темних' суден, які вимкнули транспондери.",
    estimatedValue_en:
      "Phase 3 data layer — dark-vessel detection is a major investigative differentiator.",
    priorityScore: 7,
    requiresLegalReview: true,
    website: "https://spire.com/maritime",
  },
  {
    id: "acled",
    name: "ACLED (Armed Conflict Location & Event Data)",
    type: "data-provider",
    status: "prospect",
    description_en:
      "Structured global conflict event database used by UN agencies and academic researchers. Partnership = cross-referencing and mutual citation.",
    description_uk:
      "Структурована глобальна база конфліктних подій, що використовується ООН та академічними дослідниками.",
    estimatedValue_en:
      "Data cross-reference + academic credibility + mutual backlinks from acleddata.com.",
    priorityScore: 9,
    requiresLegalReview: false,
    website: "https://acleddata.com",
  },
  // ── Distribution / Media ───────────────────────────────────────────────────
  {
    id: "financial-times",
    name: "Financial Times",
    type: "media",
    status: "prospect",
    description_en:
      "Anchor newsroom partnership: embed Aegis Lens map widget in FT Ukraine/conflict coverage. Highest-value press backlink.",
    description_uk:
      "Партнерство-якір з редакцією: вбудовування карти Aegis Lens у матеріали FT про Україну.",
    estimatedValue_en:
      "A single FT embed = DR94 dofollow backlink + brand endorsement to finance/policy audience.",
    priorityScore: 10,
    requiresLegalReview: false,
    website: "https://www.ft.com",
  },
  {
    id: "bbc-news",
    name: "BBC News",
    type: "media",
    status: "prospect",
    description_en:
      "Anchor broadcast partnership: BBC Ukraine service embed + potential data journalism collab.",
    description_uk:
      "Партнерство з BBC Ukraine: вбудовування + потенційна колаборація з data journalism.",
    estimatedValue_en:
      "BBC embed = mass credibility signal + DR95 backlink + access to BBC Ukraine audience (millions).",
    priorityScore: 10,
    requiresLegalReview: false,
    website: "https://www.bbc.com/news",
  },
  {
    id: "bellingcat",
    name: "Bellingcat",
    type: "distribution",
    status: "prospect",
    description_en:
      "Methodological partnership with the leading OSINT investigation organisation. Joint methodology publications, shared tooling, mutual citations.",
    description_uk:
      "Методологічне партнерство з провідною OSINT-організацією. Спільні публікації, інструменти, взаємне цитування.",
    estimatedValue_en:
      "Bellingcat endorsement = OSINT community credibility. Their methodology citations = academic snowball effect.",
    priorityScore: 9,
    requiresLegalReview: false,
    website: "https://www.bellingcat.com",
  },
  {
    id: "isw",
    name: "Institute for the Study of War (ISW)",
    type: "research",
    status: "prospect",
    description_en:
      "Research partnership with the leading US-based conflict analysis organisation. Daily conflict reports + map updates.",
    description_uk:
      "Партнерство з провідним американським аналітичним центром конфліктів. Щоденні звіти та оновлення карт.",
    estimatedValue_en:
      "ISW citation = top-tier OSINT credibility + backlink from understandingwar.org.",
    priorityScore: 8,
    requiresLegalReview: false,
    website: "https://www.understandingwar.org",
  },
  // ── NGO / Humanitarian ────────────────────────────────────────────────────
  {
    id: "un-ocha",
    name: "UN OCHA / ReliefWeb",
    type: "ngo",
    status: "prospect",
    description_en:
      "Data exchange with UN Office for the Coordination of Humanitarian Affairs. Aegis Lens data embedded in humanitarian response planning.",
    description_uk:
      "Обмін даними з OCHA ООН. Дані Aegis Lens використовуються в плануванні гуманітарного реагування.",
    estimatedValue_en:
      "UN partnership = humanitarian legitimacy + reliefweb.int backlink (DR82) + access to UN data feeds.",
    priorityScore: 9,
    requiresLegalReview: true,
    website: "https://reliefweb.int",
  },
  {
    id: "icrc",
    name: "ICRC (International Committee of the Red Cross)",
    type: "ngo",
    status: "prospect",
    description_en:
      "Infrastructure damage and IHL (international humanitarian law) violation tracking collaboration.",
    description_uk:
      "Відстеження пошкоджень інфраструктури та порушень МГП у співпраці з МКЧХ.",
    estimatedValue_en:
      "ICRC partnership = humanitarian credibility + access to protected-zone boundary data.",
    priorityScore: 8,
    requiresLegalReview: true,
    website: "https://www.icrc.org",
  },
  {
    id: "amnesty-international",
    name: "Amnesty International",
    type: "ngo",
    status: "prospect",
    description_en:
      "Collaboration on civilian harm documentation and infrastructure attack verification.",
    description_uk:
      "Співпраця у документуванні шкоди цивільному населенню та верифікації атак на інфраструктуру.",
    estimatedValue_en:
      "Amnesty collab = credibility for civilian harm data + amnesty.org backlink (DR85).",
    priorityScore: 7,
    requiresLegalReview: true,
    website: "https://www.amnesty.org",
  },
  {
    id: "crisis-group",
    name: "International Crisis Group",
    type: "research",
    status: "prospect",
    description_en:
      "Joint crisis-index research: Crisis Group's regional expertise + Aegis Lens real-time data = combined crisis briefings.",
    description_uk:
      "Спільне дослідження кризового індексу: регіональна експертиза Crisis Group + дані Aegis Lens у реальному часі.",
    estimatedValue_en:
      "Crisis Group citation = policy-maker audience + DR80 backlink from crisisgroup.org.",
    priorityScore: 8,
    requiresLegalReview: false,
    website: "https://www.crisisgroup.org",
  },
  // ── Academic ──────────────────────────────────────────────────────────────
  {
    id: "ucl",
    name: "University College London (UCL)",
    type: "academic",
    status: "prospect",
    description_en:
      "Research partnership with UCL's Department of Security and Crime Science or School of Slavonic and East European Studies (SSEES).",
    description_uk:
      "Дослідницьке партнерство з Департаментом безпеки UCL або Школою слов'янських та східноєвропейських досліджень.",
    estimatedValue_en:
      "UCL .ac.uk backlink + peer-reviewed methodology publication + research credibility.",
    priorityScore: 7,
    requiresLegalReview: true,
    website: "https://www.ucl.ac.uk",
  },
  {
    id: "kyiv-university",
    name: "Taras Shevchenko National University of Kyiv",
    type: "academic",
    status: "prospect",
    description_en:
      "Ukrainian academic partner for methodology review, local analyst training, and Ukrainian-language NLP research.",
    description_uk:
      "Академічний партнер в Україні для рецензування методології, навчання аналітиків та дослідження NLP.",
    estimatedValue_en:
      "Local academic credibility in Ukraine + .edu.ua backlink + analyst pipeline.",
    priorityScore: 7,
    requiresLegalReview: false,
    website: "https://www.knu.ua",
  },
  // ── Cloud / Tech ──────────────────────────────────────────────────────────
  {
    id: "aws",
    name: "Amazon Web Services",
    type: "cloud",
    status: "prospect",
    description_en:
      "AWS Activate / startup credits programme + co-marketing as a case study in conflict-intelligence infrastructure.",
    description_uk:
      "Програма AWS Activate / стартап-кредити + ко-маркетинг як кейс-стаді.",
    estimatedValue_en:
      "Up to $100k cloud credits + AWS case study publication = brand amplification.",
    priorityScore: 6,
    requiresLegalReview: false,
    website: "https://aws.amazon.com",
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    type: "cloud",
    status: "prospect",
    description_en:
      "Project Galileo — Cloudflare's free security programme for journalism and civil society organisations at risk.",
    description_uk:
      "Project Galileo — безкоштовний захист Cloudflare для журналістики та організацій громадянського суспільства.",
    estimatedValue_en:
      "Free Enterprise CDN + DDoS protection + brand mention in Cloudflare Galileo annual report.",
    priorityScore: 8,
    requiresLegalReview: false,
    website: "https://www.cloudflare.com/galileo",
  },
  {
    id: "wikimedia",
    name: "Wikimedia Foundation",
    type: "ngo",
    status: "prospect",
    description_en:
      "Open data exchange: contribute verified event data to Wikidata; use Wikipedia structured data for entity resolution.",
    description_uk:
      "Обмін відкритими даними: передача верифікованих подій у Wikidata; використання Вікіпедії для розпізнавання сутностей.",
    estimatedValue_en:
      "Wikidata integration = entity resolution quality + wikimedia.org backlink + open-source credibility.",
    priorityScore: 6,
    requiresLegalReview: false,
    website: "https://www.wikimedia.org",
  },
  {
    id: "osm-foundation",
    name: "OpenStreetMap Foundation",
    type: "ngo",
    status: "prospect",
    description_en:
      "Contribute infrastructure damage and frontline boundary data back to OpenStreetMap; use OSM as base-map layer.",
    description_uk:
      "Передача даних про пошкодження інфраструктури та лінії фронту до OpenStreetMap; використання OSM як базової карти.",
    estimatedValue_en:
      "OSM contribution = open-source community goodwill + osmfoundation.org citation.",
    priorityScore: 6,
    requiresLegalReview: false,
    website: "https://wiki.osmfoundation.org",
  },
  {
    id: "grafana-labs",
    name: "Grafana Labs",
    type: "cloud",
    status: "prospect",
    description_en:
      "Open-source observability stack (Grafana/Loki/Prometheus) used for platform monitoring. OSS community partnership.",
    description_uk:
      "Відкрита спостережна платформа (Grafana/Loki/Prometheus) для моніторингу сервісів.",
    estimatedValue_en:
      "OSS partner tier = Grafana blog case study + grafana.com backlink.",
    priorityScore: 4,
    requiresLegalReview: false,
    website: "https://grafana.com",
  },
];

// ── Utility Functions ─────────────────────────────────────────────────────────

/**
 * Returns all partners of a given type.
 */
export function getPartnersByType(type: PartnerType): Partner[] {
  return PARTNER_REGISTRY.filter((p) => p.type === type);
}

/**
 * Returns only active partners (status === 'active').
 */
export function getActivePartners(): Partner[] {
  return PARTNER_REGISTRY.filter((p) => p.status === "active");
}

/**
 * Returns partners sorted by priority score descending.
 */
export function getPartnersByPriority(): Partner[] {
  return [...PARTNER_REGISTRY].sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Returns partners requiring legal review before proceeding.
 */
export function getPartnersRequiringLegalReview(): Partner[] {
  return PARTNER_REGISTRY.filter((p) => p.requiresLegalReview);
}

/**
 * Returns partners in a given status.
 */
export function getPartnersByStatus(status: PartnerStatus): Partner[] {
  return PARTNER_REGISTRY.filter((p) => p.status === status);
}
