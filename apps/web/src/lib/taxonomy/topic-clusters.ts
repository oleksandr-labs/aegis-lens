/**
 * Aegis Lens — Topic Cluster Registry
 * 16 pillar clusters with full EN + UK content, build schedule, and helpers.
 */

import type { TopicCluster, TopicClusterId } from "./types";

export const TOPIC_CLUSTERS: TopicCluster[] = [
  {
    id: "osint-101",
    name_en: "OSINT Fundamentals",
    name_uk: "Основи розвідки з відкритих джерел",
    description_en:
      "A foundation cluster covering open-source intelligence methodology, key tools, legal frameworks, and verification workflows for analysts at every level.",
    description_uk:
      "Базовий кластер, що охоплює методологію розвідки з відкритих джерел, ключові інструменти, правові основи та процеси верифікації для аналітиків будь-якого рівня.",
    pillarSlug: "osint-fundamentals",
    childTopicCount: 20,
    quarterlyBuildPriority: 1,
    glossaryCrossLinks: [
      "open-source-intelligence",
      "verification-state",
      "confidence-score",
      "source-reliability",
    ],
    kgEntities: [
      "person",
      "organisation",
      "location",
      "document",
      "digital-asset",
    ],
    exampleChildSlugs: [
      "osint-tools-beginners-guide",
      "social-media-investigation-workflow",
      "source-verification-checklist",
      "legal-limits-of-osint",
      "building-an-osint-workflow",
    ],
  },
  {
    id: "photo-video-verification",
    name_en: "Photo & Video Verification Techniques",
    name_uk: "Верифікація фото та відео",
    description_en:
      "Techniques and tools for authenticating images and videos, including reverse image search, metadata analysis, shadow analysis, and deepfake detection.",
    description_uk:
      "Техніки та інструменти автентифікації зображень і відео: зворотний пошук зображень, аналіз метаданих, аналіз тіней і виявлення діпфейків.",
    pillarSlug: "photo-video-verification",
    childTopicCount: 18,
    quarterlyBuildPriority: 2,
    glossaryCrossLinks: [
      "geolocation",
      "chronolocation",
      "deepfake",
      "metadata",
      "verification-state",
    ],
    kgEntities: [
      "media-asset",
      "location",
      "timestamp",
      "person",
      "weapon-system",
    ],
    exampleChildSlugs: [
      "reverse-image-search-techniques",
      "exif-metadata-extraction",
      "sun-shadow-chronolocation",
      "video-keyframe-analysis",
      "deepfake-detection-tools",
    ],
  },
  {
    id: "geolocation",
    name_en: "Geolocation & GIS Analysis",
    name_uk: "Геолокація та ГІС-аналіз",
    description_en:
      "Methods for pinpointing real-world locations from images, videos, and reports using GIS tools, satellite cross-referencing, and terrain matching.",
    description_uk:
      "Методи визначення реальних місць за зображеннями, відео та звітами з використанням ГІС-інструментів, супутникових перехресних посилань і зіставлення рельєфу.",
    pillarSlug: "geolocation-gis",
    childTopicCount: 22,
    quarterlyBuildPriority: 1,
    glossaryCrossLinks: [
      "geospatial-intelligence",
      "geolocation",
      "aoi",
      "satellite-imagery",
      "osint",
    ],
    kgEntities: [
      "location",
      "infrastructure",
      "military-unit",
      "terrain-feature",
      "media-asset",
    ],
    exampleChildSlugs: [
      "google-earth-pro-geolocation-guide",
      "mapillary-street-level-matching",
      "terrain-profile-analysis",
      "coordinate-extraction-from-video",
      "ukraine-battlefield-geolocation-examples",
    ],
  },
  {
    id: "ai-for-intelligence",
    name_en: "AI Tools for Intelligence Analysts",
    name_uk: "Інструменти ШІ для аналітиків",
    description_en:
      "How artificial intelligence and machine learning accelerate OSINT workflows: entity recognition, object detection, translation, summarisation, and predictive analytics.",
    description_uk:
      "Як штучний інтелект і машинне навчання прискорюють процеси OSINT: розпізнавання сутностей, виявлення об'єктів, переклад, резюмування та прогностична аналітика.",
    pillarSlug: "ai-for-intelligence",
    childTopicCount: 20,
    quarterlyBuildPriority: 1,
    glossaryCrossLinks: [
      "open-source-intelligence",
      "confidence-score",
      "geospatial-intelligence",
      "deepfake",
    ],
    kgEntities: [
      "digital-asset",
      "weapon-system",
      "organisation",
      "location",
      "person",
    ],
    exampleChildSlugs: [
      "llm-assisted-report-summarisation",
      "ner-for-conflict-event-extraction",
      "object-detection-military-vehicles",
      "ai-translation-battlefield-comms",
      "predictive-event-modelling-ukraine",
    ],
  },
  {
    id: "satellite-analysis",
    name_en: "Satellite Imagery Analysis",
    name_uk: "Аналіз супутникових знімків",
    description_en:
      "Interpreting commercial and open satellite data to monitor military movements, infrastructure damage, and land-use change in conflict zones.",
    description_uk:
      "Інтерпретація комерційних і відкритих супутникових даних для відстеження воєнних переміщень, пошкоджень інфраструктури та змін землекористування в зонах конфліктів.",
    pillarSlug: "satellite-imagery-analysis",
    childTopicCount: 16,
    quarterlyBuildPriority: 2,
    glossaryCrossLinks: [
      "satellite-imagery",
      "geospatial-intelligence",
      "geolocation",
      "aoi",
    ],
    kgEntities: [
      "location",
      "infrastructure",
      "military-unit",
      "terrain-feature",
      "weapon-system",
    ],
    exampleChildSlugs: [
      "planet-labs-daily-imagery-workflow",
      "sentinel-hub-eo-browser-guide",
      "change-detection-war-damage-assessment",
      "thermal-infrared-for-military-fires",
      "sar-radar-imagery-explained",
    ],
  },
  {
    id: "maritime-intel",
    name_en: "Maritime Intelligence & AIS Tracking",
    name_uk: "Морська розвідка та відстеження AIS",
    description_en:
      "Monitoring vessel movements, identifying shadow fleet activity, and tracking sanctions evasion using AIS data and open maritime databases.",
    description_uk:
      "Моніторинг переміщень суден, виявлення тіньового флоту та відстеження порушень санкцій за допомогою даних AIS і відкритих морських баз даних.",
    pillarSlug: "maritime-intelligence",
    childTopicCount: 15,
    quarterlyBuildPriority: 3,
    glossaryCrossLinks: [
      "open-source-intelligence",
      "geospatial-intelligence",
      "aoi",
      "source-reliability",
    ],
    kgEntities: ["vessel", "location", "organisation", "port", "cargo"],
    exampleChildSlugs: [
      "marinetraffic-ais-tracking-guide",
      "shadow-fleet-identification-methods",
      "flag-of-convenience-research",
      "vessel-ownership-corporate-lookup",
      "black-sea-shipping-monitoring",
    ],
  },
  {
    id: "cyber-threat-intel",
    name_en: "Cyber Threat Intelligence & APT Tracking",
    name_uk: "Кіберзагрози та відстеження APT",
    description_en:
      "Identifying, attributing, and tracking advanced persistent threats, ransomware groups, and state-sponsored cyber operations using open-source CTI methods.",
    description_uk:
      "Виявлення, атрибуція та відстеження просунутих постійних загроз, груп вимагацького ПЗ і кібероперацій спецслужб методами CTI з відкритих джерел.",
    pillarSlug: "cyber-threat-intelligence",
    childTopicCount: 18,
    quarterlyBuildPriority: 2,
    glossaryCrossLinks: [
      "open-source-intelligence",
      "confidence-score",
      "verification-state",
      "source-reliability",
    ],
    kgEntities: [
      "threat-actor",
      "malware",
      "infrastructure",
      "organisation",
      "person",
    ],
    exampleChildSlugs: [
      "apt-attribution-methodology",
      "mitre-attck-framework-explained",
      "sandworm-group-profile",
      "ioc-hunting-with-shodan",
      "ransomware-group-tracking-open-sources",
    ],
  },
  {
    id: "drone-intelligence",
    name_en: "Drone Warfare & UAV Intelligence",
    name_uk: "Дронова розвідка та БПЛА",
    description_en:
      "Analysing unmanned aerial vehicle activity in conflict zones, identifying drone models, tracking procurement, and monitoring kamikaze drone impact sites.",
    description_uk:
      "Аналіз діяльності безпілотних літальних апаратів у зонах конфліктів, ідентифікація моделей дронів, відстеження закупівель і моніторинг місць ураження дронами-камікадзе.",
    pillarSlug: "drone-warfare-uav",
    childTopicCount: 20,
    quarterlyBuildPriority: 1,
    glossaryCrossLinks: [
      "geospatial-intelligence",
      "satellite-imagery",
      "open-source-intelligence",
      "confidence-score",
    ],
    kgEntities: [
      "uav",
      "weapon-system",
      "location",
      "military-unit",
      "infrastructure",
    ],
    exampleChildSlugs: [
      "shahed-136-identification-guide",
      "fpv-drone-warfare-tactics",
      "uav-wreckage-analysis-methods",
      "drone-procurement-tracking",
      "electronic-warfare-jamming-impact",
    ],
  },
  {
    id: "energy-grid-monitoring",
    name_en: "Energy Grid & Infrastructure Monitoring",
    name_uk: "Моніторинг енергосистеми та інфраструктури",
    description_en:
      "Tracking attacks on power stations, substations, pipelines, and water treatment facilities using satellite imagery, sensor data, and social media signals.",
    description_uk:
      "Відстеження атак на електростанції, підстанції, трубопроводи та водоочисні споруди за допомогою супутникових знімків, даних сенсорів і сигналів соцмереж.",
    pillarSlug: "energy-grid-infrastructure",
    childTopicCount: 15,
    quarterlyBuildPriority: 2,
    glossaryCrossLinks: [
      "geospatial-intelligence",
      "satellite-imagery",
      "aoi",
      "confidence-score",
    ],
    kgEntities: [
      "infrastructure",
      "location",
      "organisation",
      "weapon-system",
      "terrain-feature",
    ],
    exampleChildSlugs: [
      "ukraine-power-grid-damage-tracker",
      "thermal-satellite-power-plant-monitoring",
      "nighttime-lights-outage-detection",
      "gas-pipeline-leak-detection-methods",
      "critical-infrastructure-attack-database",
    ],
  },
  {
    id: "election-integrity",
    name_en: "Election Integrity & Vote Monitoring",
    name_uk: "Чесність виборів та моніторинг голосування",
    description_en:
      "Open-source methods for monitoring elections, detecting irregularities, tracking disinformation campaigns, and verifying observer reports.",
    description_uk:
      "Методи з відкритих джерел для моніторингу виборів, виявлення порушень, відстеження дезінформаційних кампаній і верифікації звітів спостерігачів.",
    pillarSlug: "election-integrity",
    childTopicCount: 14,
    quarterlyBuildPriority: 3,
    glossaryCrossLinks: [
      "open-source-intelligence",
      "verification-state",
      "confidence-score",
      "source-reliability",
    ],
    kgEntities: ["person", "organisation", "location", "document", "event"],
    exampleChildSlugs: [
      "social-media-election-monitoring",
      "voter-suppression-documentation",
      "parallel-vote-tabulation-methods",
      "disinformation-election-campaigns",
      "open-source-election-observation",
    ],
  },
  {
    id: "disinformation",
    name_en: "Disinformation Detection & Counter-Narratives",
    name_uk: "Виявлення дезінформації та протинаративи",
    description_en:
      "Identifying false narratives, coordinated inauthentic behaviour, and information operations using network analysis, reverse search, and linguistic indicators.",
    description_uk:
      "Виявлення хибних наративів, скоординованої неавтентичної поведінки та інформаційних операцій за допомогою мережевого аналізу, зворотного пошуку та лінгвістичних індикаторів.",
    pillarSlug: "disinformation-detection",
    childTopicCount: 22,
    quarterlyBuildPriority: 1,
    glossaryCrossLinks: [
      "deepfake",
      "open-source-intelligence",
      "verification-state",
      "source-reliability",
      "confidence-score",
    ],
    kgEntities: [
      "media-asset",
      "person",
      "organisation",
      "digital-asset",
      "event",
    ],
    exampleChildSlugs: [
      "coordinated-inauthentic-behaviour-detection",
      "state-media-narrative-tracking",
      "bot-network-identification-twitter",
      "russian-disinfo-playbook-analysis",
      "fact-check-workflow-guide",
    ],
  },
  {
    id: "humanitarian-mapping",
    name_en: "Humanitarian Mapping & Displacement Tracking",
    name_uk: "Гуманітарне картографування та переміщення",
    description_en:
      "Using OSINT and GIS to map displacement, aid corridors, shelter availability, and civilian harm in active conflict areas.",
    description_uk:
      "Використання OSINT і ГІС для картографування переміщень, гуманітарних коридорів, наявності сховищ та шкоди, завданої цивільному населенню в зонах активних конфліктів.",
    pillarSlug: "humanitarian-mapping",
    childTopicCount: 18,
    quarterlyBuildPriority: 2,
    glossaryCrossLinks: [
      "geospatial-intelligence",
      "aoi",
      "geolocation",
      "open-source-intelligence",
    ],
    kgEntities: [
      "location",
      "person",
      "infrastructure",
      "organisation",
      "event",
    ],
    exampleChildSlugs: [
      "idp-displacement-tracking-methodology",
      "humanitarian-corridor-mapping",
      "civilian-casualty-documentation",
      "shelter-capacity-satellite-assessment",
      "ukraine-mine-contamination-mapping",
    ],
  },
  {
    id: "sanctions-tracking",
    name_en: "Sanctions Evasion Detection & Tracking",
    name_uk: "Відстеження порушення санкцій",
    description_en:
      "Identifying corporate structures, shell companies, and financial flows used to circumvent OFAC, EU, and UK sanctions regimes.",
    description_uk:
      "Виявлення корпоративних структур, підставних компаній і фінансових потоків, що використовуються для обходу санкційних режимів OFAC, ЄС і Великої Британії.",
    pillarSlug: "sanctions-evasion",
    childTopicCount: 16,
    quarterlyBuildPriority: 2,
    glossaryCrossLinks: [
      "open-source-intelligence",
      "source-reliability",
      "confidence-score",
      "verification-state",
    ],
    kgEntities: [
      "person",
      "organisation",
      "vessel",
      "financial-instrument",
      "location",
    ],
    exampleChildSlugs: [
      "ofac-sdn-list-research-guide",
      "beneficial-ownership-investigation",
      "shell-company-identification-methods",
      "sanctions-evasion-maritime-routes",
      "luxury-goods-sanctions-tracking",
    ],
  },
  {
    id: "conflict-monitoring",
    name_en: "Conflict Monitoring per Region",
    name_uk: "Моніторинг конфліктів по регіонах",
    description_en:
      "Regional conflict monitoring hubs covering front-line changes, military losses, civilian harm, and key incidents across active theatres worldwide.",
    description_uk:
      "Регіональні хаби моніторингу конфліктів, що охоплюють зміни лінії фронту, бойові втрати, шкоду цивільному населенню та ключові інциденти на активних театрах воєнних дій по всьому світу.",
    pillarSlug: "conflict-monitoring",
    childTopicCount: 25,
    quarterlyBuildPriority: 1,
    glossaryCrossLinks: [
      "geospatial-intelligence",
      "confidence-score",
      "aoi",
      "osint",
      "verification-state",
    ],
    kgEntities: [
      "military-unit",
      "location",
      "weapon-system",
      "person",
      "event",
    ],
    exampleChildSlugs: [
      "ukraine-front-line-change-tracker",
      "kherson-oblast-monitoring",
      "zaporizhzhia-nuclear-plant-situation",
      "bakhmut-battle-documentation",
      "crimea-military-activity-tracker",
    ],
  },
  {
    id: "travel-risk",
    name_en: "Travel Risk Assessment & Advisories",
    name_uk: "Оцінка ризиків подорожей",
    description_en:
      "Country and region-level travel risk profiles, cross-referencing government advisories, conflict data, and real-time incident reports.",
    description_uk:
      "Профілі ризиків подорожей на рівні країн і регіонів з перехресними посиланнями на урядові рекомендації, дані про конфлікти та звіти про інциденти в реальному часі.",
    pillarSlug: "travel-risk-assessment",
    childTopicCount: 14,
    quarterlyBuildPriority: 3,
    glossaryCrossLinks: [
      "confidence-score",
      "open-source-intelligence",
      "source-reliability",
      "aoi",
    ],
    kgEntities: ["location", "event", "person", "organisation", "document"],
    exampleChildSlugs: [
      "ukraine-travel-risk-assessment",
      "russia-entry-restrictions-tracker",
      "belarus-border-crossing-risk",
      "middle-east-travel-advisory-synthesis",
      "conflict-zone-journalist-safety",
    ],
  },
  {
    id: "equipment-identification",
    name_en: "Military Equipment Identification",
    name_uk: "Ідентифікація військової техніки",
    description_en:
      "Visual and technical identification of tanks, artillery, air-defence systems, aircraft, and small arms from images, videos, and wreckage documentation.",
    description_uk:
      "Візуальна та технічна ідентифікація танків, артилерії, систем ППО, літальних апаратів і стрілецької зброї за зображеннями, відео та документацією уламків.",
    pillarSlug: "military-equipment-identification",
    childTopicCount: 18,
    quarterlyBuildPriority: 2,
    glossaryCrossLinks: [
      "open-source-intelligence",
      "geolocation",
      "confidence-score",
      "verification-state",
    ],
    kgEntities: [
      "weapon-system",
      "military-unit",
      "location",
      "person",
      "media-asset",
    ],
    exampleChildSlugs: [
      "t-72-vs-t-80-identification-guide",
      "buk-missile-system-variants",
      "russian-electronic-warfare-vehicles",
      "artillery-calibre-identification-photos",
      "small-arms-markings-database",
    ],
  },
];

/** Look up a single cluster by its id */
export function getClusterById(id: TopicClusterId): TopicCluster | undefined {
  return TOPIC_CLUSTERS.find((c) => c.id === id);
}

/** Return all clusters matching a given build priority (1, 2, or 3) */
export function getClustersByPriority(priority: number): TopicCluster[] {
  return TOPIC_CLUSTERS.filter((c) => c.quarterlyBuildPriority === priority);
}

export const CLUSTER_BUILD_SCHEDULE_EN =
  "Build 1 cluster per quarter. Priority 1 clusters launch first.";

export const CLUSTER_BUILD_SCHEDULE_UK =
  "Будуємо 1 кластер на квартал. Кластери пріоритету 1 запускаються першими.";
