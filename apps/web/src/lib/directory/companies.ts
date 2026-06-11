/**
 * Companies directory — types, interfaces, filter facets, and helper utilities.
 * Директорія компаній — типи, інтерфейси, фасети фільтрів та допоміжні утиліти.
 */

import type { ListingTier } from "./strategy";

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export type CompanyIndustry =
  | "osint"
  | "cybersecurity"
  | "geo-intelligence"
  | "threat-intelligence"
  | "defense-tech"
  | "satellite"
  | "media-monitoring"
  | "risk-consulting"
  | "humanitarian-tech"
  | "ai-analytics";

export type CompanySize =
  | "startup-1-10"
  | "small-11-50"
  | "mid-51-200"
  | "large-201-1000"
  | "enterprise-1000plus";

export type CompanyCertification =
  | "iso-27001"
  | "soc2"
  | "nato-clearance"
  | "gov-secret"
  | "crest"
  | "oscp"
  | "sec-cleared";

// ---------------------------------------------------------------------------
// CompanyProfile interface
// ---------------------------------------------------------------------------

export interface CompanyProfile {
  id: string;
  slug: string;
  name: string;
  tagline_en: string;
  tagline_uk: string;
  description_en: string;
  description_uk: string;
  industries: CompanyIndustry[];
  size: CompanySize;
  foundedYear: number | null;
  hqCountry: string;
  hqCity: string;
  regionsServed: string[];
  certifications: CompanyCertification[];
  integrations: string[];
  partnersWith: string[];
  listingTier: ListingTier;
  verified: boolean;
  claimedBy: string | null;
  reviewCount: number;
  ratingAvg: number | null;
  notes_en: string;
  notes_uk: string;
}

// ---------------------------------------------------------------------------
// Filter facets
// ---------------------------------------------------------------------------

export const COMPANY_FILTER_FACETS: Record<string, string[]> = {
  industry: [
    "osint",
    "cybersecurity",
    "geo-intelligence",
    "threat-intelligence",
    "defense-tech",
    "satellite",
    "media-monitoring",
    "risk-consulting",
    "humanitarian-tech",
    "ai-analytics",
  ],
  region: [
    "UA",
    "EU",
    "US",
    "UK",
    "CA",
    "AU",
    "IL",
    "Global",
  ],
  size: [
    "startup-1-10",
    "small-11-50",
    "mid-51-200",
    "large-201-1000",
    "enterprise-1000plus",
  ],
  certifications: [
    "iso-27001",
    "soc2",
    "nato-clearance",
    "gov-secret",
    "crest",
    "oscp",
    "sec-cleared",
  ],
  verified: ["true", "false"],
  tier: [
    "free-community",
    "free-crawled",
    "claimed-basic",
    "claimed-featured",
    "sponsored",
  ],
};

// ---------------------------------------------------------------------------
// Programmatic routes
// ---------------------------------------------------------------------------

export const COMPANY_PROGRAMMATIC_ROUTES_EN =
  "Programmatic cross-pages are generated for three URL patterns: " +
  "(1) /companies/<industry> — all companies in a given industry vertical; " +
  "(2) /companies/<city> — all companies headquartered in or serving a given city; " +
  "(3) /companies/<industry>/<city> — intersection pages combining industry and city for maximum long-tail SEO coverage.";

export const COMPANY_PROGRAMMATIC_ROUTES_UK =
  "Програмні крос-сторінки генеруються за трьома шаблонами URL: " +
  "(1) /companies/<industry> — усі компанії в певній галузевій вертикалі; " +
  "(2) /companies/<city> — усі компанії з головним офісом або обслуговуванням у певному місті; " +
  "(3) /companies/<industry>/<city> — перетинні сторінки, що поєднують галузь і місто для максимального охоплення довгохвостового SEO.";

// ---------------------------------------------------------------------------
// Schema.org notes
// ---------------------------------------------------------------------------

export const COMPANY_SCHEMA_NOTE_EN =
  "Each company profile renders schema.org Organization markup with nested Place for HQ location. " +
  "Key properties include: name, description, url, foundingDate, numberOfEmployees, address (Place), " +
  "areaServed, knowsAbout (industry tags), and sameAs (social/official links). " +
  "Certified listings include hasCredential properties for certifications.";

export const COMPANY_SCHEMA_NOTE_UK =
  "Кожен профіль компанії відображає розмітку schema.org Organization із вкладеним Place для локації головного офісу. " +
  "Ключові властивості: name, description, url, foundingDate, numberOfEmployees, address (Place), " +
  "areaServed, knowsAbout (теги галузі) та sameAs (соціальні/офіційні посилання). " +
  "Лістинги із сертифікатами включають властивості hasCredential.";

// ---------------------------------------------------------------------------
// Lead-gen notes
// ---------------------------------------------------------------------------

export const COMPANY_LEAD_GEN_NOTE_EN =
  "Claimed-featured and sponsored listings display a lead-gen widget on their profile page. " +
  "The widget surfaces a 'Request Quote' or 'Book Demo' CTA that submits an inquiry form. " +
  "Leads are routed to the claiming organization via email and stored in the platform CRM. " +
  "A/B testing of CTA copy is available at the featured tier.";

export const COMPANY_LEAD_GEN_NOTE_UK =
  "Виділені та спонсоровані лістинги відображають лід-генерувальний віджет на сторінці профілю. " +
  "Віджет показує CTA 'Запит пропозиції' або 'Забронювати демо', що надсилає форму запиту. " +
  "Ліди маршрутизуються до організації-заявника електронною поштою та зберігаються в CRM платформи. " +
  "A/B тестування тексту CTA доступне на виділеному рівні.";

