export type OsintFeedType = 'telegram' | 'twitter' | 'discord' | 'rss' | 'api';

export interface OsintFeed {
  id: string;
  name: string;
  type: OsintFeedType;
  /** URL for RSS/API feeds. */
  url?: string;
  /** Handle/channel/username for social feeds. */
  handle?: string;
  /** Primary language (BCP-47). */
  lang: string;
  /** Domain expertise description. */
  specialty: string;
  /** Editorial trust classification. */
  trustTier: 'verified' | 'community' | 'unvetted';
  /** Who vetted this source (organisation or analyst team). */
  vettedBy?: string;
  /** Side association (UA-aligned / RU-aligned / neutral). For RU milbloggers: labeled for monitoring, not endorsement. */
  affiliation?: 'ua' | 'ru' | 'int' | 'neutral';
  /**
   * If true, all items from this feed are automatically flagged requiresVerification.
   * Set for RU-side sources, unvetted accounts, and high-misinfo-risk feeds.
   */
  autoFlagVerification: boolean;
}

/**
 * Curated registry of 25+ OSINT community sources.
 *
 * POLICY:
 * - RU-aligned milbloggers are included for monitoring purposes only.
 *   They are clearly labelled `affiliation: 'ru'` and `autoFlagVerification: true`.
 *   Aegis Lens does not amplify or endorse their content.
 * - All items from `autoFlagVerification: true` sources are held for
 *   editorial review before appearing in the verified event stream.
 */
