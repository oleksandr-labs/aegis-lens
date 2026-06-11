/**
 * Journalist / Newsroom persona — verification toolkit, press grants, embed config.
 * Persona strategy: docs/audiences/personas.md §P2
 */

import type { PersonaFeatureSet, PersonaUseCase } from './types';

// ---------------------------------------------------------------------------
// Persona descriptors
// ---------------------------------------------------------------------------

export const JOURNALIST_FEATURES: PersonaFeatureSet = {
  personaId: 'journalist',
  name_en: 'Journalist & Newsroom',
  name_uk: 'Журналіст і редакція',
  description_en:
    'Investigative and breaking-news journalists who need verifiable, citable findings ' +
    'under deadline. Every embed is a backlink; every citation builds brand authority.',
  description_uk:
    'Журналісти-розслідувачі та репортери новин, яким потрібні верифіковані, ' +
    'цитовані висновки в умовах дедлайну. Кожен вбудований елемент — це беклінк; ' +
    'кожна цитата зміцнює авторитет бренду.',
  recommendedTier: 'observer',
  keyFeatures_en: [
    'Verified press tier — credential check grants free Pro access',
    'One-click citation generator (APA / Chicago / AP / plain text)',
    'Embeddable map widgets with full attribution',
    'Embeddable charts and timelines',
    'Press-ready event snapshots (high-res PNG + caption + source list)',
    'Newsroom Slack and Teams app integration',
    'Real-time press alerts — region and topic subscriptions',
    'Press contact directory per region',
    'Press kit and style guide for crediting Aegis Lens',
    'Saved searches and collaborative story files',
    'Export story file to ready-to-publish brief (PDF + JSON + sources)',
    'Newsroom seat licensing',
    '"How to cite an OSINT source" pillar page',
    'Per-newsroom case studies',
  ],
  keyFeatures_uk: [
    'Верифікований прес-рівень — перевірка акредитації надає безкоштовний Pro-доступ',
    'Генератор цитат в один клік (APA / Chicago / AP / звичайний текст)',
    'Вбудовувані картографічні віджети з повним зазначенням авторства',
    'Вбудовувані діаграми та хронології',
    'Знімки подій для преси (PNG у високій роздільній здатності + підпис + список джерел)',
    'Інтеграція зі Slack і Teams для редакцій',
    'Прес-сповіщення в реальному часі — підписки за регіоном і темою',
    'Каталог прес-контактів за регіонами',
    'Прес-кіт і стайлгайд для посилань на Aegis Lens',
    'Збережені пошуки та спільні тематичні папки',
    'Експорт тематичної папки в готовий до публікації бриф (PDF + JSON + джерела)',
    'Ліцензування місць для редакцій',
    'Ключова стаття «Як цитувати джерело OSINT»',
    'Кейс-стаді для окремих редакцій',
  ],
  onboardingPath: [
    '/onboarding/welcome',
    '/onboarding/press-verification',
    '/onboarding/story-file-setup',
    '/onboarding/embed-widgets',
    '/onboarding/press-alerts',
  ],
  ctas: {
    primary_en: 'Apply for press access',
    primary_uk: 'Подати заявку на прес-доступ',
    secondary_en: 'View embed demo',
    secondary_uk: 'Переглянути демо вбудовування',
  },
  landingPageSlug: 'journalist',
};

export const JOURNALIST_USE_CASE: PersonaUseCase = {
  personaId: 'journalist',
  jobToBeDone_en:
    'Find, verify, and cite open-source evidence for breaking and investigative stories — ' +
    'fast enough to hit the news cycle and rigorous enough to survive editorial fact-check.',
  jobToBeDone_uk:
    'Знаходити, верифікувати та цитувати докази з відкритих джерел для ' +
    'оперативних і розслідувальних матеріалів — достатньо швидко для новинного циклу ' +
    'та достатньо ретельно, щоб пройти редакційну перевірку фактів.',
  painPoints_en: [
    'Verification takes hours across fragmented tools; deadlines are minutes',
    'Citation formats differ by outlet — manual reformatting wastes time',
    'Embedding OSINT evidence in articles requires expensive custom development',
    'Source credibility unclear — hard to explain to editors how a source was assessed',
    'Deepfakes and AI-generated imagery undermine confidence in visual evidence',
    'No structured press-credential discount — paying enterprise rates for occasional use',
  ],
  workflow_en: [
    'Receive tip or monitor alerts for breaking event',
    'Open Aegis Lens press dashboard; apply region + topic filters',
    'Review corroborated events; inspect source reputation scores',
    'Run media verification toolkit: reverse image, metadata, deepfake check',
    'Generate citation in required house style with one click',
    'Create story file — attach events, images, sources, notes',
    'Embed map widget or export press-ready PNG into article CMS',
    'Share story file PDF with editor for sign-off',
  ],
  keyDifferentiators_en: [
    'Single platform replaces 6+ standalone verification tools',
    'Citation generator eliminates manual style reformatting',
    'Embed widgets mean OSINT evidence reaches the public in the story, not just links',
    'Press tier is free — lowers barrier to adoption by underfunded outlets',
    'Source reputation layer gives editors a defensible trust framework',
  ],
};

