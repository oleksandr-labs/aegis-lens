/**
 * Hub — Humanitarian
 * Pillar: /humanitarian  |  Subs: displacement · aid-corridors · shelters · food-security · mine-action
 * Note: pillar overview already implemented in Sprint 0.
 */

import type { FaqItem } from "./energy-security";

// ---------------------------------------------------------------------------
// URL map
// ---------------------------------------------------------------------------

export const HUMANITARIAN_HUB_URLS = {
  pillar: "/humanitarian",
  subs: {
    displacement: "/humanitarian/displacement",
    aidCorridors: "/humanitarian/aid-corridors",
    shelters: "/humanitarian/shelters",
    foodSecurity: "/humanitarian/food-security",
    mineAction: "/humanitarian/mine-action",
  },
} as const;

// ---------------------------------------------------------------------------
// OCHA / ReliefWeb feed configuration
// ---------------------------------------------------------------------------

export const OCHA_RELIEF_WEB_FEED_CONFIG = {
  endpoint: "https://api.reliefweb.int/v1/reports",
  filters: {
    country: "UKR",
    /** ISO 639-1 languages to accept. */
    language: ["en", "uk"],
    /** Only humanitarian situation reports and flash updates. */
    format: ["Situation Report", "Flash Update", "Map"],
  },
  updateIntervalSeconds: 1800,        // 30 minutes
  maxResults: 20,
  proxyPath: "/api/feeds/reliefweb",
  /** Full ReliefWeb developer docs. */
  docsUrl: "https://reliefweb.int/help/api",
} as const;

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface HumanitarianCrisisSubset {
  crisisId: string;
  name: string;
  region: string;                     // oblast name or region label
  idpCount?: number;                  // internally displaced persons
  affectedPopulation?: number;        // total affected population
  activeNGOs: string[];               // names of active NGOs / UN agencies on the ground
}

export interface EmbedKitConfig {
  iframeUrl: string;
  width: string;                      // CSS value, e.g. "100%"
  height: string;                     // CSS value, e.g. "520px"
  refreshSeconds: number;
  allowedOrigins: string[];
}

// ---------------------------------------------------------------------------
// Tracked crises
// ---------------------------------------------------------------------------

export const TRACKED_HUMANITARIAN_CRISES: HumanitarianCrisisSubset[] = [
  {
    crisisId: "ua-kherson-flood-2023",
    name: "Kakhovka Dam Destruction & Downstream Flooding",
    region: "Khersonska oblast",
    idpCount: 42000,
    affectedPopulation: 650000,
    activeNGOs: [
      "UNHCR",
      "ICRC",
      "MSF",
      "World Food Programme",
      "Save the Children",
      "Danish Refugee Council",
    ],
  },
  {
    crisisId: "ua-donbas-frontline-displacement",
    name: "Donbas Front-Line Displacement",
    region: "Donetska & Luhanska oblasts",
    idpCount: 1700000,
    affectedPopulation: 3200000,
    activeNGOs: [
      "UNHCR",
      "UNICEF",
      "OCHA",
      "Caritas Ukraine",
      "Médecins Sans Frontières",
      "Shelter Box",
      "People in Need",
    ],
  },
  {
    crisisId: "ua-zaporizhzhia-nuclear-buffer",
    name: "ZNPP Exclusion-Zone Humanitarian Impact",
    region: "Zaporizka oblast",
    idpCount: 15000,
    affectedPopulation: 80000,
    activeNGOs: [
      "IAEA (safety monitoring)",
      "ICRC",
      "UNHCR",
      "Caritas Ukraine",
    ],
  },
  {
    crisisId: "ua-mykolaiv-water-crisis",
    name: "Mykolaiv Urban Water-Supply Crisis",
    region: "Mykolaivska oblast",
    idpCount: 0,
    affectedPopulation: 470000,
    activeNGOs: [
      "UNICEF",
      "Action Against Hunger",
      "OCHA",
      "Welthungerhilfe",
    ],
  },
];

// ---------------------------------------------------------------------------
// NGO / UN persona surfaces
// ---------------------------------------------------------------------------