export const OSINT_COMMUNITY_FEEDS: OsintFeed[] = [
  // ── Ukrainian OSINT / analysis ──────────────────────────────────────────────
  {
    id: 'geoconfirmed',
    name: 'GeoConfirmed',
    type: 'twitter',
    handle: 'GeoConfirmed',
    lang: 'en',
    specialty: 'geolocation / open-source mapping',
    trustTier: 'verified',
    vettedBy: 'Aegis Lens editorial team',
    affiliation: 'int',
    autoFlagVerification: false,
  },
  {
    id: 'ua-weapons',
    name: 'UAWeapons',
    type: 'twitter',
    handle: 'UAWeapons',
    lang: 'en',
    specialty: 'equipment identification / battlefield losses',
    trustTier: 'verified',
    vettedBy: 'Aegis Lens editorial team',
    affiliation: 'ua',
    autoFlagVerification: false,
  },
  {
    id: 'militarnyi',
    name: 'Militarnyi',
    type: 'rss',
    url: 'https://mil.in.ua/uk/feed/',
    lang: 'uk',
    specialty: 'Ukrainian defence journalism / equipment',
    trustTier: 'verified',
    vettedBy: 'Aegis Lens editorial team',
    affiliation: 'ua',
    autoFlagVerification: false,
  },
  {
    id: 'inform-napalm',
    name: 'InformNapalm',
    type: 'rss',
    url: 'https://informnapalm.org/en/feed/',
    lang: 'en',
    specialty: 'Russian military unit tracking / OSINT investigations',
    trustTier: 'verified',
    vettedBy: 'Aegis Lens editorial team',
    affiliation: 'ua',
    autoFlagVerification: false,
  },
  {
    id: 'defense-express',
    name: 'Defense Express',
    type: 'rss',
    url: 'https://defence-ua.com/rss',
    lang: 'uk',
    specialty: 'Ukrainian defence industry / procurement',
    trustTier: 'verified',
    vettedBy: 'Aegis Lens editorial team',
    affiliation: 'ua',
    autoFlagVerification: false,
  },
  {
    id: 'deep-state-ua',
    name: 'DeepState UA',
    type: 'telegram',
    handle: 'deepstatemap',
    lang: 'uk',
    specialty: 'frontline mapping / territorial control',
    trustTier: 'verified',
    vettedBy: 'Aegis Lens editorial team',
    affiliation: 'ua',
    autoFlagVerification: false,
  },
  {
    id: 'front-info',
    name: 'Front.info',
    type: 'telegram',
    handle: 'frontinfo_ua',
    lang: 'uk',
    specialty: 'frontline situational awareness',
    trustTier: 'community',
    affiliation: 'ua',
    autoFlagVerification: true,
  },
  {
    id: 'ukraine-weapons-tracker',
    name: 'Ukraine Weapons Tracker',
    type: 'twitter',
    handle: 'UAWeaponsTracker',
    lang: 'en',
    specialty: 'weapons systems tracking / photographic evidence',
    trustTier: 'verified',
    vettedBy: 'Aegis Lens editorial team',
    affiliation: 'int',
    autoFlagVerification: false,
  },
  {
    id: 'osint-ukraine',
    name: 'OSINT Ukraine',
    type: 'twitter',
    handle: 'OSINTUkraine',
    lang: 'en',
    specialty: 'general OSINT aggregation / Ukraine',
    trustTier: 'community',
    affiliation: 'int',
    autoFlagVerification: true,
  },
  {
    id: 'war-mapper',
    name: 'War Mapper',
    type: 'twitter',
    handle: 'War_Mapper',
    lang: 'en',
    specialty: 'conflict cartography / territorial changes',
    trustTier: 'verified',
    vettedBy: 'Aegis Lens editorial team',
    affiliation: 'int',
    autoFlagVerification: false,
  },
  // ── International OSINT organisations ──────────────────────────────────────
  {
    id: 'bellingcat',
    name: 'Bellingcat',
    type: 'rss',
    url: 'https://www.bellingcat.com/feed/',
    lang: 'en',
    specialty: 'open-source investigations / geolocation / verification',
    trustTier: 'verified',
    vettedBy: 'Bellingcat editorial standards',
    affiliation: 'int',
    autoFlagVerification: false,
  },
  {
    id: 'acled',
    name: 'ACLED',
    type: 'api',
    url: 'https://acleddata.com/api/acled/read',
    lang: 'en',
    specialty: 'conflict event data / structured ACLED methodology',
    trustTier: 'verified',
    vettedBy: 'ACLED research team',
    affiliation: 'int',
    autoFlagVerification: false,
  },
  {
    id: 'conflict-monitor',
    name: 'Conflict Monitor (Planet Labs)',
    type: 'api',
    lang: 'en',
    specialty: 'satellite-derived damage assessment',
    trustTier: 'verified',
    vettedBy: 'Planet Labs commercial contract',
    affiliation: 'int',
    autoFlagVerification: false,
  },
  // ── RU-side milbloggers — monitoring only, NOT for amplification ─────────────
  {
    id: 'rybar',
    name: 'Rybar',
    type: 'telegram',
    handle: 'rybar',
    lang: 'ru',
    specialty: 'RU military operations / pro-Kremlin framing',
    trustTier: 'unvetted',
    affiliation: 'ru',
    autoFlagVerification: true,
  },
  {
    id: 'fighterbomber',
    name: 'Fighterbomber',
    type: 'telegram',
    handle: 'fighterbomber',
    lang: 'ru',
    specialty: 'RU aviation operations / milblogger perspective',
    trustTier: 'unvetted',
    affiliation: 'ru',
    autoFlagVerification: true,
  },
  {
    id: 'romanov-osint',
    name: 'Romanov Osint',
    type: 'telegram',
    handle: 'romanov_osint',
    lang: 'ru',
    specialty: 'RU-side geolocation claims',
    trustTier: 'unvetted',
    affiliation: 'ru',
    autoFlagVerification: true,
  },
  // ── Humanitarian / civilian ─────────────────────────────────────────────────
  {
    id: 'ukraine-map-alerts',
    name: 'Ukraine Air Alarm Map',
    type: 'api',
    url: 'https://alertsmap.com.ua/api',
    lang: 'uk',
    specialty: 'air raid alarm real-time status',
    trustTier: 'verified',
    vettedBy: 'UA government source',
    affiliation: 'ua',
    autoFlagVerification: false,
  },
  {
    id: 'ua-dsns',
    name: 'DSNS Ukraine',
    type: 'telegram',
    handle: 'dsns_telegram',
    lang: 'uk',
    specialty: 'State Emergency Service / SAR / disaster response',
    trustTier: 'verified',
    vettedBy: 'Ukrainian state agency',
    affiliation: 'ua',
    autoFlagVerification: false,
  },
  {
    id: 'nefodov-economics',
    name: 'Maksym Nefodov (Economic OSINT)',
    type: 'twitter',
    handle: 'mefodov',
    lang: 'en',
    specialty: 'Ukrainian economy / reconstruction tracking',
    trustTier: 'community',
    affiliation: 'ua',
    autoFlagVerification: true,
  },
  {
    id: 'ukraine-conflict-monitor',
    name: 'Ukraine Conflict Monitor (UNOSAT)',
    type: 'rss',
    url: 'https://unosat.org/products/rss',
    lang: 'en',
    specialty: 'UN satellite damage assessments',
    trustTier: 'verified',
    vettedBy: 'UNOSAT / UN operational satellite',
    affiliation: 'int',
    autoFlagVerification: false,
  },
  // ── Discord communities ─────────────────────────────────────────────────────
  {
    id: 'geoconfirmed-discord',
    name: 'GeoConfirmed Discord',
    type: 'discord',
    lang: 'en',
    specialty: 'crowdsourced geolocation / peer review',
    trustTier: 'community',
    affiliation: 'int',
    autoFlagVerification: true,
  },
  {
    id: 'asbmosint-discord',
    name: 'ASBM OSINT Discord',
    type: 'discord',
    lang: 'en',
    specialty: 'ballistic missile tracking / open source',
    trustTier: 'community',
    affiliation: 'int',
    autoFlagVerification: true,
  },
];
