/**
 * Hub — Maritime Intelligence
 * Pillar: /maritime  |  Subs: shadow-fleet · port-ops · piracy · cable-security
 * Note: pillar overview already implemented in Sprint 0.
 */

import type { FaqItem } from "./energy-security";

// ---------------------------------------------------------------------------
// URL map
// ---------------------------------------------------------------------------

export const MARITIME_HUB_URLS = {
  pillar: "/maritime",
  subs: {
    shadowFleet: "/maritime/shadow-fleet",
    portOps: "/maritime/port-ops",
    piracy: "/maritime/piracy",
    cableSecurity: "/maritime/cable-security",
  },
} as const;

// ---------------------------------------------------------------------------
// AIS / SAR demo configuration
// ---------------------------------------------------------------------------

export const AIS_SAR_DEMO_CONFIG = {
  /** Demo MMSI numbers: mix of bulk carriers, tankers, and publicly tracked vessels. */
  demoVesselMmsi: [
    "636020897",   // bulk carrier — Liberia flag
    "255805860",   // tanker — Madeira (Portugal) flag
    "477267100",   // container ship — Hong Kong flag
    "273358870",   // general cargo — Russia flag (sanctions monitoring)
    "374274000",   // crude tanker — Panama flag (shadow-fleet watch)
    "667001752",   // bulk carrier — Sierra Leone flag
  ],
  mapCenter: {
    lat: 45.5,    // Black Sea centre-of-gravity
    lng: 33.5,
  },
  zoom: 6,
  tileProvider: "openstreetmap" as const,
  aisSource: "https://www.marinetraffic.com",
  refreshIntervalSeconds: 300,
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MaritimeRegionalFocus = {
  region: "black-sea" | "red-sea" | "south-china-sea" | "indo-pacific";
  watchedPorts: string[];
  threatLevel: "low" | "medium" | "high";
};

// ---------------------------------------------------------------------------
// Regional focus data
// ---------------------------------------------------------------------------

export const MARITIME_REGIONAL_FOCUSES: MaritimeRegionalFocus[] = [
  {
    region: "black-sea",
    watchedPorts: [
      "Odesa (UA)",
      "Chornomorsk (UA)",
      "Pivdennyi (UA)",
      "Novorossiysk (RU)",
      "Sevastopol (UA — occupied)",
      "Constanta (RO)",
      "Varna (BG)",
    ],
    threatLevel: "high",
  },
  {
    region: "red-sea",
    watchedPorts: [
      "Jeddah (SA)",
      "Port Sudan (SD)",
      "Aden (YE)",
      "Djibouti (DJ)",
      "Eilat (IL)",
    ],
    threatLevel: "high",
  },
  {
    region: "south-china-sea",
    watchedPorts: [
      "Singapore (SG)",
      "Port Klang (MY)",
      "Hong Kong (HK)",
      "Kaohsiung (TW)",
      "Manila (PH)",
    ],
    threatLevel: "medium",
  },
  {
    region: "indo-pacific",
    watchedPorts: [
      "Colombo (LK)",
      "Mumbai (IN)",
      "Darwin (AU)",
      "Busan (KR)",
      "Yokohama (JP)",
    ],
    threatLevel: "low",
  },
];

// ---------------------------------------------------------------------------
// Per-vessel-type pages
// ---------------------------------------------------------------------------

export interface VesselTypePage {
  vesselType:
    | "bulk-carrier"
    | "tanker"
    | "container"
    | "warship"
    | "submarine"
    | "sar-vessel";
  slug: string;
  label: { en: string; uk: string };
  description: { en: string; uk: string };
}

export const MARITIME_VESSEL_TYPE_PAGES: VesselTypePage[] = [
  {
    vesselType: "bulk-carrier",
    slug: "/maritime/vessel-type/bulk-carrier",
    label: { en: "Bulk Carriers", uk: "Балкери" },
    description: {
      en: "Bulk carriers transport unpackaged commodities (grain, coal, ore). Ukrainian grain exports via the Black Sea Grain Initiative relied almost exclusively on chartered bulk carriers. Sanctions-evasion networks use flag-of-convenience bulk carriers to circumvent export controls.",
      uk: "Балкери перевозять нерозфасовані вантажі (зерно, вугілля, руду). Українська зернова ініціатива по Чорному морю майже повністю спиралася на зафрахтовані балкери. Мережі для обходу санкцій використовують балкери під зручним прапором для уникнення експортного контролю.",
    },
  },
  {
    vesselType: "tanker",
    slug: "/maritime/vessel-type/tanker",
    label: { en: "Tankers", uk: "Танкери" },
    description: {
      en: "Tankers carry liquid cargo — crude oil, refined products, LNG. Russia's shadow fleet is dominated by ageing crude and product tankers operating outside Western insurance markets (P&I clubs). Aegis Lens tracks flag changes, ownership transfers, and AIS-spoofing incidents.",
      uk: "Танкери перевозять рідкі вантажі — сиру нафту, нафтопродукти, ЗПГ. Тіньовий флот Росії переважно складається з застарілих танкерів для сирої нафти та нафтопродуктів, які працюють поза межами страхових ринків Заходу (P&I-клуби). Aegis Lens відстежує зміни прапорів, передачі власності та інциденти зі спуфінгом AIS.",
    },
  },
  {
    vesselType: "container",
    slug: "/maritime/vessel-type/container",
    label: { en: "Container Ships", uk: "Контейнеровози" },
    description: {
      en: "Container ships carry standardised TEU containers of mixed cargo. Dual-use technology and sanctioned goods have been interdicted in containers transiting third-country hubs. Aegis Lens flags vessels servicing sanctioned routes identified in EU, US, and UK designations.",
      uk: "Контейнеровози перевозять стандартизовані TEU-контейнери зі змішаними вантажами. Товари подвійного призначення та товари під санкціями були перехоплені в контейнерах, що транзитували через хаби третіх країн. Aegis Lens позначає судна, що обслуговують санкційні маршрути, визначені в ЄС, США та Великій Британії.",
    },
  },
  {
    vesselType: "warship",
    slug: "/maritime/vessel-type/warship",
    label: { en: "Warships", uk: "Бойові кораблі" },
    description: {
      en: "Warships in the Black Sea theatre include Russian Black Sea Fleet (BSF) surface combatants and Ukrainian naval assets. Following significant Ukrainian maritime-strike operations in 2022–2024, BSF assets have largely withdrawn to eastern Black Sea or Caspian ports.",
      uk: "Бойові кораблі в чорноморському театрі охоплюють надводні кораблі Чорноморського флоту Росії (ЧФ) та військово-морські активи України. Після значних українських морських ударних операцій 2022–2024 рр. активи ЧФ переважно відійшли до портів східного Чорного моря або Каспійського регіону.",
    },
  },
  {
    vesselType: "submarine",
    slug: "/maritime/vessel-type/submarine",
    label: { en: "Submarines", uk: "Підводні човни" },
    description: {
      en: "Russia operates several Kilo-class and Varshavyanka-class submarines historically based in Sevastopol. These vessels have been used for Kalibr cruise-missile strikes against Ukrainian territory. Multiple submarines have been damaged or destroyed in Ukrainian strikes on Crimea.",
      uk: "Росія експлуатує кілька підводних човнів класу «Кіло» та «Варшавянка», що традиційно базувалися в Севастополі. Ці судна використовувалися для ракетних ударів крилатими ракетами «Калібр» по українській території. Кілька підводних човнів пошкоджено або знищено внаслідок українських ударів по Криму.",
    },
  },
  {
    vesselType: "sar-vessel",
    slug: "/maritime/vessel-type/sar-vessel",
    label: {
      en: "Search & Rescue Vessels",
      uk: "Пошуково-рятувальні судна",
    },
    description: {
      en: "SAR vessels operate under SOLAS and IMO conventions to rescue personnel from maritime distress. In conflict zones SAR activities may be restricted, delayed, or weaponised as cover. Aegis Lens tracks declared SAR operations in proximity to active conflict areas.",
      uk: "Пошуково-рятувальні судна діють відповідно до конвенцій СОЛАС та ІМО для порятунку людей у морській аварії. У зонах конфлікту рятувальні операції можуть бути обмежені, відкладені або використані як прикриття. Aegis Lens відстежує задекларовані пошуково-рятувальні операції поблизу активних зон конфлікту.",
    },
  },
];

// ---------------------------------------------------------------------------
// Sanctions cross-links
// ---------------------------------------------------------------------------

export const SANCTIONS_CROSS_LINK = {
  un: "/sanctions/un",
  eu: "/sanctions/eu",
  us: "/sanctions/us",
  uk: "/sanctions/uk",
  /** Aggregated vessel-level sanctions search. */
  vesselSearch: "/sanctions/vessel-search",
} as const;

// ---------------------------------------------------------------------------
// FAQ (10 Q&As — 3 open + 7 collapsed)
// ---------------------------------------------------------------------------

export const MARITIME_FAQ: FaqItem[] = [
  {
    id: "maritime-faq-1",
    defaultOpen: true,
    question: {
      en: "What is the Russian shadow fleet and how does it work?",
      uk: "Що таке тіньовий флот Росії і як він функціонує?",
    },
    answer: {
      en: "The Russian shadow fleet is a network of ageing tankers—typically flagged in non-Western jurisdictions (Gabon, Palau, Cameroon, Barbados)—that transport Russian crude oil in violation of the G7 price cap ($60/barrel). These vessels operate without Western P&I insurance, use AIS spoofing to obscure voyages, and conduct ship-to-ship transfers to disguise cargo origin.",
      uk: "Тіньовий флот Росії — це мережа застарілих танкерів, зазвичай зареєстрованих у незахідних юрисдикціях (Габон, Палау, Камерун, Барбадос), що перевозять російську сиру нафту в обхід цінової стелі G7 (60 дол/барель). Ці судна функціонують без страхування P&I від західних клубів, використовують спуфінг AIS для приховування маршрутів і проводять передачі між суднами, щоб замаскувати походження вантажу.",
    },
  },
  {
    id: "maritime-faq-2",
    defaultOpen: true,
    question: {
      en: "Is civilian shipping in the Black Sea currently safe?",
      uk: "Чи є наразі цивільне судноплавство в Чорному морі безпечним?",
    },
    answer: {
      en: "Risk has decreased substantially since Ukraine's successful maritime-denial operations pushed Russian Black Sea Fleet assets to eastern anchorages in 2023–2024. However, mines laid by both parties continue to drift and surface unpredictably. Ukraine's temporary humanitarian grain corridor has operated with limited incidents, but commercial operators should consult Lloyd's Market Association (LMA) and IMO advisories before transiting.",
      uk: "Ризик суттєво знизився після успішних українських операцій із заперечення морського панування, які у 2023–2024 рр. відтіснили активи ЧФ Росії до східних стоянок. Однак міни, виставлені обома сторонами, продовжують дрейфувати та несподівано спливати. Тимчасовий гуманітарний зерновий коридор України функціонував з обмеженою кількістю інцидентів, але комерційні оператори повинні перевіряти рекомендації Lloyd's Market Association (LMA) та ІМО перед проходженням.",
    },
  },
  {
    id: "maritime-faq-3",
    defaultOpen: true,
    question: {
      en: "What is AIS spoofing and why does it matter for sanctions enforcement?",
      uk: "Що таке спуфінг AIS і чому він важливий для виконання санкцій?",
    },
    answer: {
      en: "AIS (Automatic Identification System) is the maritime transponder system required on commercial vessels. Spoofing involves falsifying a vessel's reported position, flag, or identity. Shadow-fleet tankers use spoofing to disguise port calls at sanctioned facilities or to obscure ship-to-ship transfers. Aegis Lens cross-references commercial AIS providers, SAR satellite imagery, and OSINT to detect anomalies.",
      uk: "AIS (Автоматична ідентифікаційна система) — це система транспондерів, обов'язкова для комерційних суден. Спуфінг передбачає фальсифікацію повідомленого місцеперебування, прапора або ідентичності судна. Тіньовий флот використовує спуфінг для приховування заходів у порти під санкціями або передач між суднами. Aegis Lens перехресно перевіряє дані комерційних постачальників AIS, супутникові знімки SAR та OSINT для виявлення аномалій.",
    },
  },
  {
    id: "maritime-faq-4",
    defaultOpen: false,
    question: {
      en: "How are undersea cables relevant to maritime security?",
      uk: "Яке значення підводних кабелів для морської безпеки?",
    },
    answer: {
      en: "Over 95% of international internet traffic and financial transactions travel via undersea fibre-optic cables. Both accidental anchor damage and deliberate sabotage of these cables (as seen in the Baltic 2024 incidents) can disrupt national communications. Aegis Lens maps critical cable routes and monitors outage reports at /maritime/cable-security.",
      uk: "Понад 95% міжнародного інтернет-трафіку та фінансових транзакцій передаються підводними волоконно-оптичними кабелями. Як випадкові пошкодження якорями, так і навмисний саботаж цих кабелів (як у балтійських інцидентах 2024 р.) можуть порушити національні комунікації. Aegis Lens картографує критичні кабельні маршрути та відстежує звіти про збої на /maritime/cable-security.",
    },
  },
  {
    id: "maritime-faq-5",
    defaultOpen: false,
    question: {
      en: "Which maritime sanctions lists does Aegis Lens cover?",
      uk: "Які морські санкційні списки охоплює Aegis Lens?",
    },
    answer: {
      en: "Aegis Lens cross-references OFAC SDN (US), EU Consolidated, OFSI (UK), and UN Security Council lists for vessel-level designations. It also tracks IMO-number changes, flag-of-convenience registrations, and beneficial-ownership structures. See /sanctions for the full list.",
      uk: "Aegis Lens зіставляє списки OFAC SDN (США), Зведений список ЄС, OFSI (Великобританія) та Рада Безпеки ООН для позначень на рівні суден. Він також відстежує зміни номерів ІМО, реєстрації під зручними прапорами та структури бенефіціарного права власності. Повний список дивіться на /sanctions.",
    },
  },
  {
    id: "maritime-faq-6",
    defaultOpen: false,
    question: {
      en: "What happened to the Russian Black Sea Fleet since 2022?",
      uk: "Що сталося з Чорноморським флотом Росії з 2022 року?",
    },
    answer: {
      en: "Ukraine's anti-ship campaign — combining Neptune cruise missiles, uncrewed surface vessels (USVs), and Storm Shadow / SCALP strikes on the Crimean naval base — has sunk or severely damaged at least 20 Russian warships since the start of the full-scale invasion, including the flagship Moskva (April 2022). Surviving BSF assets have increasingly relocated to Novorossiysk and Feodosiya.",
      uk: "Українська протикорабельна кампанія, що поєднує крилаті ракети «Нептун», безпілотні надводні апарати (БНА) та удари Storm Shadow/SCALP по кримській військово-морській базі, знищила або серйозно пошкодила щонайменше 20 російських бойових кораблів з початку повномасштабного вторгнення, у тому числі флагман «Москва» (квітень 2022 р.). Уцілілі активи ЧФ дедалі більше переміщуються до Новоросійська та Феодосії.",
    },
  },
  {
    id: "maritime-faq-7",
    defaultOpen: false,
    question: {
      en: "How does the Red Sea conflict affect global shipping?",
      uk: "Як конфлікт у Червоному морі впливає на глобальне судноплавство?",
    },
    answer: {
      en: "Houthi drone and missile attacks on commercial vessels in the Red Sea from late 2023 onward have forced many shipping lines to reroute around the Cape of Good Hope, adding 10–14 days and significant cost to Europe–Asia voyages. Insurance premiums in the region have spiked. Aegis Lens tracks declared attacks and rerouting decisions at /maritime/piracy.",
      uk: "Атаки єменських хусистів безпілотниками та ракетами на комерційні судна в Червоному морі з кінця 2023 р. змусили багатьох судновласників змінювати маршрут через мис Доброї Надії, що додає 10–14 днів і значні витрати до рейсів Європа–Азія. Страхові премії в регіоні різко зросли. Aegis Lens відстежує задекларовані напади та рішення про зміну маршрутів на /maritime/piracy.",
    },
  },
  {
    id: "maritime-faq-8",
    defaultOpen: false,
    question: {
      en: "What is a ship-to-ship (STS) transfer and why is it a sanctions-evasion technique?",
      uk: "Що таке передача між суднами (STS) і чому це метод обходу санкцій?",
    },
    answer: {
      en: "An STS transfer is the loading of cargo from one vessel to another at sea, typically outside port jurisdiction. Shadow-fleet operators use STS transfers in international waters (often off Greece, the UAE, or Malaysia) to commingle sanctioned Russian oil with other cargoes, breaking the documentary chain that would allow tracing to a sanctioned origin.",
      uk: "Передача між суднами (STS) — це завантаження вантажу з одного судна на інше у відкритому морі, зазвичай поза портовою юрисдикцією. Оператори тіньового флоту використовують STS-передачі в міжнародних водах (часто поблизу Греції, ОАЕ або Малайзії) для змішування санкційної російської нафти з іншими вантажами, розриваючи документальний ланцюжок, який дозволив би встановити санкційне походження.",
    },
  },
  {
    id: "maritime-faq-9",
    defaultOpen: false,
    question: {
      en: "How are maritime events verified before appearing on Aegis Lens?",
      uk: "Як морські події верифікуються перед публікацією в Aegis Lens?",
    },
    answer: {
      en: "Each maritime event requires corroboration from at least two independent sources (e.g., commercial AIS feed + SAR satellite image, or official port authority statement + OSINT photograph). Events are graded by confidence (confirmed / likely / unconfirmed) and reviewed by a maritime-specialist analyst before publication.",
      uk: "Кожна морська подія вимагає підтвердження щонайменше з двох незалежних джерел (наприклад, комерційний AIS-фід + SAR-супутниковий знімок або офіційна заява портової влади + OSINT-фотографія). Подіям присвоюється рівень достовірності (підтверджено / ймовірно / непідтверджено), і вони перевіряються аналітиком-фахівцем з морської тематики перед публікацією.",
    },
  },
  {
    id: "maritime-faq-10",
    defaultOpen: false,
    question: {
      en: "Can I export vessel-tracking data for my own analysis?",
      uk: "Чи можу я експортувати дані відстеження суден для власного аналізу?",
    },
    answer: {
      en: "Aegis Lens does not directly provide real-time AIS data (that requires a licence from providers such as MarineTraffic, Kpler, or Windward). We do expose our derived intelligence layer — vessel-event associations, sanctions flags, and anomaly scores — via the /v1/maritime API for verified researcher and institutional accounts.",
      uk: "Aegis Lens не надає безпосередньо дані AIS у реальному часі (для цього потрібна ліцензія від таких постачальників, як MarineTraffic, Kpler або Windward). Ми надаємо доступ до нашого похідного шару аналітики — зв'язків між суднами та подіями, санкційних позначень та оцінок аномалій — через API /v1/maritime для верифікованих акаунтів дослідників та установ.",
    },
  },
];
