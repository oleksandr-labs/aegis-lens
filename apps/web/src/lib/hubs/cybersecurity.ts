// Cybersecurity Hub — Aegis Lens
// Covers: /cybersecurity and /cybersecurity/<sub>

// ---------------------------------------------------------------------------
// URL map
// ---------------------------------------------------------------------------

export const CYBERSECURITY_HUB_URLS = {
  pillar: "/cybersecurity",
  subs: {
    incidents: "/cybersecurity/incidents",
    infrastructure: "/cybersecurity/infrastructure",
    malware: "/cybersecurity/malware",
    hacktivism: "/cybersecurity/hacktivism",
    supplyChain: "/cybersecurity/supply-chain",
  },
} as const;

// ---------------------------------------------------------------------------
// Sub-categories
// ---------------------------------------------------------------------------

export type CybersecuritySubCategory =
  | "incidents"
  | "infrastructure"
  | "malware"
  | "hacktivism"
  | "supply-chain";

// ---------------------------------------------------------------------------
// Pillar narrative
// ---------------------------------------------------------------------------

export const cybersecurityPillarNarrative = {
  en: {
    headline: "Cybersecurity Intelligence",
    subheadline: "State-linked threats, incident tracking, and defensive posture — verified in real time.",
    body: "Ukraine is the most intensively cyber-targeted nation in the world. Aegis Lens tracks intrusions, destructive malware campaigns, DDoS waves, and supply-chain compromises attributed to state and state-affiliated actors. Every incident is cross-referenced against CERT-UA advisories, international CSIRT feeds, and primary reporting before publication.",
    cta: "Browse live cyber incidents",
  },
  uk: {
    headline: "Кіберрозвідка",
    subheadline: "Загрози, пов'язані з державами, відстеження інцидентів та оцінка захисту — в режимі реального часу.",
    body: "Україна є найбільш цілеспрямовано атакованою кіберпростором країною у світі. Aegis Lens відстежує вторгнення, деструктивні кампанії зі шкідливим ПЗ, DDoS-хвилі та компрометації ланцюгів постачання, приписані державним і державно-афілійованим суб'єктам. Кожен інцидент перехресно перевіряється за повідомленнями CERT-UA, міжнародними стрічками CSIRT та первинними репортажами.",
    cta: "Переглянути живі кіберінциденти",
  },
} as const;

// ---------------------------------------------------------------------------
// Linked tools / companies
// ---------------------------------------------------------------------------

export type LinkedTool = {
  slug: string;
  name: string;
  nameUk: string;
  category: string;
  href: string;
};

export const LINKED_TOOLS_CYBERSECURITY: LinkedTool[] = [
  {
    slug: "cert-ua",
    name: "CERT-UA",
    nameUk: "CERT-UA",
    category: "Government CSIRT",
    href: "https://cert.gov.ua/",
  },
  {
    slug: "ssscip",
    name: "State Service of Special Communications (SSSCIP)",
    nameUk: "Державна служба спеціального зв'язку (ДССЗЗ)",
    category: "Government",
    href: "https://cip.gov.ua/",
  },
  {
    slug: "mandiant",
    name: "Mandiant / Google Threat Intelligence",
    nameUk: "Mandiant / Google Threat Intelligence",
    category: "Threat Intelligence Vendor",
    href: "https://www.mandiant.com/",
  },
  {
    slug: "microsoft-dcu",
    name: "Microsoft Digital Crimes Unit (DCU)",
    nameUk: "Microsoft Digital Crimes Unit",
    category: "Tech Company Intelligence",
    href: "https://www.microsoft.com/en-us/security/blog/tag/microsoft-threat-intelligence/",
  },
  {
    slug: "recorded-future",
    name: "Recorded Future",
    nameUk: "Recorded Future",
    category: "Threat Intelligence Vendor",
    href: "https://www.recordedfuture.com/",
  },
  {
    slug: "eset-apt",
    name: "ESET APT Research",
    nameUk: "ESET APT Research",
    category: "AV / Threat Research",
    href: "https://www.welivesecurity.com/",
  },
  {
    slug: "unit42",
    name: "Palo Alto Unit 42",
    nameUk: "Palo Alto Unit 42",
    category: "Threat Intelligence Vendor",
    href: "https://unit42.paloaltonetworks.com/",
  },
];

