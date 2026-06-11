import { DEFAULT_LOCALE, type Locale } from "@aegis/types";

/**
 * SEO-friendly URL builder.
 *
 * Rules (see TODO/urls_slugs/):
 * - Locale prefix at root: `/<lc>/...`; EN default at `/`
 * - Lowercase, kebab-case slugs
 * - No trailing slash on canonical
 * - ≤ 75 char target
 *
 * Single source of truth — every service that emits a URL imports from here.
 */

// ---------- Slug normalization ----------

const TRANSLIT_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie",
  ж: "zh", з: "z", и: "y", і: "i", ї: "i", й: "i", к: "k", л: "l",
  м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ь: "",
  ю: "iu", я: "ia", "'": "",
};

function transliterate(s: string): string {
  return s
    .toLowerCase()
    .split("")
    .map((c) => TRANSLIT_MAP[c] ?? c)
    .join("");
}

/**
 * Normalize a string into a URL-safe kebab slug.
 *
 * @param input raw text (any case, any language)
 * @param opts.transliterate Cyrillic→Latin (default true for non-UK locales)
 */
export function slugify(
  input: string,
  opts: { transliterate?: boolean; maxLength?: number } = {},
): string {
  const { transliterate: doTrans = true, maxLength = 75 } = opts;
  let s = input.toLowerCase().trim();
  if (doTrans) s = transliterate(s);
  s = s
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  if (s.length > maxLength) {
    s = s.slice(0, maxLength).replace(/-[^-]*$/, "");
  }
  return s;
}

// ---------- Locale-aware path building ----------

/**
 * Prefix a path with locale. EN omits the prefix at root.
 *
 * @example
 *   localePath("uk", "/regions/ua/kharkiv") -> "/uk/regions/ua/kharkiv"
 *   localePath("en", "/regions/ua/kharkiv") -> "/regions/ua/kharkiv"
 */
export function localePath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? normalized : `/${locale}${normalized}`;
}

// ---------- Per-entity URL builders ----------

