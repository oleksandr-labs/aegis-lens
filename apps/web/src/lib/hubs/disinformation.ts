// Disinformation Hub — Aegis Lens
// Covers: /disinformation and /disinformation/<sub>
// Subs: narratives · bots · deepfakes · state-media

// ---------------------------------------------------------------------------
// URL map
// ---------------------------------------------------------------------------

export const DISINFORMATION_HUB_URLS = {
  pillar: "/disinformation",
  subs: {
    narratives: "/disinformation/narratives",
    bots: "/disinformation/bots",
    deepfakes: "/disinformation/deepfakes",
    stateMedia: "/disinformation/state-media",
  },
} as const;

// ---------------------------------------------------------------------------
// Pillar narrative
// ---------------------------------------------------------------------------

export const disinformationPillarNarrative = {
  en: {
    headline: "Disinformation Intelligence",
    subheadline: "Narrative tracking, bot networks, deepfakes, and state-media amplification — classified and cited.",
    body: "Russia's information warfare infrastructure operates at industrial scale — coordinated inauthentic behaviour, synthetic media, and state-media amplification designed to confuse, demoralise, and fracture allied support. Aegis Lens classifies active narrative clusters, maps their propagation networks, and cross-references findings against primary-source forensics so journalists, researchers, and policy teams can act on verified intelligence rather than viral speculation.",
    cta: "Explore active narratives",
  },
  uk: {
    headline: "Розвідка дезінформації",
    subheadline: "Відстеження наративів, ботомережі, діпфейки та державно-медійне посилення — класифіковано та задокументовано.",
    body: "Інформаційна воєнна інфраструктура Росії діє у промисловому масштабі — скоординована неавтентична поведінка, синтетичні медіа та державно-медійне посилення, спрямовані на дезорієнтацію, деморалізацію та підрив союзницької підтримки. Aegis Lens класифікує активні кластери наративів, картографує їх мережі розповсюдження та перехресно перевіряє висновки на основі первинної судової криміналістики.",
    cta: "Дослідити активні наративи",
  },
} as const;

// ---------------------------------------------------------------------------
// Detection methodology
// ---------------------------------------------------------------------------

export type DetectionStep = {
  order: number;
  name: string;
  description: string;
};

export type DetectionMethodology = {
  name: string;
  version: string;
  steps: DetectionStep[];
  confidenceScale: { label: string; threshold: number; description: string }[];
  caveats: string[];
};

export const DETECTION_METHODOLOGY: DetectionMethodology = {
  name: "Aegis Lens Disinformation Detection Framework",
  version: "v2.1",
  steps: [
    {
      order: 1,
      name: "Signal collection",
      description:
        "Automated ingestion from monitored Telegram channels, social platforms, state-media RSS feeds, and tip submissions. Volume filtering applied — low-engagement signals are held in a staging queue.",
    },
    {
      order: 2,
      name: "Claim extraction",
      description:
        "NLP pipeline extracts discrete factual claims from collected content, normalises them to canonical form, and links to existing claim database entries where a match exceeds 0.85 cosine similarity.",
    },
    {
      order: 3,
      name: "Provenance tracing",
      description:
        "Earliest appearance is identified across monitored sources. Coordinated same-hour publication across 5+ channels triggers coordinated inauthentic behaviour (CIB) flag.",
    },
    {
      order: 4,
      name: "Fact-check cross-reference",
      description:
        "Claims are matched against partner fact-check databases (StopFake, VoxCheck, EUvsDisinfo, Bellingcat). Existing verdicts are surfaced. Novel claims not yet reviewed are labelled 'unverified'.",
    },
    {
      order: 5,
      name: "Narrative cluster assignment",
      description:
        "Claim is assigned to one or more active narrative clusters via semantic similarity to cluster centroids. Clusters are reviewed weekly by an analyst to prevent semantic drift.",
    },
    {
      order: 6,
      name: "Severity scoring",
      description:
        "Severity (1–5) is computed from: potential reach (network spread estimate), emotional valence (incitement vs. confusion vs. demoralisation), and policy sensitivity (targeting elections, military morale, refugee movements).",
    },
    {
      order: 7,
      name: "Publication decision",
      description:
        "Items with confidence ≥ medium and severity ≥ 2 are published to the disinformation feed. High-severity items at any confidence level are escalated to the duty analyst before publication.",
    },
  ],
  confidenceScale: [
    {
      label: "low",
      threshold: 1,
      description: "Single source, no corroboration, provenance unverified. Held in staging.",
    },
    {
      label: "medium",
      threshold: 2,
      description: "Two independent sources or one strong fact-check verdict. Published with caveat.",
    },
    {
      label: "high",
      threshold: 3,
      description:
        "Multiple independent sources + at least one fact-check verdict + corroborating network analysis.",
    },
    {
      label: "confirmed",
      threshold: 4,
      description:
        "High plus official statement from a government or authoritative institution, or direct forensic evidence (e.g. metadata proving fabrication).",
    },
  ],
  caveats: [
    "Automated claim extraction has a false-positive rate of ~8% in fast-news environments — all high-severity outputs are analyst-reviewed.",
    "Narrative cluster centroids drift over time as new claims are added; clusters are manually reviewed weekly to prevent misclassification.",
    "Reach estimates are modelled, not observed. Actual distribution may differ significantly in closed networks (e.g. private WhatsApp groups).",
    "This framework does not assess intent. We classify behaviour as consistent with disinformation — not the motivations of those who produce it.",
  ],
};

