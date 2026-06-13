// Elections Hub — Aegis Lens
// Covers: /elections · /elections/<country> · /elections/<country>/<year>

// ---------------------------------------------------------------------------
// URL map
// ---------------------------------------------------------------------------

export const ELECTIONS_HUB_URLS = {
  pillar: "/elections",
  country: (iso2: string) => `/elections/${iso2.toLowerCase()}`,
  election: (iso2: string, year: number) => `/elections/${iso2.toLowerCase()}/${year}`,
} as const;

// ---------------------------------------------------------------------------
// ElectionRecord interface
// ---------------------------------------------------------------------------

export interface ElectionRecord {
  /** ISO 3166-1 alpha-2 country code */
  country: string;
  countryName: string;
  countryNameUk: string;
  year: number;
  electionType: "presidential" | "parliamentary" | "regional" | "referendum";
  status: "upcoming" | "ongoing" | "concluded";
  /** Chronological list of key dates and milestones */
  timeline: string[];
  /** Observable signals that may indicate interference or irregularities */
  keySignals: string[];
  /** Documented or anticipated risks to election integrity */
  risks: string[];
  disinfoMonitoring: boolean;
  foreignInterference: boolean;
  /** Optional: link to election-day live coverage hub */
  liveCoverageUrl?: string;
}

// ---------------------------------------------------------------------------
// Tracked elections
// ---------------------------------------------------------------------------

export const TRACKED_ELECTIONS: ElectionRecord[] = [
  {
    country: "UA",
    countryName: "Ukraine",
    countryNameUk: "Україна",
    year: 2025,
    electionType: "presidential",
    status: "upcoming",
    timeline: [
      "2024: Wartime election law suspends elections during martial law — constitutional debate ongoing",
      "2025: Martial law review scheduled; international pressure for credible elections process mounts",
      "TBD: Registration window for candidates (contingent on martial law status)",
      "TBD: Election day — date not set pending legislative resolution",
    ],
    keySignals: [
      "Parliamentary debates on martial law extension vs. election viability",
      "International partner statements on election requirements for continued support",
      "Polling data trends on public readiness for elections during active conflict",
      "Opposition party registration status and access to campaign activity",
    ],
    risks: [
      "Active military conflict creates security conditions incompatible with free campaigning in frontline regions",
      "Disinformation campaigns targeting electoral credibility to undermine democratic legitimacy",
      "Russian interference via cyber operations against electoral infrastructure",
      "Displaced persons (6+ million) voting access and registration challenges",
      "Political polarisation and media freedom concerns in wartime information environment",
    ],
    disinfoMonitoring: true,
    foreignInterference: true,
  },
  {
    country: "US",
    countryName: "United States",
    countryNameUk: "Сполучені Штати",
    year: 2026,
    electionType: "parliamentary",
    status: "upcoming",
    timeline: [
      "2026-01: Candidate filing deadlines begin (state-by-state)",
      "2026-02 to 2026-06: Primary elections cycle",
      "2026-11-03: General election (midterm congressional elections)",
    ],
    keySignals: [
      "State-level voting rights legislation changes",
      "Social media platform policy on political advertising",
      "Foreign-linked account activity in US political discourse",
      "AI-generated campaign content disclosure debates",
    ],
    risks: [
      "Russian and Chinese disinformation operations targeting candidate credibility and voter turnout",
      "AI-generated deepfakes and synthetic audio in campaign attacks",
      "Voter registration system cyber vulnerabilities",
      "Coordinated inauthentic behaviour on social platforms amplifying divisive narratives",
      "Election denial narratives undermining institutional trust",
    ],
    disinfoMonitoring: true,
    foreignInterference: true,
  },
  {
    country: "DE",
    countryName: "Germany",
    countryNameUk: "Німеччина",
    year: 2025,
    electionType: "parliamentary",
    status: "concluded",
    timeline: [
      "2025-01-07: Bundestag vote of no confidence passed",
      "2025-02-23: Federal election (snap Bundestagswahl)",
      "2025-03: Coalition negotiations commence",
      "2025-04: Friedrich Merz confirmed as Chancellor",
    ],
    keySignals: [
      "AfD vote share vs. pre-election polling differentials",
      "Documented Russian disinformation activity in German-language social media (Telegram, X)",
      "Turnout variations in eastern Bundeslaender",
    ],
    risks: [
      "Russian state-media amplification of AfD and Sahra Wagenknecht Alliance messaging",
      "Coordinated Telegram campaigns targeting CDU/CSU and SPD credibility",
      "Voter suppression narratives in eastern states",
    ],
    disinfoMonitoring: true,
    foreignInterference: true,
  },
  {
    country: "PL",
    countryName: "Poland",
    countryNameUk: "Польща",
    year: 2025,
    electionType: "presidential",
    status: "ongoing",
    timeline: [
      "2025-05-18: First round of presidential election",
      "2025-06-01: Second round (runoff) — Rafal Trzaskowski vs. Karol Nawrocki",
      "2025-06-01: Results certification pending",
    ],
    keySignals: [
      "Anti-Ukrainian sentiment disinformation targeting Polish electorate",
      "Russian-linked accounts activity in Polish-language Telegram and X",
      "Turnout patterns and regional voting divergences",
      "Candidate statements on NATO/Ukraine policy and their amplification",
    ],
    risks: [
      "Kremlin-linked disinformation exploiting Polish-Ukrainian historical grievances",
      "Deepfake attack ads circulating on domestic social platforms",
      "Cross-border influence from Belarusian state media",
      "Hybrid operations timed around key campaign moments",
    ],
    disinfoMonitoring: true,
    foreignInterference: true,
  },
  {
    country: "RO",
    countryName: "Romania",
    countryNameUk: "Румунія",
    year: 2024,
    electionType: "presidential",
    status: "concluded",
    timeline: [
      "2024-11-24: First round — Calin Georgescu emerges as frontrunner",
      "2024-12-06: Constitutional Court annuls election citing TikTok manipulation campaign",
      "2025-03-02: Re-run first round — George Simion leads",
      "2025-05-18: Re-run second round — Nicusor Dan wins",
    ],
    keySignals: [
      "TikTok algorithm manipulation evidence — documented by Romanian intelligence (SRI)",
      "Inauthentic account network coordinating Georgescu viral promotion",
      "State-attributed foreign sponsorship of social media campaign",
    ],
    risks: [
      "Documented use of TikTok algorithmic amplification by foreign-linked networks — first confirmed case in European elections",
      "Annulment of first round unprecedented in EU history — institutional legitimacy strain",
      "Ongoing pro-Russia political movement infrastructure in Romanian social media",
    ],
    disinfoMonitoring: true,
    foreignInterference: true,
    liveCoverageUrl: "/elections/ro/2024",
  },
  {
    country: "FR",
    countryName: "France",
    countryNameUk: "Франція",
    year: 2027,
    electionType: "presidential",
    status: "upcoming",
    timeline: [
      "2027-04: First round of presidential election (approximate)",
      "2027-05: Second round runoff (approximate)",
    ],
    keySignals: [
      "Rassemblement National polling trajectory and Russian connection investigations",
      "Le Pen court case outcomes and political eligibility status",
      "Cross-platform disinformation activity in French-language political discourse",
    ],
    risks: [
      "Russian financial links to French far-right parties under investigation",
      "French-language RT content successor platforms active on Telegram",
      "AI-generated campaign material in a high-trust media environment",
    ],
    disinfoMonitoring: true,
    foreignInterference: true,
  },
];

