/**
 * Aegis Lens — Cyber Warfare Hub
 * Pure lib module (no JSX/React). UTF-8. EN + UK strings.
 * Note: Pillar overview already implemented in Sprint 0 (marked ✓).
 */

// ---------------------------------------------------------------------------
// URLs
// ---------------------------------------------------------------------------

export const CYBER_WARFARE_HUB_URLS = {
  pillar: '/cyber-warfare',
  subs: {
    stateActors: '/cyber-warfare/state-actors',
    apts: '/cyber-warfare/apts',
    icsAttacks: '/cyber-warfare/ics-attacks',
    psychologicalOps: '/cyber-warfare/psychological-ops',
  },
} as const;

// ---------------------------------------------------------------------------
// APT profile interface
// ---------------------------------------------------------------------------

export interface AptProfile {
  id: string;
  name: string;
  aliases: string[];
  sponsorCountry: string;
  targets: string[];
  ttps: string[];           // MITRE ATT&CK technique IDs
  firstSeen: string;        // ISO date string
  kgSlug: string;           // knowledge-graph deep-link slug
  certUaAdvisories: string[]; // CERT-UA advisory identifiers, e.g. "CERT-UA#4555"
}

// ---------------------------------------------------------------------------
// Tracked APT groups
// ---------------------------------------------------------------------------

export const TRACKED_APTS: AptProfile[] = [
  {
    id: 'sandworm',
    name: 'Sandworm',
    aliases: ['Voodoo Bear', 'ELECTRUM', 'Telebots', 'IRIDIUM', 'UAC-0113'],
    sponsorCountry: 'Russia (GRU Unit 74455)',
    targets: [
      'Ukrainian energy infrastructure',
      'Ukrainian government networks',
      'European critical infrastructure',
      'NATO member states',
    ],
    ttps: [
      'T1566',   // Phishing
      'T1486',   // Data Encrypted for Impact
      'T1561',   // Disk Wipe
      'T0816',   // Device Restart/Shutdown (ICS)
      'T1190',   // Exploit Public-Facing Application
    ],
    firstSeen: '2009-01-01',
    kgSlug: 'apt/sandworm',
    certUaAdvisories: ['CERT-UA#4555', 'CERT-UA#5209', 'CERT-UA#6115'],
  },
  {
    id: 'apt28',
    name: 'APT28',
    aliases: ['Fancy Bear', 'Sofacy', 'STRONTIUM', 'Forest Blizzard', 'Sednit'],
    sponsorCountry: 'Russia (GRU Unit 26165)',
    targets: [
      'Ukrainian Ministry of Defence',
      'NATO governments',
      'Democratic institutions',
      'Think tanks and NGOs',
      'Aerospace and defence sector',
    ],
    ttps: [
      'T1566.001', // Spearphishing Attachment
      'T1078',     // Valid Accounts
      'T1071',     // Application Layer Protocol
      'T1003',     // OS Credential Dumping
      'T1583',     // Acquire Infrastructure
    ],
    firstSeen: '2007-01-01',
    kgSlug: 'apt/apt28',
    certUaAdvisories: ['CERT-UA#3980', 'CERT-UA#5049'],
  },
  {
    id: 'gamaredon',
    name: 'Gamaredon',
    aliases: ['Primitive Bear', 'ACTINIUM', 'Shuckworm', 'UAC-0010', 'Armageddon'],
    sponsorCountry: 'Russia (FSB Centre 18)',
    targets: [
      'Ukrainian government agencies',
      'Ukrainian military personnel',
      'Law enforcement bodies',
      'Ukrainian civil society',
    ],
    ttps: [
      'T1566.001', // Spearphishing Attachment
      'T1547.001', // Boot or Logon Autostart Execution: Registry Run Keys
      'T1059.005', // Command and Scripting Interpreter: Visual Basic
      'T1105',     // Ingress Tool Transfer
      'T1074',     // Data Staged
    ],
    firstSeen: '2013-01-01',
    kgSlug: 'apt/gamaredon',
    certUaAdvisories: ['CERT-UA#3123', 'CERT-UA#4510', 'CERT-UA#6474'],
  },
  {
    id: 'uac-0056',
    name: 'UAC-0056',
    aliases: ['UNC2589', 'TA471', 'SaintBear', 'GhostWriter'],
    sponsorCountry: 'Russia (likely GRU-affiliated)',
    targets: [
      'Ukrainian public sector',
      'Media organisations',
      'Georgian government',
      'Polish strategic communications',
    ],
    ttps: [
      'T1566.002', // Spearphishing Link
      'T1204.001', // User Execution: Malicious Link
      'T1027',     // Obfuscated Files or Information
      'T1114',     // Email Collection
      'T1560',     // Archive Collected Data
    ],
    firstSeen: '2017-01-01',
    kgSlug: 'apt/uac-0056',
    certUaAdvisories: ['CERT-UA#475', 'CERT-UA#1126'],
  },
  {
    id: 'invisimole',
    name: 'InvisiMole',
    aliases: ['UAC-0035'],
    sponsorCountry: 'Russia (Gamaredon-linked, likely FSB)',
    targets: [
      'High-value Ukrainian diplomatic personnel',
      'Ukrainian military attachés',
      'Eastern European diplomats',
    ],
    ttps: [
      'T1573',     // Encrypted Channel
      'T1056.001', // Input Capture: Keylogging
      'T1125',     // Video Capture
      'T1123',     // Audio Capture
      'T1055',     // Process Injection
    ],
    firstSeen: '2013-01-01',
    kgSlug: 'apt/invisimole',
    certUaAdvisories: ['CERT-UA#2702'],
  },
];