// ---------------------------------------------------------------------------
// Tracked narrative clusters
// ---------------------------------------------------------------------------

export type NarrativeCluster = {
  id: string;
  name: string;
  nameUk: string;
  description: string;
  descriptionUk: string;
  active: boolean;
  severity: 1 | 2 | 3 | 4 | 5;
  originatedApprox: string;
  primaryAmplifiers: string[];
  targetAudiences: string[];
};

export const TRACKED_NARRATIVE_CLUSTERS: NarrativeCluster[] = [
  {
    id: "nc-ukraine-nazi",
    name: "Ukraine Nazification",
    nameUk: "Нацифікація України",
    description:
      "Claims that Ukraine is controlled by neo-Nazis or that the war is a 'denazification' operation. One of the highest-volume narrative clusters since February 2022.",
    descriptionUk:
      "Твердження про те, що Україна перебуває під контролем неонацистів або що війна є операцією «денацифікації». Один із найбільших за обсягом кластерів наративів з лютого 2022 року.",
    active: true,
    severity: 5,
    originatedApprox: "2014",
    primaryAmplifiers: ["RT", "Sputnik", "Telegram (RU state-linked)"],
    targetAudiences: ["Global South", "Western far-right", "Russian domestic audience"],
  },
  {
    id: "nc-bioweapons-labs",
    name: "Ukrainian Bioweapons Laboratories",
    nameUk: "Українські біологічні лабораторії",
    description:
      "Claims that Ukraine hosted US-funded biological weapons programmes. Amplified in early 2022 to justify the invasion; resurfaced periodically to legitimise ongoing operations.",
    descriptionUk:
      "Твердження про те, що Україна приймала фінансовані США програми біологічної зброї. Активно поширювалось на початку 2022 року для виправдання вторгнення.",
    active: true,
    severity: 4,
    originatedApprox: "2022-02",
    primaryAmplifiers: ["RT Arabic", "Chinese social media", "Sputnik"],
    targetAudiences: ["Global South", "Arabic-speaking populations"],
  },
  {
    id: "nc-nato-provocation",
    name: "NATO Provoked the War",
    nameUk: "НАТО спровокувало війну",
    description:
      "Framing that NATO expansion forced Russia's hand, deflecting responsibility for the invasion onto Western institutions.",
    descriptionUk:
      "Подача як факту того, що розширення НАТО вимусило Росію діяти, перекладаючи відповідальність за вторгнення на західні інституції.",
    active: true,
    severity: 4,
    originatedApprox: "2021-12",
    primaryAmplifiers: ["RT", "Sputnik", "Western contrarian media"],
    targetAudiences: ["Western progressive left", "Anti-NATO constituencies"],
  },
  {
    id: "nc-refugee-crime",
    name: "Ukrainian Refugee Crime Wave",
    nameUk: "Хвиля злочинності серед українських біженців",
    description:
      "Fabricated or heavily distorted stories of crimes by Ukrainian refugees to erode host-country solidarity and push for refugee repatriation.",
    descriptionUk:
      "Сфабриковані або значно перекручені повідомлення про злочини українських біженців для підриву солідарності приймаючих країн.",
    active: true,
    severity: 3,
    originatedApprox: "2022-04",
    primaryAmplifiers: ["Telegram (DE/PL language)", "Far-right local media"],
    targetAudiences: ["Polish population", "German population", "Czech population"],
  },
  {
    id: "nc-zelensky-corruption",
    name: "Zelenskyy Corruption / Aid Theft",
    nameUk: "Корупція Зеленського / крадіжка допомоги",
    description:
      "Coordinated claims that President Zelenskyy and officials are stealing Western aid, aimed at undermining public and political support for continued assistance.",
    descriptionUk:
      "Скоординовані твердження про те, що президент Зеленський та чиновники крадуть західну допомогу, спрямовані на підрив суспільної та політичної підтримки.",
    active: true,
    severity: 4,
    originatedApprox: "2022-06",
    primaryAmplifiers: ["RT", "Sputnik", "US far-right social media"],
    targetAudiences: ["US Republican base", "Eurosceptic voters"],
  },
  {
    id: "nc-ua-casualties-hidden",
    name: "Ukraine Hiding Catastrophic Losses",
    nameUk: "Україна приховує катастрофічні втрати",
    description:
      "Claims that Ukrainian military casualties vastly exceed official figures and are being systematically concealed, aimed at demoralising Ukrainian society and undermining international support.",
    descriptionUk:
      "Твердження про те, що військові втрати України значно перевищують офіційні дані та систематично приховуються.",
    active: true,
    severity: 3,
    originatedApprox: "2022-03",
    primaryAmplifiers: ["Telegram military blogs (RU)", "RT", "Readovka"],
    targetAudiences: ["Ukrainian domestic audience", "Western sceptics"],
  },
];