// ---------------------------------------------------------------------------
// Editorial neutrality policy
// ---------------------------------------------------------------------------

export const ELECTION_EDITORIAL_POLICY = {
  version: "v1.0",
  effectiveDate: "2025-09-01",
  summary:
    "Aegis Lens covers elections as an intelligence and disinformation-monitoring service, not as a partisan political outlet. The following policies are binding on all election coverage.",
  principles: [
    {
      id: "strict-neutrality",
      title: "Strict neutrality on outcomes",
      description:
        "Aegis Lens takes no position on which candidate, party, or outcome is preferable. We document facts, signals, and documented risks. We do not editorially endorse candidates, parties, or policy positions.",
    },
    {
      id: "fact-check-only",
      title: "Fact-check only — no opinion",
      description:
        "Election coverage is limited to: documented events, verified statements, fact-checked claims, and observed disinformation activity. We do not publish commentary on electoral strategy, candidate messaging quality, or political forecasting.",
    },
    {
      id: "no-predictions",
      title: "No electoral predictions or forecasts",
      description:
        "We do not publish vote-share forecasts, seat projections, or outcome predictions. We link to reputable aggregator polling sites where relevant but do not model or amplify predictions ourselves.",
    },
    {
      id: "interference-documentation",
      title: "Document interference — do not amplify it",
      description:
        "When documenting disinformation campaigns or foreign interference, we describe and analyse without republishing the disinformation content in a way that would further amplify it. Summaries are used instead of direct quotation where amplification risk is high.",
    },
    {
      id: "source-transparency",
      title: "Transparent sourcing on election claims",
      description:
        "All election-related factual claims are sourced and linked. Attribution confidence is shown. Unverified claims are labelled as such and not published without explicit caveat.",
    },
  ],
  prohibitions: [
    "Publishing unverified allegations about candidates without a confidence label and source link",
    "Hosting user-submitted political advertising or advocacy content",
    "Framing coverage in ways that could suppress voter turnout",
    "Publishing exit poll data before official close of polls in the jurisdiction",
    "Linking to or amplifying content that constitutes voter intimidation",
  ],
} as const;