// ---------------------------------------------------------------------------
// CERT-UA + MISP feed config
// ---------------------------------------------------------------------------

export const CERT_UA_MISP_CONFIG = {
  certUa: {
    baseUrl: 'https://cert.gov.ua/api/1/docs',
    feedUrl: 'https://cert.gov.ua/api/1/docs?page=1&per_page=50&type=advisory',
    updateInterval: 'PT1H',   // ISO 8601 — every 1 hour
    auth: 'none',             // public endpoint
    format: 'JSON' as const,
  },
  misp: {
    baseUrl: 'https://misp.aegis-lens.uk',    // internal stub
    apiKeyEnv: 'MISP_API_KEY',
    eventsEndpoint: '/events/restSearch',
    sightingsEndpoint: '/sightings',
    updateInterval: 'PT30M',  // every 30 minutes
    format: 'JSON' as const,
    tags: ['tlp:white', 'ukraine', 'apt'],
  },
} as const;

// ---------------------------------------------------------------------------
// Per-region incidents
// ---------------------------------------------------------------------------

export interface CyberIncidentsByRegion {
  oblastCode: string;              // ISO 3166-2:UA code, e.g. "UA-71"
  oblastName: { en: string; uk: string };
  incidentCount: number;
  latestDate: string;              // ISO date string
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ---------------------------------------------------------------------------
// Attribution methodology
// ---------------------------------------------------------------------------

export interface ConfidenceTier {
  label: 'high' | 'medium' | 'low' | 'unattributed';
  description: { en: string; uk: string };
  minimumEvidenceTypes: number;
}

export interface EvidenceType {
  id: string;
  name: { en: string; uk: string };
  weight: number;  // 1–5
}

export const ATTRIBUTION_METHODOLOGY = {
  confidenceTiers: [
    {
      label: 'high' as const,
      description: {
        en: 'Multiple independent technical indicators corroborated by government or credible third-party attribution; infrastructure overlap confirmed; TTP signature matches known tooling.',
        uk: 'Кілька незалежних технічних індикаторів, підтверджених державним або достовірним стороннім атрибуцією; підтверджено збіг інфраструктури; сигнатура TTP відповідає відомим інструментам.',
      },
      minimumEvidenceTypes: 4,
    },
    {
      label: 'medium' as const,
      description: {
        en: 'Two or more technical indicators consistent with a known threat actor; partial infrastructure or malware family overlap; no contradicting evidence.',
        uk: 'Два або більше технічних індикатори, відповідні відомому актору загроз; часткове перекриття інфраструктури або сімейства шкідливого ПЗ; відсутність суперечливих даних.',
      },
      minimumEvidenceTypes: 2,
    },
    {
      label: 'low' as const,
      description: {
        en: 'Single technical indicator or circumstantial evidence only; attribution is speculative and should be treated as a hypothesis.',
        uk: 'Лише один технічний індикатор або непряме свідчення; атрибуція є спекулятивною і має розглядатися як гіпотеза.',
      },
      minimumEvidenceTypes: 1,
    },
    {
      label: 'unattributed' as const,
      description: {
        en: 'Insufficient evidence to attribute the incident to any known threat actor.',
        uk: 'Недостатньо доказів для атрибуції інциденту будь-якому відомому актору загроз.',
      },
      minimumEvidenceTypes: 0,
    },
  ] satisfies ConfidenceTier[],

  evidenceTypes: [
    { id: 'malware-signature', name: { en: 'Malware family signature', uk: 'Сигнатура сімейства шкідливого ПЗ' }, weight: 4 },
    { id: 'infrastructure-overlap', name: { en: 'IP/domain infrastructure overlap', uk: 'Перекриття IP/домен інфраструктури' }, weight: 4 },
    { id: 'ttp-pattern', name: { en: 'MITRE ATT&CK TTP pattern match', uk: 'Відповідність шаблону TTP MITRE ATT&CK' }, weight: 3 },
    { id: 'victimology', name: { en: 'Consistent victimology', uk: 'Послідовна жертвологія' }, weight: 2 },
    { id: 'timing-analysis', name: { en: 'Operational timing analysis', uk: 'Аналіз операційного часу' }, weight: 2 },
    { id: 'language-artefacts', name: { en: 'Artefact language / keyboard locale', uk: 'Мова артефакту / мовні налаштування клавіатури' }, weight: 2 },
    { id: 'government-attribution', name: { en: 'Official government attribution statement', uk: 'Офіційна урядова заява про атрибуцію' }, weight: 5 },
    { id: 'cert-advisory', name: { en: 'CERT-UA or partner CERT advisory', uk: 'Рекомендація CERT-UA або партнерського CERT' }, weight: 3 },
  ] satisfies EvidenceType[],

  caveats: {
    en: [
      'Attribution is an assessment, not a certainty. Threat actors routinely use false-flag techniques.',
      'Commercial threat-intelligence reports may contain vendor-specific TLP restrictions; Aegis Lens only publishes TLP:WHITE / TLP:GREEN data.',
      'Confidence levels are reassessed when new evidence emerges. Historical assessments may be revised without notice.',
      'Aegis Lens is not a law-enforcement or judicial authority. Attribution claims on this platform do not constitute legal findings.',
    ],
    uk: [
      'Атрибуція є оцінкою, а не достовірністю. Актори загроз регулярно використовують техніки помилкового прапора.',
      'Комерційні звіти про кіберзагрози можуть містити обмеження TLP, специфічні для постачальника; Aegis Lens публікує лише дані TLP:WHITE / TLP:GREEN.',
      'Рівні впевненості переоцінюються при появі нових доказів. Попередні оцінки можуть бути переглянуті без попередження.',
      'Aegis Lens не є правоохоронним або судовим органом. Заяви про атрибуцію на цій платформі не є юридичними висновками.',
    ],
  },

  versioningPolicy: {
    en: 'Each attribution record carries a semantic version (MAJOR.MINOR.PATCH). MAJOR increments on confidence-tier changes; MINOR on new evidence additions; PATCH on wording corrections. Full changelog is publicly accessible.',
    uk: 'Кожен запис атрибуції має семантичну версію (MAJOR.MINOR.PATCH). MAJOR збільшується при зміні рівня впевненості; MINOR — при додаванні нових доказів; PATCH — при виправленні формулювань. Повний журнал змін є загальнодоступним.',
  },
} as const;

// ---------------------------------------------------------------------------
// FAQ (10 Q&As)
// ---------------------------------------------------------------------------

export interface CyberFaqItem {
  question: { en: string; uk: string };
  answer: { en: string; uk: string };
}

export const CYBER_WARFARE_FAQ: CyberFaqItem[] = [
  {
    question: {
      en: 'What is cyber warfare?',
      uk: 'Що таке кібервійна?',
    },
    answer: {
      en: 'Cyber warfare refers to state-sponsored or state-directed attacks on adversary digital infrastructure — including critical services, military systems, and information ecosystems — with strategic, operational, or disruptive goals.',
      uk: 'Кібервійна — це атаки, спонсоровані державою або керовані нею, на цифрову інфраструктуру противника — включаючи критичні сервіси, військові системи та інформаційні екосистеми — зі стратегічними, операційними або дестабілізуючими цілями.',
    },
  },
  {
    question: {
      en: 'What is an Advanced Persistent Threat (APT)?',
      uk: 'Що таке Advanced Persistent Threat (APT)?',
    },
    answer: {
      en: 'An APT is a stealthy, long-term intrusion campaign — typically state-sponsored — that gains and maintains unauthorised access to target networks to exfiltrate intelligence, pre-position for sabotage, or conduct influence operations.',
      uk: 'APT — це прихована довгострокова кампанія вторгнення, як правило, спонсорована державою, яка отримує та підтримує несанкціонований доступ до мереж цілей для викрадення розвідувальних даних, попереднього позиціонування для саботажу або проведення операцій впливу.',
    },
  },
  {
    question: {
      en: 'What is Sandworm and why is it significant for Ukraine?',
      uk: 'Що таке Sandworm і чому це важливо для України?',
    },
    answer: {
      en: 'Sandworm (GRU Unit 74455) is responsible for the 2015 and 2016 Ukrainian power-grid attacks, the NotPetya wiper (2017), and continuous destructive operations since the full-scale invasion in 2022. It is the most operationally active APT group targeting Ukraine.',
      uk: 'Sandworm (підрозділ ГРУ 74455) відповідальний за атаки на українську енергетичну мережу 2015 і 2016 років, вайпер NotPetya (2017) та безперервні руйнівні операції після повномасштабного вторгнення 2022 року. Це найбільш операційно активне угруповання APT, що атакує Україну.',
    },
  },
  {
    question: {
      en: 'What is CERT-UA?',
      uk: 'Що таке CERT-UA?',
    },
    answer: {
      en: 'CERT-UA is the Ukrainian Government Computer Emergency Response Team, operated under the State Service of Special Communications and Information Protection. It publishes public advisories on active threat campaigns and maintains Ukraine\'s national incident-response coordination.',
      uk: 'CERT-UA — це Урядова команда реагування на комп\'ютерні надзвичайні події України, що діє під керівництвом Державної служби спеціального зв\'язку та захисту інформації. Вона публікує публічні рекомендації щодо активних кампаній загроз та координує національне реагування на інциденти.',
    },
  },
  {
    question: {
      en: 'What is MISP and how does Aegis Lens use it?',
      uk: 'Що таке MISP і як Aegis Lens його використовує?',
    },
    answer: {
      en: 'MISP (Malware Information Sharing Platform) is an open-source threat-intelligence platform for sharing structured IoCs and TTPs. Aegis Lens ingests TLP:WHITE feeds from MISP instances operated by CERT-UA partners to enrich incident records.',
      uk: 'MISP (Malware Information Sharing Platform) — це платформа кіберрозвідки з відкритим кодом для обміну структурованими IoC та TTP. Aegis Lens отримує потоки TLP:WHITE від екземплярів MISP, якими керують партнери CERT-UA, для збагачення записів про інциденти.',
    },
  },
  {
    question: {
      en: 'What are ICS/OT attacks?',
      uk: 'Що таке атаки на ICS/OT?',
    },
    answer: {
      en: 'ICS (Industrial Control System) and OT (Operational Technology) attacks target physical infrastructure — power grids, water systems, pipelines, railways — using malware or intrusion techniques that manipulate control logic. Sandworm\'s Industroyer/CrashOverride frameworks are the most sophisticated known examples.',
      uk: 'Атаки на ICS (промислові системи управління) та OT (операційні технології) спрямовані на фізичну інфраструктуру — енергетичні мережі, водопостачання, трубопроводи, залізниці — з використанням шкідливого ПЗ або технік вторгнення, що маніпулюють логікою управління. Фреймворки Industroyer/CrashOverride Sandworm є найбільш складними відомими прикладами.',
    },
  },
  {
    question: {
      en: 'How does Aegis Lens attribute cyberattacks?',
      uk: 'Як Aegis Lens атрибутує кібератаки?',
    },
    answer: {
      en: 'Aegis Lens follows a structured attribution methodology combining technical IoC analysis, TTP pattern matching (MITRE ATT&CK), infrastructure overlap research, victimology, and official CERT advisories. Each attribution carries a confidence tier (high / medium / low / unattributed) with public versioning.',
      uk: 'Aegis Lens дотримується структурованої методології атрибуції, що поєднує технічний аналіз IoC, зіставлення шаблонів TTP (MITRE ATT&CK), дослідження перекриття інфраструктури, жертвологію та офіційні рекомендації CERT. Кожна атрибуція має рівень впевненості (high / medium / low / unattributed) з публічним версіонуванням.',
    },
  },
  {
    question: {
      en: 'What are psychological operations (psyops) in the cyber domain?',
      uk: 'Що таке психологічні операції (psyops) в кіберпросторі?',
    },
    answer: {
      en: 'Cyber-enabled psyops include coordinated inauthentic behaviour on social media, disinformation campaigns, deepfake distribution, and hack-and-leak operations designed to manipulate public opinion, sow distrust in institutions, or demoralise target populations.',
      uk: 'Psyops з підтримкою кіберпростору включають скоординовану неавтентичну поведінку в соціальних мережах, дезінформаційні кампанії, поширення дипфейків та операції злому-витоку, спрямовані на маніпулювання громадською думкою, підрив довіри до інституцій або деморалізацію цільових населень.',
    },
  },
  {
    question: {
      en: 'Is cyberattack data on Aegis Lens real-time?',
      uk: 'Чи є дані про кібератаки на Aegis Lens в реальному часі?',
    },
    answer: {
      en: 'Aegis Lens refreshes ingested CERT-UA and MISP data hourly. Vetted incidents undergo editorial review before publication, so there is typically a 2–6 hour lag from public CERT-UA advisory to Aegis Lens incident record for high-confidence events.',
      uk: 'Aegis Lens оновлює отримані дані CERT-UA та MISP щогодини. Підтверджені інциденти проходять редакційний перегляд перед публікацією, тому зазвичай є затримка 2–6 годин від публічної рекомендації CERT-UA до запису інциденту в Aegis Lens для подій з високою впевненістю.',
    },
  },
  {
    question: {
      en: 'What should an organisation do if it suspects a state-sponsored cyberattack?',
      uk: 'Що має зробити організація, якщо підозрює кібератаку з боку держави?',
    },
    answer: {
      en: 'Immediately isolate affected systems, preserve forensic evidence (logs, memory dumps), notify CERT-UA (or your national CERT), engage an incident-response firm, and report to law enforcement. Do not pay ransoms or negotiate with attackers. If critical infrastructure is affected, inform sectoral regulators.',
      uk: 'Негайно ізолюйте уражені системи, збережіть криміналістичні докази (журнали, дампи пам\'яті), повідомте CERT-UA (або ваш національний CERT), залучіть компанію з реагування на інциденти та повідомте правоохоронні органи. Не платіть викуп і не ведіть переговори з зловмисниками. Якщо постраждала критична інфраструктура, повідомте галузевих регуляторів.',
    },
  },
];