export interface PersonaSurface {
  personaType:
    | "humanitarian-coordinator"
    | "field-ngo"
    | "un-agency"
    | "journalist"
    | "donor"
    | "government-partner";
  label: { en: string; uk: string };
  recommendedPageSlugs: string[];
  feedFilters: {
    country?: string;
    category?: string[];
    format?: string[];
  };
}

export const NGO_UN_PERSONA_SURFACES: PersonaSurface[] = [
  {
    personaType: "humanitarian-coordinator",
    label: {
      en: "Humanitarian Coordinator",
      uk: "Гуманітарний координатор",
    },
    recommendedPageSlugs: [
      "/humanitarian",
      "/humanitarian/displacement",
      "/humanitarian/aid-corridors",
      "/humanitarian/shelters",
    ],
    feedFilters: {
      country: "UKR",
      format: ["Situation Report", "Flash Update"],
    },
  },
  {
    personaType: "field-ngo",
    label: {
      en: "Field NGO Worker",
      uk: "Польовий працівник НУО",
    },
    recommendedPageSlugs: [
      "/humanitarian/shelters",
      "/humanitarian/mine-action",
      "/humanitarian/food-security",
      "/energy-security",
    ],
    feedFilters: {
      country: "UKR",
      category: ["Mine Action", "Food and Nutrition", "Shelter and NFI"],
    },
  },
  {
    personaType: "un-agency",
    label: {
      en: "UN Agency Official",
      uk: "Представник агентства ООН",
    },
    recommendedPageSlugs: [
      "/humanitarian",
      "/humanitarian/displacement",
      "/sanctions/un",
      "/regions",
    ],
    feedFilters: {
      country: "UKR",
      format: ["Situation Report", "Map", "Assessment"],
    },
  },
  {
    personaType: "journalist",
    label: {
      en: "Investigative Journalist",
      uk: "Журналіст-розслідувач",
    },
    recommendedPageSlugs: [
      "/humanitarian/displacement",
      "/humanitarian/aid-corridors",
      "/investigations",
      "/satellite",
    ],
    feedFilters: {
      country: "UKR",
      format: ["Flash Update", "Press Release"],
    },
  },
  {
    personaType: "donor",
    label: {
      en: "Institutional Donor",
      uk: "Інституційний донор",
    },
    recommendedPageSlugs: [
      "/humanitarian",
      "/humanitarian/food-security",
      "/reports",
      "/datasets",
    ],
    feedFilters: {
      country: "UKR",
      format: ["Funding", "Situation Report"],
    },
  },
];

// ---------------------------------------------------------------------------
// Embed-kit configuration for partner organisations
// ---------------------------------------------------------------------------

export const HUMANITARIAN_EMBED_KIT: EmbedKitConfig = {
  iframeUrl: "https://aegislens.io/embed/humanitarian-map",
  width: "100%",
  height: "520px",
  refreshSeconds: 1800,
  allowedOrigins: [
    "https://reliefweb.int",
    "https://unocha.org",
    "https://unhcr.org",
    "https://icrc.org",
    "https://msf.org",
    "https://savethechildren.org",
  ],
};

// ---------------------------------------------------------------------------
// FAQ (10 Q&As — 3 open + 7 collapsed)
// ---------------------------------------------------------------------------