// ---------------------------------------------------------------------------
// Media verification toolkit
// ---------------------------------------------------------------------------

export const MEDIA_VERIFICATION_TOOLKIT: {
  tool: string;
  description_en: string;
  usage_en: string;
}[] = [
  {
    tool: 'Reverse Image Search',
    description_en:
      'Cross-references an image against multiple reverse-search engines (Google, Yandex, Bing, TinEye) ' +
      'to surface earlier appearances and detect recycled imagery.',
    usage_en: 'Upload image or paste URL; results show earliest known publication date and source chain.',
  },
  {
    tool: 'Metadata Extraction',
    description_en:
      'Reads EXIF, XMP, and IPTC metadata from images and video files to extract device info, ' +
      'GPS coordinates, and timestamp data.',
    usage_en: 'Upload media file; parsed metadata displayed with highlight on GPS and timestamp fields.',
  },
  {
    tool: 'Geolocation Check',
    description_en:
      'Compares visual landmarks in an image against satellite and street-level imagery to confirm ' +
      'or refute the claimed location.',
    usage_en: 'Open geolocation workspace; drop proposed pin; attach visual clue annotations.',
  },
  {
    tool: 'Timeline Cross-Reference',
    description_en:
      'Checks whether reported event time aligns with shadow angles, weather records, and ' +
      'corroborating reports from independent sources.',
    usage_en: 'Select event; timeline panel shows corroborating and conflicting timestamps with source list.',
  },
  {
    tool: 'Source Credibility Score',
    description_en:
      'Aggregated trust signal for a Telegram channel, Twitter account, or news outlet, ' +
      'derived from historical accuracy rate, publication pattern, and community flags.',
    usage_en: 'Click any source; credibility panel shows score, breakdown, and historical accuracy rate.',
  },
  {
    tool: 'AI Deepfake Check',
    description_en:
      'Runs visual AI detection models to flag potential AI-generated or manipulated imagery, ' +
      'providing a confidence score and artifact heatmap.',
    usage_en: 'Upload image; deepfake analysis returns confidence score and highlights suspicious regions.',
  },
  {
    tool: 'Quote Verification Against Originals',
    description_en:
      'Traces a quoted statement back to its original publication context, checking for ' +
      'truncation, mistranslation, or decontextualisation.',
    usage_en: 'Paste quote; system searches indexed sources and returns original context with diff view.',
  },
  {
    tool: 'Embed Code Generator with Attribution',
    description_en:
      'Generates standards-compliant embed snippets (iframe, oEmbed, AMP) with mandatory ' +
      'source attribution included in the rendered output.',
    usage_en: 'Select map, chart, or event; choose embed type; copy snippet with attribution pre-populated.',
  },
  {
    tool: 'Video Key-Frame Extractor',
    description_en:
      'Extracts key frames from video for independent reverse-search and geolocation analysis.',
    usage_en: 'Upload video URL; key frames extracted and queued for reverse image search automatically.',
  },
];

// ---------------------------------------------------------------------------
// Press grant eligibility
// ---------------------------------------------------------------------------

export const JOURNALIST_GRANT_ELIGIBILITY: {
  qualificationCriteria_en: string[];
  requiredVerificationMethod: string;
  grantedTierId: string;
  discountPct: number;
} = {
  qualificationCriteria_en: [
    'Active staff or freelance journalist with published bylines in the last 12 months',
    'Verified organisational email domain matching a recognised news outlet',
    'Valid press card from a recognised national or international press association',
    'Agreement to attribute Aegis Lens as the data source in all published uses',
    'Non-commercial editorial use only (not for marketing or PR content)',
  ],
  requiredVerificationMethod: 'domain-check + press card upload',
  grantedTierId: 'observer',
  discountPct: 90,
};

// ---------------------------------------------------------------------------
// Newsroom embed config
// ---------------------------------------------------------------------------

export const NEWSROOM_EMBED_CONFIG: {
  embedTypes: string[];
  attributionRequired: boolean;
  commercialUseAllowed: boolean;
  shareAlikeRequired: boolean;
} = {
  embedTypes: ['iframe', 'oEmbed', 'AMP', 'React component (npm)'],
  attributionRequired: true,
  commercialUseAllowed: false,
  shareAlikeRequired: false,
};