// ---------------------------------------------------------------------------
// Pillar narrative
// ---------------------------------------------------------------------------

export const electionsPillarNarrative = {
  en: {
    headline: "Election Integrity Monitor",
    subheadline:
      "Disinformation tracking, foreign interference documentation, and integrity signals — for elections that matter to the geopolitical balance.",
    body: "Elections in and around the Russia-Ukraine conflict zone are priority targets for information operations. Aegis Lens monitors the full election integrity picture: narrative campaigns designed to suppress turnout or delegitimise results, documented foreign-state interference, deepfakes targeting candidates, and coordinated inauthentic behaviour on social platforms. All coverage is strictly fact-based and editorially neutral on outcomes.",
    cta: "View tracked elections",
    editorialNotice:
      "Aegis Lens takes no position on electoral outcomes. Coverage is limited to verified facts, documented interference, and disinformation monitoring.",
  },
  uk: {
    headline: "Монітор цілісності виборів",
    subheadline:
      "Відстеження дезінформації, документування іноземного втручання та сигнали цілісності — для виборів, що мають значення для геополітичного балансу.",
    body: "Вибори в зоні та навколо російсько-українського конфлікту є пріоритетними цілями для інформаційних операцій. Aegis Lens контролює повну картину цілісності виборів: наративні кампанії, спрямовані на придушення явки або дискредитацію результатів, задокументоване втручання іноземних держав, діпфейки проти кандидатів та скоординовану неавтентичну поведінку в соцмережах. Усі матеріали є суворо фактичними та редакційно нейтральними щодо результатів.",
    cta: "Переглянути відстежувані вибори",
    editorialNotice:
      "Aegis Lens не займає позиції щодо виборчих результатів. Матеріали обмежені перевіреними фактами, задокументованим втручанням та моніторингом дезінформації.",
  },
} as const;

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