// ---------------------------------------------------------------------------
// CERT-UA feed config
// ---------------------------------------------------------------------------

export const CERT_UA_FEED_CONFIG = {
  name: "CERT-UA Alerts",
  url: "https://cert.gov.ua/api/articles",
  format: "JSON" as const,
  updateIntervalMinutes: 30,
  language: "uk" as const,
  ingestNotes:
    "Parse .title, .date, .body fields. Strip HTML before storage. Filter by category 'alert' and 'incident'.",
} as const;

// ---------------------------------------------------------------------------
// Per-sub trend pages
// ---------------------------------------------------------------------------

export interface CybersecurityTrendPage {
  sub: CybersecuritySubCategory;
  title: string;
  titleUk: string;
  description: string;
  descriptionUk: string;
  url: string;
}

export const CYBERSECURITY_TREND_PAGES: CybersecurityTrendPage[] = [
  {
    sub: "incidents",
    title: "Cyber Incident Tracker",
    titleUk: "Трекер кіберінцидентів",
    description: "Verified record of cyber attacks — timeline, attribution confidence, and severity.",
    descriptionUk: "Верифікований реєстр кібератак — хронологія, впевненість атрибуції та рівень серйозності.",
    url: CYBERSECURITY_HUB_URLS.subs.incidents,
  },
  {
    sub: "infrastructure",
    title: "Critical Infrastructure Threats",
    titleUk: "Загрози критичній інфраструктурі",
    description: "Attacks targeting power grids, water systems, telecoms, and government networks.",
    descriptionUk: "Атаки на енергетичні мережі, водопостачання, телекомунікації та урядові мережі.",
    url: CYBERSECURITY_HUB_URLS.subs.infrastructure,
  },
  {
    sub: "malware",
    title: "Malware & APT Campaigns",
    titleUk: "Шкідливе ПЗ та APT-кампанії",
    description: "Tracking destructive wiper malware, ransomware, and advanced persistent threat campaigns.",
    descriptionUk: "Відстеження деструктивного шкідливого ПЗ, програм-вимагачів та кампаній APT.",
    url: CYBERSECURITY_HUB_URLS.subs.malware,
  },
  {
    sub: "hacktivism",
    title: "Hacktivist Activity",
    titleUk: "Активність хактивістів",
    description: "DDoS, defacement, and leak operations by hacktivist groups on all sides of the conflict.",
    descriptionUk: "DDoS, дефейсмент та операції з витоком даних хактивістських угруповань.",
    url: CYBERSECURITY_HUB_URLS.subs.hacktivism,
  },
  {
    sub: "supply-chain",
    title: "Supply Chain Compromises",
    titleUk: "Компрометація ланцюгів постачання",
    description: "Software, hardware, and vendor-channel intrusions with downstream victim impact.",
    descriptionUk: "Вторгнення через програмне забезпечення, обладнання та канали постачальників.",
    url: CYBERSECURITY_HUB_URLS.subs.supplyChain,
  },
];

// ---------------------------------------------------------------------------
// FAQ — 10 Q&As (3 open + 7 collapsed), FAQPage JSON-LD ready
// ---------------------------------------------------------------------------

export type FaqItem = {
  question: string;
  questionUk: string;
  answer: string;
  answerUk: string;
  /** true = rendered open by default */
  defaultOpen: boolean;
};