export const urls = {
  home: (locale: Locale) => localePath(locale, "/"),
  map: (locale: Locale) => localePath(locale, "/map"),
  pricing: (locale: Locale) => localePath(locale, "/pricing"),
  docs: (locale: Locale) => localePath(locale, "/docs"),
  about: (locale: Locale) => localePath(locale, "/about"),
  blog: (locale: Locale) => localePath(locale, "/blog"),
  blogPost: (locale: Locale, slug: string) =>
    localePath(locale, `/blog/${slug}`),
  team: (locale: Locale) => localePath(locale, "/team"),
  teamMember: (locale: Locale, slug: string) =>
    localePath(locale, `/team/${slug}`),

  login: (locale: Locale) => localePath(locale, "/login"),
  signup: (locale: Locale) => localePath(locale, "/signup"),

  region: (locale: Locale, countryIso2: string, regionSlug?: string) =>
    localePath(
      locale,
      regionSlug
        ? `/regions/${countryIso2.toLowerCase()}/${regionSlug}`
        : `/regions/${countryIso2.toLowerCase()}`,
    ),
  conflict: (locale: Locale, slug: string) =>
    localePath(locale, `/conflicts/${slug}`),
  event: (locale: Locale, id: string) => localePath(locale, `/events/${id}`),
  companyDetail: (locale: Locale, slug: string) =>
    localePath(locale, `/companies/${slug}`),
  toolDetail: (locale: Locale, slug: string) => localePath(locale, `/tools/${slug}`),
  equipment: (locale: Locale, slug: string) =>
    localePath(locale, `/equipment/${slug}`),
  entity: (locale: Locale, slug: string) =>
    localePath(locale, `/entities/${slug}`),
  entityFeed: (slug: string) => `/entities/${slug}/feed.xml`,
  entityFeedLocale: (locale: Locale, slug: string) =>
    locale === "en" ? `/entities/${slug}/feed.xml` : `/${locale}/entities/${slug}/feed.xml`,
  entityAtom: (slug: string) => `/entities/${slug}/atom.xml`,
  entityAtomLocale: (locale: Locale, slug: string) =>
    locale === "en" ? `/entities/${slug}/atom.xml` : `/${locale}/entities/${slug}/atom.xml`,
  entityJson: (slug: string) => `/entities/${slug}/feed.json`,
  entityJsonLocale: (locale: Locale, slug: string) =>
    locale === "en" ? `/entities/${slug}/feed.json` : `/${locale}/entities/${slug}/feed.json`,
  newsJson: () => "/news/feed.json",
  newsJsonLocale: (locale: Locale) =>
    locale === "en" ? "/news/feed.json" : `/${locale}/news/feed.json`,
  topicJson: (slug: string) => `/topics/${slug}/feed.json`,
  topicJsonLocale: (locale: Locale, slug: string) =>
    locale === "en" ? `/topics/${slug}/feed.json` : `/${locale}/topics/${slug}/feed.json`,
  topicAtom: (slug: string) => `/topics/${slug}/atom.xml`,
  topicAtomLocale: (locale: Locale, slug: string) =>
    locale === "en" ? `/topics/${slug}/atom.xml` : `/${locale}/topics/${slug}/atom.xml`,
  glossary: (locale: Locale, slug?: string) =>
    localePath(locale, slug ? `/glossary/${slug}` : "/glossary"),
  entities: (locale: Locale) => localePath(locale, "/entities"),
  news: (locale: Locale, page?: number) =>
    localePath(locale, page && page > 1 ? `/news?page=${page}` : "/news"),
  topic: (locale: Locale, slug: string) => localePath(locale, `/topics/${slug}`),
  topics: (locale: Locale) => localePath(locale, "/topics"),
  search: (locale: Locale, q?: string) =>
    localePath(locale, q ? `/search?q=${encodeURIComponent(q)}` : "/search"),
  reports: (locale: Locale) => localePath(locale, "/reports"),
  report: (locale: Locale, slug: string) => localePath(locale, `/reports/${slug}`),
  sources: (locale: Locale) => localePath(locale, "/sources"),
  source: (locale: Locale, slug: string) => localePath(locale, `/sources/${slug}`),
  topicFeed: (locale: Locale, slug: string) =>
    localePath(locale, `/topics/${slug}/feed.xml`),
  newsFeed: (locale: Locale) => localePath(locale, "/news/feed.xml"),
  newsAtom: () => "/news/atom.xml",
  newsAtomLocale: (locale: Locale) =>
    locale === "en" ? "/news/atom.xml" : `/${locale}/news/atom.xml`,

  incidents: (locale: Locale) => localePath(locale, "/incidents"),
  methodology: (locale: Locale) => localePath(locale, "/methodology"),
  docsApi: (locale: Locale) => localePath(locale, "/docs/api"),
  changelog: (locale: Locale) => localePath(locale, "/changelog"),
  security: (locale: Locale) => localePath(locale, "/security"),
  legalDmca: (locale: Locale) => localePath(locale, "/legal/dmca"),
  legalCookies: (locale: Locale) => localePath(locale, "/legal/cookies"),

  stats: (locale: Locale) => localePath(locale, "/stats"),
  timeline: (locale: Locale) => localePath(locale, "/timeline"),
  alerts: (locale: Locale) => localePath(locale, "/alerts"),
  press: (locale: Locale) => localePath(locale, "/press"),
  status: (locale: Locale) => localePath(locale, "/status"),
  compare: (locale: Locale, oblasts?: string) =>
    localePath(locale, oblasts ? `/compare?oblasts=${encodeURIComponent(oblasts)}` : "/compare"),

  faq: (locale: Locale) => localePath(locale, "/faq"),
  partners: (locale: Locale) => localePath(locale, "/partners"),
  careers: (locale: Locale) => localePath(locale, "/careers"),
  account: (_locale?: Locale) => "/account",
  accountKeys: (_locale?: Locale) => "/account/api-keys",
  accountUsage: (_locale?: Locale) => "/account/usage",
  settings: (locale: Locale) => localePath(locale, "/settings"),

  docsSdks: (locale: Locale) => localePath(locale, "/docs/sdks"),
  docsGettingStarted: (locale: Locale) => localePath(locale, "/docs/getting-started"),
  docsConcepts: (locale: Locale) => localePath(locale, "/docs/concepts"),
  docsRateLimits: (locale: Locale) => localePath(locale, "/docs/rate-limits"),
  docsApiExplorer: (locale: Locale) => localePath(locale, "/docs/api/explorer"),

  guides: (locale: Locale) => localePath(locale, "/guides"),
  guide: (locale: Locale, slug: string) => localePath(locale, `/guides/${slug}`),
  industries: (locale: Locale) => localePath(locale, "/industries"),
  industry: (locale: Locale, slug: string) => localePath(locale, `/industries/${slug}`),
  alternatives: (locale: Locale, slug: string) =>
    localePath(locale, `/alternatives/${slug}`),
  tags: (locale: Locale) => localePath(locale, "/tags"),
  tag: (locale: Locale, slug: string) => localePath(locale, `/tags/${slug}`),

  threats: (locale: Locale) => localePath(locale, "/threats"),
  threat: (locale: Locale, slug: string) => localePath(locale, `/threats/${slug}`),
  toolPairCompare: (locale: Locale, aSlug: string, bSlug: string) => {
    const [first, second] = aSlug < bSlug ? [aSlug, bSlug] : [bSlug, aSlug];
    return localePath(locale, `/compare/tools/${first}-vs-${second}`);
  },
  toolTripleCompare: (
    locale: Locale,
    aSlug: string,
    bSlug: string,
    cSlug: string,
  ) => {
    const sorted = [aSlug, bSlug, cSlug].sort();
    return localePath(
      locale,
      `/compare/tools/3way/${sorted[0]}-vs-${sorted[1]}-vs-${sorted[2]}`,
    );
  },
  sanctionsEntity: (locale: Locale, slug: string) =>
    localePath(locale, `/sanctions/entity/${slug}`),
  topToolsForIndustry: (locale: Locale, industrySlug: string) =>
    localePath(locale, `/top-tools-for/${industrySlug}`),

  aiFor: (locale: Locale, industrySlug: string) =>
    localePath(locale, `/ai-for/${industrySlug}`),
  osintFor: (locale: Locale, industrySlug: string) =>
    localePath(locale, `/osint-for/${industrySlug}`),
  cybersecurityFor: (locale: Locale, industrySlug: string) =>
    localePath(locale, `/cybersecurity-for/${industrySlug}`),
  intelligenceFor: (locale: Locale, industrySlug: string) =>
    localePath(locale, `/intelligence-for/${industrySlug}`),
  monitoringFor: (locale: Locale, industrySlug: string) =>
    localePath(locale, `/monitoring-for/${industrySlug}`),
  bestToolsForAudience: (locale: Locale, audienceSlug: string) =>
    localePath(locale, `/best-tools-for/${audienceSlug}`),
  academy: (locale: Locale) => localePath(locale, "/academy"),
  academyPath: (locale: Locale, slug: string) =>
    localePath(locale, `/academy/${slug}`),

  useCaseTask: (locale: Locale, vertical: string, task: string) =>
    localePath(locale, `/use-cases/${vertical}/${task}`),
  companiesByRegion: (locale: Locale, slug: string) =>
    localePath(locale, `/companies/region/${slug}`),
  companiesByCity: (locale: Locale, slug: string) =>
    localePath(locale, `/companies/city/${slug}`),
  companiesNear: (locale: Locale, slug: string) =>
    localePath(locale, `/companies-near/${slug}`),
  companiesNearIndex: (locale: Locale) =>
    localePath(locale, "/companies-near"),
  industryCity: (locale: Locale, industrySlug: string, citySlug: string) =>
    localePath(locale, `/industries/${industrySlug}/${citySlug}`),

  scoring: (locale: Locale, metric: string) =>
    localePath(locale, `/scoring/${metric}`),
  cookbook: (locale: Locale) => localePath(locale, "/cookbook"),
  cookbookRecipe: (locale: Locale, slug: string) =>
    localePath(locale, `/cookbook/${slug}`),
  integrations: (locale: Locale) => localePath(locale, "/integrations"),
  integration: (locale: Locale, slug: string) =>
    localePath(locale, `/integrations/${slug}`),

  trend: (locale: Locale, slug: string) => localePath(locale, `/trends/${slug}`),
  sanctions: (locale: Locale) => localePath(locale, "/sanctions"),
  sanctionsList: (locale: Locale, slug: string) =>
    localePath(locale, `/sanctions/${slug}`),
  countries: (locale: Locale) => localePath(locale, "/countries"),
  country: (locale: Locale, iso2: string) =>
    localePath(locale, `/country/${iso2.toLowerCase()}`),
  countryFeed: (locale: Locale, iso2: string) =>
    localePath(locale, `/country/${iso2.toLowerCase()}/feed.xml`),
  oblastFeed: (locale: Locale, iso2: string, oblastSlug: string) =>
    localePath(
      locale,
      `/regions/${iso2.toLowerCase()}/${oblastSlug}/feed.xml`,
    ),
  oblastAtom: (iso2: string, oblastSlug: string) =>
    `/regions/${iso2.toLowerCase()}/${oblastSlug}/atom.xml`,
  oblastAtomLocale: (locale: Locale, iso2: string, oblastSlug: string) =>
    locale === "en"
      ? `/regions/${iso2.toLowerCase()}/${oblastSlug}/atom.xml`
      : `/${locale}/regions/${iso2.toLowerCase()}/${oblastSlug}/atom.xml`,
  oblastJson: (iso2: string, oblastSlug: string) =>
    `/regions/${iso2.toLowerCase()}/${oblastSlug}/feed.json`,
  oblastJsonLocale: (locale: Locale, iso2: string, oblastSlug: string) =>
    locale === "en"
      ? `/regions/${iso2.toLowerCase()}/${oblastSlug}/feed.json`
      : `/${locale}/regions/${iso2.toLowerCase()}/${oblastSlug}/feed.json`,
  investigationFeed: (slug: string) => `/investigations/${slug}/feed.xml`,
  investigationFeedLocale: (locale: Locale, slug: string) =>
    locale === "en" ? `/investigations/${slug}/feed.xml` : `/${locale}/investigations/${slug}/feed.xml`,
  investigationAtom: (slug: string) => `/investigations/${slug}/atom.xml`,
  investigationAtomLocale: (locale: Locale, slug: string) =>
    locale === "en" ? `/investigations/${slug}/atom.xml` : `/${locale}/investigations/${slug}/atom.xml`,
  investigationJson: (slug: string) => `/investigations/${slug}/feed.json`,
  investigationJsonLocale: (locale: Locale, slug: string) =>
    locale === "en" ? `/investigations/${slug}/feed.json` : `/${locale}/investigations/${slug}/feed.json`,
  investigationsFeed: () => "/investigations/feed.xml",
  investigationsFeedLocale: (locale: Locale) =>
    locale === "en"
      ? "/investigations/feed.xml"
      : `/${locale}/investigations/feed.xml`,
  reportsFeed: () => "/reports/feed.xml",
  reportsFeedLocale: (locale: Locale) =>
    locale === "en" ? "/reports/feed.xml" : `/${locale}/reports/feed.xml`,
  tagFeed: (slug: string) => `/tags/${slug}/feed.xml`,
  tagFeedLocale: (locale: Locale, slug: string) =>
    locale === "en"
      ? `/tags/${slug}/feed.xml`
      : `/${locale}/tags/${slug}/feed.xml`,

  newsArchive: (locale: Locale) => localePath(locale, "/news/archive"),
  newsArchiveYear: (locale: Locale, year: number) =>
    localePath(locale, `/news/archive/${year}`),
  newsArchiveMonth: (locale: Locale, year: number, month: number) =>
    localePath(locale, `/news/archive/${year}/${String(month).padStart(2, "0")}`),
  newsArchiveDay: (
    locale: Locale,
    year: number,
    month: number,
    day: number,
  ) =>
    localePath(
      locale,
      `/news/archive/${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`,
    ),
  videosByCategory: (locale: Locale, slug: string) =>
    localePath(locale, `/videos/category/${slug}`),
  bestOfYear: (locale: Locale, year: number) =>
    localePath(locale, `/best-of/${year}`),
  methodologyTopic: (locale: Locale, slug: string) =>
    localePath(locale, `/methodology/${slug}`),

  topicCountry: (locale: Locale, slug: string, iso2: string) =>
    localePath(locale, `/topics/${slug}/in/${iso2.toLowerCase()}`),
  topicYear: (locale: Locale, slug: string, year: number) =>
    localePath(locale, `/topics/${slug}/year/${year}`),
  threatCountry: (locale: Locale, slug: string, iso2: string) =>
    localePath(locale, `/threats/${slug}/in/${iso2.toLowerCase()}`),
  equipmentOperator: (locale: Locale, slug: string, operator: string) =>
    localePath(locale, `/equipment/${slug}/operated-by/${operator.toLowerCase()}`),
  sourceCountry: (locale: Locale, slug: string, iso2: string) =>
    localePath(locale, `/sources/${slug}/in/${iso2.toLowerCase()}`),
  useCaseTaskCountry: (
    locale: Locale,
    vertical: string,
    task: string,
    iso2: string,
  ) =>
    localePath(
      locale,
      `/use-cases/${vertical}/${task}/in/${iso2.toLowerCase()}`,
    ),
  scoringIndex: (locale: Locale) => localePath(locale, "/scoring"),

  caseStudies: (locale: Locale) => localePath(locale, "/case-studies"),
  caseStudy: (locale: Locale, slug: string) =>
    localePath(locale, `/case-studies/${slug}`),
  podcast: (locale: Locale) => localePath(locale, "/podcast"),
  podcastEpisode: (locale: Locale, slug: string) =>
    localePath(locale, `/podcast/${slug}`),
  videos: (locale: Locale) => localePath(locale, "/videos"),
  video: (locale: Locale, slug: string) => localePath(locale, `/videos/${slug}`),

  eventTimeline: (locale: Locale, id: string) =>
    localePath(locale, `/events/${id}/timeline`),
  eventSources: (locale: Locale, id: string) =>
    localePath(locale, `/events/${id}/sources`),
  eventMedia: (locale: Locale, id: string) =>
    localePath(locale, `/events/${id}/media`),
  eventRelated: (locale: Locale, id: string) =>
    localePath(locale, `/events/${id}/related`),
  partner: (locale: Locale, slug: string) =>
    localePath(locale, `/partners/${slug}`),
  academyLesson: (locale: Locale, pathSlug: string, lessonSlug: string) =>
    localePath(locale, `/academy/${pathSlug}/${lessonSlug}`),

  docsWebhooks: (locale: Locale) => localePath(locale, "/docs/webhooks"),
  docsErrors: (locale: Locale) => localePath(locale, "/docs/errors"),
  trust: (locale: Locale) => localePath(locale, "/trust"),
  trustDataPolicy: (locale: Locale) => localePath(locale, "/trust/data-policy"),
  trustTransparency: (locale: Locale) => localePath(locale, "/trust/transparency"),
  trustCorrections: (locale: Locale) => localePath(locale, "/trust/corrections"),

  investigations: (locale: Locale) => localePath(locale, "/investigations"),
  investigation: (locale: Locale, slug: string) =>
    localePath(locale, `/investigations/${slug}`),
  datasets: (locale: Locale) => localePath(locale, "/datasets"),
  trends: (locale: Locale) => localePath(locale, "/trends"),
  useCases: (locale: Locale) => localePath(locale, "/use-cases"),
  useCase: (locale: Locale, slug: string) => localePath(locale, `/use-cases/${slug}`),
  classifier: (locale: Locale) => localePath(locale, "/tools/classifier"),
  help: (locale: Locale, q?: string) =>
    localePath(locale, q ? `/help?q=${encodeURIComponent(q)}` : "/help"),
  helpArticle: (locale: Locale, slug: string) => localePath(locale, `/help/${slug}`),
  contact: (locale: Locale) => localePath(locale, "/contact"),
  dashboard: (locale: Locale) => localePath(locale, "/dashboard"),
  presets: (locale: Locale) => localePath(locale, "/presets"),

  // Directory
  companies: (locale: Locale, industry?: string, city?: string) =>
    localePath(
      locale,
      [`/companies`, industry, city].filter(Boolean).join("/"),
    ),
  tools: (locale: Locale, category?: string) =>
    localePath(locale, category ? `/tools/${category}` : "/tools"),
};

// ---------- Canonical absolute URL ----------

export function absoluteUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

// ---------- Hreflang ----------

import { LOCALES } from "@aegis/types";

/**
 * Generate `<link rel="alternate" hreflang>` entries for every locale variant
 * of the given path-builder function.
 *
 * @example
 *   hreflangs(siteUrl, (lc) => urls.region(lc, "ua", "kharkiv"))
 */
export function hreflangs(
  siteUrl: string,
  pathFor: (locale: Locale) => string,
): { hreflang: string; href: string }[] {
  const entries: { hreflang: string; href: string }[] = LOCALES.map((lc) => ({
    hreflang: lc,
    href: absoluteUrl(siteUrl, pathFor(lc)),
  }));
  entries.push({ hreflang: "x-default", href: absoluteUrl(siteUrl, pathFor(DEFAULT_LOCALE)) });
  return entries;
}