export const HUMANITARIAN_FAQ: FaqItem[] = [
  {
    id: "humanitarian-faq-1",
    defaultOpen: true,
    question: {
      en: "How many people have been internally displaced in Ukraine?",
      uk: "Скільки людей стали внутрішньо переміщеними особами в Україні?",
    },
    answer: {
      en: "As of early 2024 UNHCR estimates approximately 3.7 million internally displaced persons (IDPs) within Ukraine, in addition to over 6.5 million refugees who have fled to other countries. Total displacement figures fluctuate as people return to or leave liberated areas.",
      uk: "Станом на початок 2024 року УВКБ ООН оцінює кількість внутрішньо переміщених осіб (ВПО) в Україні приблизно в 3,7 млн, а також понад 6,5 млн біженців, які виїхали за кордон. Загальні показники переміщення коливаються через повернення людей до звільнених територій або виїзд з них.",
    },
  },
  {
    id: "humanitarian-faq-2",
    defaultOpen: true,
    question: {
      en: "What are humanitarian corridors and are they currently active?",
      uk: "Що таке гуманітарні коридори та чи вони наразі функціонують?",
    },
    answer: {
      en: "Humanitarian corridors are agreed routes for the safe evacuation of civilians from combat zones. Their operational status changes day-to-day based on ceasefire negotiations. Aegis Lens tracks announced and confirmed corridors in real time using Ukrainian government and ICRC sources. See /humanitarian/aid-corridors for the current status map.",
      uk: "Гуманітарні коридори — це узгоджені маршрути для безпечної евакуації мирного населення із зон бойових дій. Їхній операційний статус змінюється щоденно залежно від переговорів про припинення вогню. Aegis Lens відстежує оголошені та підтверджені коридори в реальному часі за даними українського уряду та МКЧХ. Поточну карту статусу дивіться на /humanitarian/aid-corridors.",
    },
  },
  {
    id: "humanitarian-faq-3",
    defaultOpen: true,
    question: {
      en: "How does landmine contamination affect humanitarian operations?",
      uk: "Як мінне забруднення впливає на гуманітарні операції?",
    },
    answer: {
      en: "Ukraine is believed to be one of the most heavily mined countries in the world following the full-scale invasion. Contaminated land impedes IDP returns, blocks agricultural access, and creates serious risks for aid-delivery routes. Aegis Lens's mine-action sub-hub cross-references HALO Trust, DRC, and SESU clearance data to map approximate safe-passage corridors.",
      uk: "Вважається, що після повномасштабного вторгнення Україна є однією з найбільш замінованих країн у світі. Забруднені землі заважають поверненню ВПО, блокують доступ до сільськогосподарських угідь і створюють серйозні ризики для маршрутів доставки гуманітарної допомоги. Субхаб Aegis Lens з розмінування зіставляє дані HALO Trust, DRC та ДСНС для картування приблизних безпечних коридорів.",
    },
  },
  {
    id: "humanitarian-faq-4",
    defaultOpen: false,
    question: {
      en: "What is the ReliefWeb API and why does Aegis Lens use it?",
      uk: "Що таке API ReliefWeb і навіщо його використовує Aegis Lens?",
    },
    answer: {
      en: "ReliefWeb is OCHA's authoritative global humanitarian-information platform. Its public API provides structured access to situation reports, maps, and assessments filtered by country, cluster, and format. Aegis Lens polls the API every 30 minutes to surface Ukraine-specific updates alongside our own OSINT events.",
      uk: "ReliefWeb — це авторитетна глобальна гуманітарна інформаційна платформа УКГС ООН. Її публічний API надає структурований доступ до ситуаційних звітів, карт та оцінок з фільтрацією за країною, кластером та форматом. Aegis Lens опитує API кожні 30 хвилин для відображення оновлень по Україні поряд із власними OSINT-подіями.",
    },
  },
  {
    id: "humanitarian-faq-5",
    defaultOpen: false,
    question: {
      en: "Can partner organisations embed the humanitarian map on their website?",
      uk: "Чи можуть організації-партнери вставити гуманітарну карту на свій сайт?",
    },
    answer: {
      en: "Yes. Aegis Lens provides a free embed kit for registered partner organisations (UN agencies, accredited NGOs, academic institutions). The kit includes an auto-refreshing iframe widget, a lightweight JSON feed, and API access. Contact partnerships@aegislens.io to apply.",
      uk: "Так. Aegis Lens надає безкоштовний набір для вбудовування зареєстрованим організаціям-партнерам (агентствам ООН, акредитованим НУО, науковим установам). Набір включає автоматично оновлюваний iframe-віджет, легкий JSON-фід та доступ до API. Для подачі заявки зверніться на partnerships@aegislens.io.",
    },
  },
  {
    id: "humanitarian-faq-6",
    defaultOpen: false,
    question: {
      en: "What is the food-security situation in Ukraine?",
      uk: "Якою є ситуація з продовольчою безпекою в Україні?",
    },
    answer: {
      en: "WFP estimates that roughly 17% of the Ukrainian population faces moderate-to-severe food insecurity, concentrated in front-line oblasts and areas under occupation. Disruptions to the Black Sea grain corridor and damage to storage facilities have compounded the problem. Aegis Lens's food-security sub-hub tracks IPC phase classifications at the oblast level.",
      uk: "За оцінками ВПП ООН, близько 17% населення України стикається з помірною або тяжкою продовольчою небезпекою, зосередженою в прифронтових і окупованих областях. Порушення зернового коридору через Чорне море та пошкодження зерносховищ ускладнили ситуацію. Субхаб Aegis Lens з продовольчої безпеки відстежує фазову класифікацію МКБ на рівні областей.",
    },
  },
  {
    id: "humanitarian-faq-7",
    defaultOpen: false,
    question: {
      en: "How is shelter need assessed for displaced persons?",
      uk: "Як оцінюється потреба у житлі для переміщених осіб?",
    },
    answer: {
      en: "UNHCR and local partners conduct rapid-needs assessments combining registration data, field surveys, and satellite-damage analysis. Aegis Lens cross-links shelter-cluster reports with our damage-assessment events to give a per-oblast picture of the gap between shelter capacity and estimated IDP numbers.",
      uk: "УВКБ ООН та місцеві партнери проводять оперативні оцінки потреб, поєднуючи реєстраційні дані, польові обстеження та супутниковий аналіз пошкоджень. Aegis Lens пов'язує звіти кластеру з питань житла з нашими подіями з оцінки збитків для формування обласної картини розриву між наявними житловими ресурсами та розрахунковою кількістю ВПО.",
    },
  },
  {
    id: "humanitarian-faq-8",
    defaultOpen: false,
    question: {
      en: "Are children disproportionately affected?",
      uk: "Чи непропорційно страждають діти?",
    },
    answer: {
      en: "UNICEF estimates that over 1.5 million children in Ukraine have been displaced. Schools have been damaged or destroyed in significant numbers, and child-protection concerns — including separation from parents, trauma, and recruitment risks — are elevated in conflict-affected areas. Aegis Lens tags events relevant to child protection with a dedicated filter.",
      uk: "ЮНІСЕФ оцінює кількість переміщених дітей в Україні понад 1,5 млн. Значна кількість шкіл пошкоджена або знищена, а проблеми захисту дітей — у тому числі розлучення з батьками, психологічна травма та ризики вербування — загострені в зонах конфлікту. Aegis Lens маркує події, пов'язані із захистом дітей, спеціальним фільтром.",
    },
  },
  {
    id: "humanitarian-faq-9",
    defaultOpen: false,
    question: {
      en: "How does Aegis Lens ensure the humanitarian data is neutral?",
      uk: "Як Aegis Lens забезпечує нейтральність гуманітарних даних?",
    },
    answer: {
      en: "We source data exclusively from internationally recognised humanitarian bodies (UN, ICRC, accredited NGOs) and apply a dual-source verification rule for all IDP and casualty figures. Editorial control over analytical narratives is separated from the automated data-ingestion pipeline. Our methodology is published at /methodology.",
      uk: "Ми використовуємо дані виключно з міжнародно визнаних гуманітарних організацій (ООН, МКЧХ, акредитованих НУО) та застосовуємо правило дводжерельної верифікації для всіх показників ВПО та жертв. Редакційний контроль над аналітичними матеріалами відокремлений від автоматизованого конвеєра збору даних. Наша методологія опублікована на /methodology.",
    },
  },
  {
    id: "humanitarian-faq-10",
    defaultOpen: false,
    question: {
      en: "How can I report a humanitarian need or incident not yet on Aegis Lens?",
      uk: "Як повідомити про гуманітарну потребу або інцидент, якого ще немає в Aegis Lens?",
    },
    answer: {
      en: "Use the 'Submit tip' button on any hub page. Submissions are reviewed by our analyst team within 24 hours. For urgent situations affecting immediate life-safety, contact OCHA directly at ochaukraine@un.org or call the national emergency number 112.",
      uk: "Скористайтеся кнопкою «Надіслати підказку» на будь-якій сторінці хабу. Звернення розглядаються нашою аналітичною командою протягом 24 годин. У невідкладних ситуаціях, що безпосередньо загрожують життю, зверніться безпосередньо до УКГС ООН за адресою ochaukraine@un.org або зателефонуйте на національний номер екстреної допомоги 112.",
    },
  },
];