// ---------------------------------------------------------------------------
// Anti-impersonation notes
// ---------------------------------------------------------------------------

export const COMPANY_ANTI_IMPERSONATION_NOTE_EN =
  "Anti-impersonation policy: domain verification is required to claim a listing. " +
  "Disputed or duplicate profiles trigger a moderation review. " +
  "Verified organizations may submit a takedown request for impersonating entries via a dedicated form. " +
  "Repeated abuse results in IP and email banning. " +
  "All claimed listings are logged with verifier identity for audit purposes.";

export const COMPANY_ANTI_IMPERSONATION_NOTE_UK =
  "Політика захисту від самозванства: для заявки лістингу потрібна верифікація домену. " +
  "Оскаржені або дублікатні профілі запускають перевірку модератором. " +
  "Верифіковані організації можуть подати запит на видалення профілів-самозванців через спеціальну форму. " +
  "Повторне зловживання призводить до заблокування IP та електронної пошти. " +
  "Усі заявлені лістинги реєструються з ідентифікатором верифікатора для цілей аудиту.";

// ---------------------------------------------------------------------------
// Export notes
// ---------------------------------------------------------------------------

export const COMPANY_EXPORT_NOTE_EN =
  "CSV and API export of company data is available for claimed-basic, claimed-featured, and sponsored listings. " +
  "Free/crawled listings are excluded from bulk exports to prevent data harvesting. " +
  "API access requires an Aegis API key; rate limits apply. " +
  "Exported fields include: id, slug, name, industries, size, hqCountry, hqCity, regionsServed, certifications, verified, tier.";

export const COMPANY_EXPORT_NOTE_UK =
  "CSV та API-експорт даних компаній доступні для лістингів рівнів claimed-basic, claimed-featured та sponsored. " +
  "Безкоштовні/сканування лістинги виключені з масового експорту для запобігання збору даних. " +
  "Для доступу до API потрібен ключ Aegis API; застосовуються обмеження швидкості. " +
  "Поля експорту включають: id, slug, name, industries, size, hqCountry, hqCity, regionsServed, certifications, verified, tier.";

// ---------------------------------------------------------------------------
// Seed notes
// ---------------------------------------------------------------------------

export const COMPANY_SEED_NOTE_EN =
  "Initial seed target: 500–1000 hand-curated company entries. " +
  "Curation criteria: publicly verifiable organization, active within last 24 months, " +
  "relevant to OSINT / security / defense / intelligence domains. " +
  "Seed sourced from conference attendee lists, industry reports, LinkedIn, and partner referrals. " +
  "Curated beats exhaustive: 500 verified entries outperform 50k scraped entries for trust and conversion.";

export const COMPANY_SEED_NOTE_UK =
  "Початкова мета сідування: 500–1000 вручну відібраних записів компаній. " +
  "Критерії відбору: публічно верифікована організація, активна протягом останніх 24 місяців, " +
  "релевантна до сфер OSINT / безпека / оборона / розвідка. " +
  "Джерела для сідування: списки учасників конференцій, галузеві звіти, LinkedIn та рекомендації партнерів. " +
  "Якість важливіша за кількість: 500 верифікованих записів перевершують 50 тис. зісканованих за довірою та конверсією.";

// ---------------------------------------------------------------------------
// Intel layer integration notes
// ---------------------------------------------------------------------------

export const COMPANY_INTEL_INTEGRATION_NOTE_EN =
  "Company profiles are cross-referenced with the platform intelligence layer: " +
  "each profile displays a live mention count (news, reports, events referencing the company), " +
  "a list of related events (conflicts, incidents, contracts) from the event database, " +
  "and a link to any associated AOI or region feed entries. " +
  "Intel integration data refreshes on the platform's standard 30-second dashboard cycle.";

export const COMPANY_INTEL_INTEGRATION_NOTE_UK =
  "Профілі компаній перехресно посилаються на розвідувальний шар платформи: " +
  "кожен профіль відображає лічильник згадок у реальному часі (новини, звіти, події, що посилаються на компанію), " +
  "список пов'язаних подій (конфлікти, інциденти, контракти) з бази даних подій " +
  "та посилання на пов'язані записи AOI або регіональних фідів. " +
  "Дані розвідувальної інтеграції оновлюються за стандартним 30-секундним циклом дашборду платформи.";

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Convert a company name to a URL-safe slug.
 * Перетворює назву компанії на безпечний для URL слаг.
 */
export function getCompanySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Build a schema.org Organization plain object from a CompanyProfile.
 * Формує plain-об'єкт schema.org Organization із CompanyProfile.
 */
export function buildCompanySchemaOrg(profile: CompanyProfile): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: profile.name,
    description: profile.description_en,
    url: `https://aegislens.com/directory/companies/${profile.slug}`,
    ...(profile.foundedYear !== null && { foundingDate: String(profile.foundedYear) }),
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.hqCity,
      addressCountry: profile.hqCountry,
    },
    areaServed: profile.regionsServed,
    knowsAbout: profile.industries,
  };

  if (profile.certifications.length > 0) {
    schema.hasCredential = profile.certifications.map((cert) => ({
      "@type": "EducationalOccupationalCredential",
      name: cert,
    }));
  }

  return schema;
}