// ---------------------------------------------------------------------------
// Featured investigations interface
// ---------------------------------------------------------------------------

export interface FeaturedInvestigation {
  id: string;
  title: string;
  titleUk: string;
  summary: string;
  summaryUk: string;
  publishedDate: string;
  narrativeClusterId: string;
  confidence: "low" | "medium" | "high" | "confirmed";
  href: string;
  partnerOrgs: string[];
}

// ---------------------------------------------------------------------------
// Counter-narrative resources
// ---------------------------------------------------------------------------

export type CounterNarrativeResourceType = "fact-checker" | "research-org" | "government-initiative" | "ngo";

export type CounterNarrativeResource = {
  title: string;
  titleUk: string;
  url: string;
  type: CounterNarrativeResourceType;
  description: string;
  descriptionUk: string;
  languages: string[];
};

export const COUNTER_NARRATIVE_RESOURCES: CounterNarrativeResource[] = [
  {
    title: "EUvsDisinfo",
    titleUk: "EUvsDisinfo",
    url: "https://euvsdisinfo.eu/",
    type: "government-initiative",
    description:
      "EU East StratCom Task Force database of debunked pro-Kremlin narratives. Tracks disinformation cases across European languages since 2015.",
    descriptionUk:
      "База даних спростованих прокремлівських наративів від Робочої групи ЄС East StratCom. Відстежує випадки дезінформації в європейських мовах з 2015 року.",
    languages: ["EN", "DE", "FR", "UA", "RU"],
  },
  {
    title: "StopFake",
    titleUk: "StopFake",
    url: "https://www.stopfake.org/",
    type: "fact-checker",
    description:
      "Ukrainian fact-checking project founded in 2014 focused on debunking fakes about Ukraine in Russian and international media.",
    descriptionUk:
      "Український фактчекінговий проєкт, заснований у 2014 році, зосереджений на спростуванні фейків про Україну в російських та міжнародних медіа.",
    languages: ["UK", "EN", "RU", "DE", "FR"],
  },
  {
    title: "VoxCheck",
    titleUk: "VoxCheck",
    url: "https://voxcheck.voxukraine.org/",
    type: "fact-checker",
    description:
      "Ukrainian fact-checking project by VoxUkraine. Focuses on political statements, official communication, and war-related claims.",
    descriptionUk:
      "Фактчекінговий проєкт VoxUkraine. Зосереджений на політичних заявах, офіційних комунікаціях та твердженнях, пов'язаних з війною.",
    languages: ["UK", "EN"],
  },
  {
    title: "Bellingcat",
    titleUk: "Bellingcat",
    url: "https://www.bellingcat.com/",
    type: "research-org",
    description:
      "Open-source investigation collective specialising in geolocation, social-media forensics, and entity identification. Extensive Ukraine war coverage.",
    descriptionUk:
      "Колектив відкритих розслідувань, що спеціалізується на геолокації, судовій аналітиці соцмедіа та ідентифікації суб'єктів. Масштабне висвітлення війни в Україні.",
    languages: ["EN"],
  },
  {
    title: "Alliance for Securing Democracy (ASD) — Hamilton Dashboard",
    titleUk: "Alliance for Securing Democracy — Dashboard Hamilton",
    url: "https://securingdemocracy.gmfus.org/",
    type: "ngo",
    description:
      "Tracks Russian and Chinese information operations across social platforms, providing publicly accessible data on state-linked accounts and narratives.",
    descriptionUk:
      "Відстежує інформаційні операції Росії та Китаю в соціальних платформах, надаючи загальнодоступні дані про акаунти, пов'язані з державою, та наративи.",
    languages: ["EN"],
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
  defaultOpen: boolean;
};

export const DISINFORMATION_FAQ: FaqItem[] = [
  {
    question: "What is disinformation and how does Aegis Lens define it?",
    questionUk: "Що таке дезінформація і як її визначає Aegis Lens?",
    answer:
      "Disinformation is false or misleading information spread with intent to deceive or manipulate. Aegis Lens distinguishes it from misinformation (unintentional errors) by requiring evidence of deliberate production or coordinated amplification. We document behaviour, not intent — labelling content as 'consistent with disinformation' rather than asserting motive.",
    answerUk:
      "Дезінформація — це неправдива або оманлива інформація, що поширюється з метою введення в оману або маніпуляції. Aegis Lens відрізняє її від дезінформації (ненавмисних помилок), вимагаючи доказів навмисного виробництва або скоординованого посилення. Ми документуємо поведінку, а не наміри.",
    defaultOpen: true,
  },
  {
    question: "How does Aegis Lens detect disinformation narratives?",
    questionUk: "Як Aegis Lens виявляє наративи дезінформації?",
    answer:
      "Detection runs through a seven-step pipeline: signal collection, claim extraction, provenance tracing, fact-check cross-reference, narrative cluster assignment, severity scoring, and publication decision. See /methodology for the full framework.",
    answerUk:
      "Виявлення відбувається через семиетапний конвеєр: збір сигналів, виділення тверджень, відстеження походження, перехресна перевірка фактів, призначення до кластера наративів, оцінка серйозності та рішення про публікацію. Дивіться /methodology для повного опису.",
    defaultOpen: true,
  },
  {
    question: "What is a 'narrative cluster'?",
    questionUk: "Що таке «кластер наративів»?",
    answer:
      "A narrative cluster is a group of semantically related false or misleading claims that together form a coherent strategic messaging campaign. Clusters persist over months or years, with individual pieces of disinformation serving as tactical instantiations of the strategic frame.",
    answerUk:
      "Кластер наративів — це група семантично пов'язаних неправдивих або оманливих тверджень, які разом утворюють зв'язну стратегічну комунікаційну кампанію. Кластери зберігаються протягом місяців або років.",
    defaultOpen: true,
  },
  {
    question: "What are deepfakes and can Aegis Lens detect them?",
    questionUk: "Що таке діпфейки і чи може Aegis Lens їх виявляти?",
    answer:
      "Deepfakes are AI-generated or AI-manipulated synthetic media — video, audio, or images — designed to look or sound authentic. Aegis Lens uses a combination of forensic tools and cross-source behavioural signals to flag suspected synthetic media. Forensic detection alone is insufficient — we require cross-source corroboration before asserting fabrication.",
    answerUk:
      "Діпфейки — це синтетичні медіа, згенеровані або маніпульовані ШІ — відео, аудіо чи зображення — розроблені для автентичного вигляду або звучання. Aegis Lens використовує комбінацію криміналістичних інструментів та поведінкових сигналів між джерелами.",
    defaultOpen: false,
  },
  {
    question: "How does state media differ from independent media in Aegis Lens?",
    questionUk: "Чим державні ЗМІ відрізняються від незалежних у Aegis Lens?",
    answer:
      "State media is editorially controlled by or financially dependent on a government. In the Aegis Lens source registry, state media is flagged and weighted accordingly in confidence calculations. RT, Sputnik, TASS, and RIA Novosti are classified as Russian state media. This classification affects corroboration — two reports from RT do not constitute two independent sources.",
    answerUk:
      "Державні ЗМІ редакційно контролюються урядом або фінансово залежать від нього. У реєстрі джерел Aegis Lens вони позначені та відповідно зважуються. RT, Sputnik, ТАСС та РІА Новини класифіковані як російські державні ЗМІ.",
    defaultOpen: false,
  },
  {
    question: "What is coordinated inauthentic behaviour (CIB)?",
    questionUk: "Що таке скоординована неавтентична поведінка (CIB)?",
    answer:
      "CIB refers to networks of accounts or channels that act in concert to artificially amplify content, disguising coordination as organic support. Indicators include simultaneous posting across accounts, shared infrastructure, and account creation clusters around key events. We flag CIB as a factor in severity scoring.",
    answerUk:
      "CIB означає мережі акаунтів або каналів, що діють узгоджено для штучного посилення контенту, маскуючи координацію під органічну підтримку. Ми позначаємо CIB як фактор у оцінці серйозності.",
    defaultOpen: false,
  },
  {
    question: "Which fact-checking organisations does Aegis Lens partner with?",
    questionUk: "З якими організаціями з перевірки фактів співпрацює Aegis Lens?",
    answer:
      "Aegis Lens cross-references against EUvsDisinfo, StopFake, VoxCheck, and Bellingcat as primary partners, plus IFCN-certified fact-checkers active in the region. We do not consider any single fact-check verdict as definitive — two independent verdicts are required to reach 'confirmed' status.",
    answerUk:
      "Aegis Lens перехресно перевіряє за EUvsDisinfo, StopFake, VoxCheck та Bellingcat як основними партнерами, а також IFCN-сертифікованими фактчекерами, активними в регіоні.",
    defaultOpen: false,
  },
  {
    question: "Can I report a suspected disinformation item?",
    questionUk: "Чи можу я повідомити про підозрюваний випадок дезінформації?",
    answer:
      "Yes. Use the tip submission form at /contact and select category 'Disinformation tip'. Include the source URL, your reasoning, and any supporting evidence. All tips are reviewed by an analyst.",
    answerUk:
      "Так. Використайте форму подачі на /contact і виберіть категорію «Підказка про дезінформацію». Включіть URL джерела, ваше обґрунтування та будь-які підтвердні докази.",
    defaultOpen: false,
  },
  {
    question: "Does Aegis Lens track disinformation in languages other than Ukrainian and English?",
    questionUk: "Чи відстежує Aegis Lens дезінформацію іншими мовами, окрім української та англійської?",
    answer:
      "Yes. Monitored languages include Russian, Polish, German, French, and Arabic, reflecting the primary amplification channels identified in our source network. Language coverage is uneven — Russian-language monitoring is deepest; Arabic and German are growing.",
    answerUk:
      "Так. Мови моніторингу включають російську, польську, німецьку, французьку та арабську, відображаючи основні канали посилення, виявлені в нашій мережі джерел.",
    defaultOpen: false,
  },
  {
    question: "What does Aegis Lens NOT do in the disinformation space?",
    questionUk: "Чого Aegis Lens НЕ робить у сфері дезінформації?",
    answer:
      "We do not assess intent or motive — only documented behaviour. We do not produce take-down requests or forward data to platform trust-and-safety teams without explicit consent of the reporter. We do not cover domestic political disinformation outside the Russia-Ukraine conflict context. We do not guarantee completeness — fast-moving disinformation will always outpace our verification cycle.",
    answerUk:
      "Ми не оцінюємо наміри або мотиви — лише задокументовану поведінку. Ми не виробляємо запити на видалення та не передаємо дані командам з безпеки платформ без явної згоди репортера.",
    defaultOpen: false,
  },
];

// ---------------------------------------------------------------------------
// FAQPage JSON-LD schema helper
// ---------------------------------------------------------------------------

export function disinformationFaqJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: DISINFORMATION_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