export const ELECTIONS_FAQ: FaqItem[] = [
  {
    question: "What elections does Aegis Lens monitor?",
    questionUk: "Які вибори відстежує Aegis Lens?",
    answer:
      "Aegis Lens prioritises elections with documented or high-risk foreign interference, significant disinformation campaigns, or direct relevance to the Russia-Ukraine conflict and European security architecture. This includes elections in Ukraine, EU member states, the United States, and neighbouring countries with conflict-adjacent dynamics.",
    answerUk:
      "Aegis Lens надає пріоритет виборам із задокументованим або підвищеним ризиком іноземного втручання, значними кампаніями дезінформації або прямою значущістю для російсько-українського конфлікту та архітектури європейської безпеки.",
    defaultOpen: true,
  },
  {
    question: "Does Aegis Lens favour any candidate or party?",
    questionUk: "Чи підтримує Aegis Lens будь-якого кандидата або партію?",
    answer:
      "No. Aegis Lens editorial policy prohibits any position on electoral outcomes. Coverage is strictly limited to documented facts, verified disinformation activity, and foreign interference evidence. We do not endorse, favour, or recommend any candidate, party, or policy position.",
    answerUk:
      "Ні. Редакційна політика Aegis Lens забороняє будь-яку позицію щодо виборчих результатів. Матеріали суворо обмежені задокументованими фактами, перевіреною діяльністю з дезінформації та доказами іноземного втручання.",
    defaultOpen: true,
  },
  {
    question: "How does Aegis Lens monitor election disinformation?",
    questionUk: "Як Aegis Lens моніторить дезінформацію на виборах?",
    answer:
      "Election disinformation monitoring runs through the same seven-step detection pipeline as general disinformation coverage, with an additional electoral context filter: claims affecting candidate credibility, voter registration access, election administration, or electoral system legitimacy are tagged and elevated for analyst review. See /methodology for full details.",
    answerUk:
      "Моніторинг виборчої дезінформації відбувається через той самий семиетапний конвеєр виявлення, що й загальне висвітлення дезінформації, з додатковим фільтром виборчого контексту.",
    defaultOpen: true,
  },
  {
    question: "What constitutes foreign election interference?",
    questionUk: "Що становить іноземне втручання у вибори?",
    answer:
      "Aegis Lens defines foreign election interference as documented action by a foreign state or state-affiliated actor intended to influence the outcome of an election or undermine confidence in the electoral process. This includes: covert financial support to candidates or parties, cyber operations targeting electoral infrastructure, coordinated disinformation campaigns attributed to foreign actors, and overt threats or pressure on voters or officials.",
    answerUk:
      "Aegis Lens визначає іноземне втручання у вибори як задокументовані дії іноземної держави або афілійованого з нею суб'єкта, спрямовані на вплив на результат виборів або підрив довіри до виборчого процесу.",
    defaultOpen: false,
  },
  {
    question: "Why did Aegis Lens cover the Romania 2024 election annulment?",
    questionUk: "Чому Aegis Lens висвітлював скасування виборів у Румунії 2024 року?",
    answer:
      "The Romania 2024 presidential election is the first documented case in the European Union where a first-round result was annulled due to a foreign-linked social media manipulation campaign (TikTok algorithmic amplification attributed by Romanian intelligence to a coordinated Russian-linked network). It sets a significant precedent for election integrity in the region.",
    answerUk:
      "Президентські вибори в Румунії 2024 року — перший задокументований випадок в ЄС, коли результат першого туру було анульовано через іноземну маніпуляцію в соціальних мережах, задокументовану румунською розвідкою.",
    defaultOpen: false,
  },
  {
    question: "Will Aegis Lens cover Ukrainian elections if and when they occur?",
    questionUk: "Чи висвітлюватиме Aegis Lens українські вибори, якщо та коли вони відбудуться?",
    answer:
      "Yes. Ukrainian elections, when they occur under legally established conditions, will receive full coverage including disinformation monitoring, integrity signals, and foreign interference documentation. Coverage will adhere to the same strict neutrality policy. We will not editorially advocate for any candidate or outcome.",
    answerUk:
      "Так. Українські вибори, коли вони відбудуться за законно встановлених умов, отримають повне висвітлення, включаючи моніторинг дезінформації, сигнали цілісності та документування іноземного втручання.",
    defaultOpen: false,
  },
  {
    question: "Does Aegis Lens publish exit polls or electoral forecasts?",
    questionUk: "Чи публікує Aegis Lens екзитполи або виборчі прогнози?",
    answer:
      "No. Aegis Lens does not publish vote-share forecasts, seat projections, or electoral outcome predictions. We do not host or commission polling. Where polling data is editorially relevant (e.g., documenting disinformation that references polling), we link to reputable aggregate sources.",
    answerUk:
      "Ні. Aegis Lens не публікує прогнози частки голосів, проекції місць або прогнози виборчих результатів. Ми не проводимо та не замовляємо опитування.",
    defaultOpen: false,
  },
  {
    question: "What role do deepfakes play in election interference?",
    questionUk: "Яку роль відіграють діпфейки у втручанні у вибори?",
    answer:
      "Deepfake audio and video of candidates have become a documented interference tool in multiple recent elections. Fabricated statements, false concession calls, and synthetic scandal footage are among the documented use cases. Aegis Lens flags suspected synthetic media in election coverage and requires forensic corroboration before confirming fabrication.",
    answerUk:
      "Діпфейкові аудіо та відео кандидатів стали задокументованим інструментом втручання в кількох нещодавніх виборах. Aegis Lens позначає підозрілі синтетичні медіа у виборчих матеріалах.",
    defaultOpen: false,
  },
  {
    question: "How are election-related events tagged in the Aegis Lens database?",
    questionUk: "Як події, пов'язані з виборами, позначаються в базі даних Aegis Lens?",
    answer:
      "Election-related events are tagged with 'elections' at the topic level, plus the relevant ISO country code and election year (e.g., 'elections:PL:2025'). Events involving disinformation are additionally tagged 'disinformation'. Foreign interference events are tagged 'foreign-interference'. These tags are exposed via the API and filterable on the live map.",
    answerUk:
      "Події, пов'язані з виборами, позначаються тегом «elections» на рівні теми, плюс відповідний код ISO країни та рік виборів. Додаткові теги: «disinformation», «foreign-interference».",
    defaultOpen: false,
  },
  {
    question: "How can I report a suspected election interference event?",
    questionUk: "Як я можу повідомити про підозрюваний випадок виборчого втручання?",
    answer:
      "Use the tip submission form at /contact and select category 'Election integrity'. Please include: the country and election concerned, the source URL or screenshot, your analysis of why this may constitute interference, and any corroborating evidence. All tips receive analyst review within 24 hours for active election monitoring periods.",
    answerUk:
      "Використайте форму подачі на /contact і виберіть категорію «Цілісність виборів». Включіть: країну та вибори, URL джерела або скріншот, ваш аналіз та підтвердні докази.",
    defaultOpen: false,
  },
];

// ---------------------------------------------------------------------------
// FAQPage JSON-LD schema helper
// ---------------------------------------------------------------------------

export function electionsFaqJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ELECTIONS_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