export const CYBERSECURITY_FAQ: FaqItem[] = [
  {
    question: "What cyber threats does Aegis Lens track?",
    questionUk: "Які кіберзагрози відстежує Aegis Lens?",
    answer:
      "Aegis Lens tracks state-attributed cyber operations including destructive malware (wipers), ransomware, DDoS campaigns, espionage intrusions, supply-chain compromises, and hacktivist activity. Coverage centres on Ukraine and its allies but extends to any incident with documented geopolitical significance.",
    answerUk:
      "Aegis Lens відстежує кіберопрерації, приписані державним суб'єктам, зокрема деструктивне шкідливе ПЗ (вайпери), програми-вимагачі, DDoS-кампанії, шпигунські вторгнення, компрометації ланцюгів постачання та хактивістську діяльність. Основна увага зосереджена на Україні та її союзниках, але охоплює будь-який інцидент із задокументованим геополітичним значенням.",
    defaultOpen: true,
  },
  {
    question: "How are cyber incidents verified before publication?",
    questionUk: "Як перевіряються кіберінциденти перед публікацією?",
    answer:
      "Every cyber incident is cross-referenced against at least two independent sources — typically a CERT advisory or CSIRT publication plus a technical report from a vetted threat-intelligence vendor. Attribution claims are marked with a confidence score and never asserted from a single source.",
    answerUk:
      "Кожен кіберінцидент перехресно перевіряється за принаймні двома незалежними джерелами — зазвичай повідомленням CERT або публікацією CSIRT плюс технічним звітом перевіреного постачальника розвідки загроз. Твердження про атрибуцію позначаються показником впевненості й ніколи не ґрунтуються на одному джерелі.",
    defaultOpen: true,
  },
  {
    question: "What is the CERT-UA advisory feed?",
    questionUk: "Що таке стрічка повідомлень CERT-UA?",
    answer:
      "CERT-UA (Computer Emergency Response Team of Ukraine) is the national cybersecurity authority. It publishes technical advisories on active threats, including malware indicators, network IOCs, and incident reports. Aegis Lens ingests this feed every 30 minutes and cross-links relevant events.",
    answerUk:
      "CERT-UA (Команда реагування на комп'ютерні надзвичайні ситуації України) є національним органом з кібербезпеки. Він публікує технічні рекомендації щодо активних загроз, включаючи індикатори шкідливого ПЗ, мережеві IOC та звіти про інциденти. Aegis Lens завантажує цю стрічку кожні 30 хвилин і пов'язує відповідні події.",
    defaultOpen: true,
  },
  {
    question: "Does Aegis Lens publish indicators of compromise (IOCs)?",
    questionUk: "Чи публікує Aegis Lens індикатори компрометації (IOC)?",
    answer:
      "We link to IOC packages published by CERT-UA and vetted vendors. We do not independently generate or redistribute raw IOC datasets — doing so reliably requires operational security infrastructure beyond our editorial scope.",
    answerUk:
      "Ми посилаємося на пакети IOC, опубліковані CERT-UA та перевіреними постачальниками. Ми не генеруємо та не поширюємо самостійно необроблені набори IOC — це вимагає інфраструктури операційної безпеки, що виходить за межі нашої редакційної діяльності.",
    defaultOpen: false,
  },
  {
    question: "How is attribution confidence determined?",
    questionUk: "Як визначається впевненість в атрибуції?",
    answer:
      "Attribution confidence is a scored value (low / medium / high / confirmed) based on the number of independent technical reports, the specificity of TTPs matching known actor profiles, and corroboration from government statements. 'Confirmed' is reserved for cases with legal or official government attribution.",
    answerUk:
      "Впевненість атрибуції — це оцінений показник (низький / середній / високий / підтверджений), що ґрунтується на кількості незалежних технічних звітів, специфічності TTP, що відповідають профілям відомих суб'єктів, та підтвердженні з урядових заяв.",
    defaultOpen: false,
  },
  {
    question: "Which threat actor groups are tracked?",
    questionUk: "Які угруповання загрозливих суб'єктів відстежуються?",
    answer:
      "Aegis Lens tracks documented APT groups operating in the Russia-Ukraine conflict space, including Sandworm (GRU), APT28/Fancy Bear (GRU), APT29/Cozy Bear (SVR), and Gamaredon (FSB), as well as hacktivist clusters such as Killnet and IT Army of Ukraine.",
    answerUk:
      "Aegis Lens відстежує задокументовані APT-групи, що діють у просторі російсько-українського конфлікту, включаючи Sandworm (ГРУ), APT28/Fancy Bear (ГРУ), APT29/Cozy Bear (СВР) та Gamaredon (ФСБ), а також хактивістські кластери — Killnet та IT Army of Ukraine.",
    defaultOpen: false,
  },
  {
    question: "Does Aegis Lens cover civilian infrastructure attacks?",
    questionUk: "Чи охоплює Aegis Lens атаки на цивільну інфраструктуру?",
    answer:
      "Yes. Attacks on power grids, water utilities, hospitals, and telecoms receive dedicated coverage because they affect civilian safety. We apply a higher verification threshold before publishing specific location or operational details to avoid aiding follow-on attacks.",
    answerUk:
      "Так. Атаки на електромережі, водопостачання, лікарні та телекомунікації отримують окреме висвітлення, оскільки вони впливають на безпеку цивільного населення. Ми застосовуємо вищий поріг перевірки перед публікацією конкретних відомостей про місцезнаходження або операційних деталей.",
    defaultOpen: false,
  },
  {
    question: "What is a wiper and why does it matter?",
    questionUk: "Що таке вайпер і чому це важливо?",
    answer:
      "A wiper is malware designed to irreversibly destroy data, as opposed to ransomware that seeks payment. Wipers have been deployed against Ukrainian targets in every major escalation phase since 2014, most notably WhisperGate and HermeticWiper in early 2022. They signal intent to permanently degrade, not extort.",
    answerUk:
      "Вайпер — це шкідливе ПЗ, призначене для незворотного знищення даних, на відміну від програм-вимагачів, які вимагають оплату. Вайпери застосовувалися проти українських цілей у кожній великій фазі ескалації починаючи з 2014 року — зокрема WhisperGate та HermeticWiper на початку 2022 року.",
    defaultOpen: false,
  },
  {
    question: "Can I receive alerts for new cyber incidents?",
    questionUk: "Чи можу я отримувати сповіщення про нові кіберінциденти?",
    answer:
      "Yes. Subscribe at /subscribe and choose the 'Cybersecurity' topic filter. You can also follow the RSS/Atom feed at /topics/cyber/feed.xml for programmatic integration.",
    answerUk:
      "Так. Підпишіться на /subscribe і виберіть фільтр теми «Кібербезпека». Ви також можете підписатися на RSS/Atom-стрічку за адресою /topics/cyber/feed.xml для програмної інтеграції.",
    defaultOpen: false,
  },
  {
    question: "How does Aegis Lens distinguish state-sponsored from criminal activity?",
    questionUk: "Як Aegis Lens розрізняє державне спонсорство та кримінальну діяльність?",
    answer:
      "The distinction rests on documented TTPs, targeting patterns, and infrastructure reuse attributable to known state actor toolchains. We label incidents as 'state-attributed', 'state-adjacent', or 'criminal/hacktivist' and always cite the technical basis. Where the line is unclear, we publish the ambiguity explicitly.",
    answerUk:
      "Розрізнення ґрунтується на задокументованих TTP, шаблонах таргетингу та повторному використанні інфраструктури, що приписується відомим інструментарієм державних суб'єктів. Ми позначаємо інциденти як «приписані державі», «суміжні з державою» або «кримінальні/хактивістські» і завжди посилаємося на технічне обґрунтування.",
    defaultOpen: false,
  },
];

// ---------------------------------------------------------------------------
// FAQPage JSON-LD schema helper
// ---------------------------------------------------------------------------

export function cybersecurityFaqJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: CYBERSECURITY_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
