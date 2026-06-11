import type { MetadataRoute } from "next";
import { urls, absoluteUrl, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, type Locale } from "@aegis/i18n-config";
import { listRegions } from "@/lib/regions-seed";
import { EQUIPMENT, CONFLICTS, GLOSSARY } from "@/lib/seed-data";
import { COMPANIES, TOOLS } from "@/lib/directory-seed";
import { listEvents, eventsInCountry, eventsInBbox } from "@/lib/events-seed";
import { listOblasts } from "@/lib/oblasts-seed";
import { CITIES } from "@/lib/cities-seed";
import { PUBLIC_SOURCES } from "@/lib/sources-public-seed";
import { REPORTS } from "@/lib/reports-seed";
import { SITE } from "@/lib/site";
import { ALL_CLASSES } from "@/lib/filter-config";
import { INVESTIGATIONS } from "@/lib/investigations-seed";
import { GUIDES } from "@/lib/guides-seed";
import { listIndustries } from "@/lib/industries";
import { listTags } from "@/lib/tags-index";
import { THREATS } from "@/lib/threats-seed";
import { AUDIENCES } from "@/lib/audiences-seed";
import { PATHS as ACADEMY_PATHS } from "@/lib/academy-seed";
import { USE_CASE_TASKS } from "@/lib/use-case-tasks";
import { ENTITIES } from "@/lib/entities-seed";
import { listCompanyCitySlugs, listIndustryCityPairs } from "@/lib/company-city";
import { SCORE_METRICS } from "@/lib/scores-seed";
import { RECIPES } from "@/lib/cookbook-seed";
import { INTEGRATIONS } from "@/lib/integrations-seed";
import { TRENDS } from "@/lib/trends-seed";
import { SANCTIONS_LISTS } from "@/lib/sanctions-seed";
import {
  eventYears,
  eventYearMonths,
  eventYearMonthDays,
  eventsInMonth,
  monthSlug,
} from "@/lib/news-archive";
import { METHODOLOGY_TOPICS } from "@/lib/methodology-topics";
import { listEquipmentOperatorPairs } from "@/lib/equipment-operators";
import { CASE_STUDIES } from "@/lib/case-studies-seed";
import { EPISODES as PODCAST_EPISODES } from "@/lib/podcast-seed";
import { VIDEOS } from "@/lib/videos-seed";
import { PARTNERS } from "@/lib/partners-seed";
import { BLOG_POSTS } from "@/lib/blog-seed";
import { TEAM_MEMBERS } from "@/lib/team-seed";
import { COMPETITORS } from "@/lib/competitors-seed";
import { DATASETS } from "@/lib/datasets-seed";

/**
 * Sitemap with alternate-language entries per route.
 * See TODO/seo/TODO_sitemap_strategy.md.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  const addRoute = (pathFor: (lc: Locale) => string, priority = 0.7) => {
    const languages: Record<string, string> = {};
    for (const lc of ACTIVE_LOCALES) {
      languages[lc] = absoluteUrl(SITE.url, pathFor(lc));
    }
    languages["x-default"] = absoluteUrl(SITE.url, pathFor("en"));

    entries.push({
      url: absoluteUrl(SITE.url, pathFor("en")),
      lastModified: now,
      changeFrequency: "weekly",
      priority,
      alternates: { languages },
    });
  };

  // Marketing core
  addRoute((lc) => urls.home(lc), 1.0);
  addRoute((lc) => urls.map(lc), 0.9);
  addRoute((lc) => urls.pricing(lc), 0.7);
  addRoute((lc) => urls.about(lc), 0.5);
  addRoute((lc) => urls.docs(lc), 0.5);
  addRoute((lc) => urls.blog(lc), 0.5);
  addRoute((lc) => urls.glossary(lc), 0.6);
  addRoute((lc) => urls.companies(lc), 0.6);
  addRoute((lc) => urls.tools(lc), 0.6);
  addRoute((lc) => urls.entities(lc), 0.6);
  addRoute((lc) => urls.news(lc), 0.7);
  addRoute((lc) => urls.topics(lc), 0.6);
  addRoute((lc) => urls.search(lc), 0.4);
  addRoute((lc) => urls.reports(lc), 0.7);
  addRoute((lc) => urls.sources(lc), 0.6);
  addRoute((lc) => urls.incidents(lc), 0.8);
  addRoute((lc) => urls.methodology(lc), 0.6);
  addRoute((lc) => urls.docsApi(lc), 0.5);
  addRoute((lc) => urls.changelog(lc), 0.4);
  addRoute((lc) => urls.security(lc), 0.4);
  addRoute((lc) => urls.stats(lc), 0.6);
  addRoute((lc) => urls.timeline(lc), 0.6);
  addRoute((lc) => urls.alerts(lc), 0.5);
  addRoute((lc) => urls.press(lc), 0.4);
  addRoute((lc) => urls.status(lc), 0.3);
  addRoute((lc) => urls.compare(lc), 0.5);
  addRoute((lc) => urls.faq(lc), 0.6);
  addRoute((lc) => urls.partners(lc), 0.4);
  addRoute((lc) => urls.careers(lc), 0.5);
  addRoute((lc) => urls.docsSdks(lc), 0.5);
  addRoute((lc) => urls.docsGettingStarted(lc), 0.6);
  addRoute((lc) => urls.docsConcepts(lc), 0.5);
  addRoute((lc) => urls.docsRateLimits(lc), 0.4);
  addRoute((lc) => urls.docsApiExplorer(lc), 0.5);
  addRoute((lc) => urls.docsWebhooks(lc), 0.4);
  addRoute((lc) => urls.docsErrors(lc), 0.4);
  addRoute((lc) => localePath(lc, "/docs/schema"), 0.6);
  addRoute((lc) => localePath(lc, "/docs/confidence"), 0.6);
  addRoute((lc) => localePath(lc, "/docs/osint-guide"), 0.6);
  addRoute((lc) => localePath(lc, "/community"), 0.5);
  addRoute((lc) => localePath(lc, "/legal/aup"), 0.4);
  addRoute((lc) => localePath(lc, "/legal/dpa"), 0.4);
  addRoute((lc) => localePath(lc, "/legal/subprocessors"), 0.3);
  addRoute((lc) => localePath(lc, "/legal/disputed-area"), 0.5);
  addRoute((lc) => localePath(lc, "/legal/methodology"), 0.6);
  addRoute((lc) => localePath(lc, "/vs"), 0.5);
  for (const c of COMPETITORS) {
    addRoute((lc) => localePath(lc, `/vs/${c.slug}`), 0.6);
  }
  addRoute((lc) => localePath(lc, "/datasets"), 0.6);
  for (const d of DATASETS) {
    addRoute((lc) => localePath(lc, `/datasets/${d.slug}`), 0.5);
  }
  addRoute((lc) => urls.team(lc), 0.6);
  for (const m of TEAM_MEMBERS) {
    addRoute((lc) => urls.teamMember(lc, m.slug), 0.5);
  }
  for (const p of BLOG_POSTS) {
    addRoute((lc) => urls.blogPost(lc, p.slug), 0.6);
  }
  addRoute((lc) => urls.trust(lc), 0.6);
  addRoute((lc) => urls.trustDataPolicy(lc), 0.5);
  addRoute((lc) => urls.trustTransparency(lc), 0.5);
  addRoute((lc) => urls.trustCorrections(lc), 0.4);
  addRoute((lc) => urls.investigations(lc), 0.7);
  for (const inv of INVESTIGATIONS) {
    addRoute((lc) => urls.investigation(lc, inv.slug), 0.6);
    if ((inv.citedEventIds?.length ?? 0) > 0) {
      addRoute(() => urls.investigationFeed(inv.slug), 0.3);
      addRoute(() => urls.investigationAtom(inv.slug), 0.3);
      addRoute(() => urls.investigationJson(inv.slug), 0.3);
      for (const lc of ACTIVE_LOCALES) {
        if (lc === "en") continue;
        addRoute(() => urls.investigationFeedLocale(lc, inv.slug), 0.25);
        addRoute(() => urls.investigationAtomLocale(lc, inv.slug), 0.25);
        addRoute(() => urls.investigationJsonLocale(lc, inv.slug), 0.25);
      }
    }
  }
  addRoute((lc) => urls.companiesNearIndex(lc), 0.6);

  // Guides
  addRoute((lc) => urls.guides(lc), 0.7);
  for (const g of GUIDES) {
    addRoute((lc) => urls.guide(lc, g.slug), 0.6);
  }

  // Industries
  addRoute((lc) => urls.industries(lc), 0.7);
  for (const i of listIndustries()) {
    addRoute((lc) => urls.industry(lc, i.slug), 0.55);
  }

  // Tool alternatives — one per tool
  for (const t of TOOLS) {
    addRoute((lc) => urls.alternatives(lc, t.slug), 0.5);
  }

  // Tags
  addRoute((lc) => urls.tags(lc), 0.6);
  for (const t of listTags()) {
    addRoute((lc) => urls.tag(lc, t.slug), 0.45);
  }

  // Threats
  addRoute((lc) => urls.threats(lc), 0.7);
  for (const t of THREATS) {
    addRoute((lc) => urls.threat(lc, t.slug), 0.6);
  }

  // Tool pair comparisons — same-category only, canonical order
  const seenPairs = new Set<string>();
  for (let i = 0; i < TOOLS.length; i++) {
    for (let j = i + 1; j < TOOLS.length; j++) {
      const a = TOOLS[i];
      const b = TOOLS[j];
      if (a.category !== b.category) continue;
      const [first, second] = a.slug < b.slug ? [a, b] : [b, a];
      const key = `${first.slug}-vs-${second.slug}`;
      if (seenPairs.has(key)) continue;
      seenPairs.add(key);
      addRoute((lc) => urls.toolPairCompare(lc, first.slug, second.slug), 0.45);
    }
  }

  // Tool 3-way comparisons — same-category triples, canonical alphabetical order
  const seenTriples = new Set<string>();
  for (let i = 0; i < TOOLS.length; i++) {
    for (let j = i + 1; j < TOOLS.length; j++) {
      for (let k = j + 1; k < TOOLS.length; k++) {
        const a = TOOLS[i];
        const b = TOOLS[j];
        const c = TOOLS[k];
        if (a.category !== b.category || b.category !== c.category) continue;
        const sorted = [a.slug, b.slug, c.slug].sort();
        const key = `${sorted[0]}-vs-${sorted[1]}-vs-${sorted[2]}`;
        if (seenTriples.has(key)) continue;
        seenTriples.add(key);
        addRoute(
          (lc) => urls.toolTripleCompare(lc, sorted[0], sorted[1], sorted[2]),
          0.4,
        );
      }
    }
  }

  // Sanctions × entity (per entity that any list cites)
  {
    const cited = new Set<string>();
    for (const l of SANCTIONS_LISTS) {
      for (const s of l.relatedEntitySlugs ?? []) cited.add(s);
    }
    for (const s of cited) {
      addRoute((lc) => urls.sanctionsEntity(lc, s), 0.5);
    }
  }

  // Top tools per industry (only industries that have tools)
  for (const ind of listIndustries()) {
    if (ind.tools.length === 0) continue;
    addRoute((lc) => urls.topToolsForIndustry(lc, ind.slug), 0.55);
  }

  // X-for-Y cross-pivots: 5 lenses × every industry
  for (const ind of listIndustries()) {
    addRoute((lc) => urls.aiFor(lc, ind.slug), 0.55);
    addRoute((lc) => urls.osintFor(lc, ind.slug), 0.55);
    addRoute((lc) => urls.cybersecurityFor(lc, ind.slug), 0.55);
    addRoute((lc) => urls.intelligenceFor(lc, ind.slug), 0.55);
    addRoute((lc) => urls.monitoringFor(lc, ind.slug), 0.5);
  }

  // Best tools for audience
  for (const a of AUDIENCES) {
    addRoute((lc) => urls.bestToolsForAudience(lc, a.slug), 0.55);
  }

  // Academy
  addRoute((lc) => urls.academy(lc), 0.7);
  for (const p of ACADEMY_PATHS) {
    addRoute((lc) => urls.academyPath(lc, p.slug), 0.6);
  }

  // Use-case task pages
  for (const task of USE_CASE_TASKS) {
    addRoute((lc) => urls.useCaseTask(lc, task.vertical, task.slug), 0.6);
  }

  // Entity detail pages (knowledge graph)
  for (const e of ENTITIES) {
    addRoute((lc) => urls.entity(lc, e.slug), 0.55);
  }

  // Companies × region intersect — derive the set of region slugs from COMPANIES.
  {
    const seenRegions = new Set<string>();
    for (const c of COMPANIES) {
      const s = c.region
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (!s || s === "-" || seenRegions.has(s)) continue;
      seenRegions.add(s);
      addRoute((lc) => urls.companiesByRegion(lc, s), 0.5);
    }
  }

  // Companies × city — one per distinct HQ city
  for (const s of listCompanyCitySlugs()) {
    addRoute((lc) => urls.companiesByCity(lc, s), 0.5);
    addRoute((lc) => urls.companiesNear(lc, s), 0.5);
  }

  // Industries × city intersect — only pairs that actually have a company.
  for (const pair of listIndustryCityPairs()) {
    addRoute(
      (lc) => urls.industryCity(lc, pair.industrySlug, pair.citySlug),
      0.5,
    );
  }

  // Score explainers
  for (const m of SCORE_METRICS) {
    addRoute((lc) => urls.scoring(lc, m.slug), 0.5);
  }

  // Cookbook (API recipes)
  addRoute((lc) => urls.cookbook(lc), 0.6);
  for (const r of RECIPES) {
    addRoute((lc) => urls.cookbookRecipe(lc, r.slug), 0.55);
  }

  // Integrations directory
  addRoute((lc) => urls.integrations(lc), 0.6);
  for (const i of INTEGRATIONS) {
    addRoute((lc) => urls.integration(lc, i.slug), 0.5);
  }

  // Trend detail pages
  for (const t of TRENDS) {
    addRoute((lc) => urls.trend(lc, t.slug), 0.6);
  }

  // Sanctions reference
  addRoute((lc) => urls.sanctions(lc), 0.6);
  for (const s of SANCTIONS_LISTS) {
    addRoute((lc) => urls.sanctionsList(lc, s.slug), 0.55);
  }

  // Country content hubs (distinct from /regions operational layer)
  addRoute((lc) => urls.countries(lc), 0.7);
  for (const r of listRegions()) {
    addRoute((lc) => urls.country(lc, r.iso2), 0.7);
    addRoute((lc) => urls.countryFeed(lc, r.iso2), 0.4);
  }

  // Media + per-tag RSS feeds
  addRoute(() => urls.investigationsFeed(), 0.4);
  addRoute(() => urls.reportsFeed(), 0.4);
  for (const t of listTags()) {
    addRoute(() => urls.tagFeed(t.slug), 0.35);
  }

  // News archive (year + year/month)
  addRoute((lc) => urls.newsArchive(lc), 0.6);
  for (const y of eventYears()) {
    addRoute((lc) => urls.newsArchiveYear(lc, y), 0.55);
    addRoute((lc) => urls.bestOfYear(lc, y), 0.65);
  }
  for (const ym of eventYearMonths()) {
    addRoute(
      (lc) => urls.newsArchiveMonth(lc, ym.year, ym.month),
      0.5,
    );
  }
  for (const ymd of eventYearMonthDays()) {
    addRoute(
      (lc) => urls.newsArchiveDay(lc, ymd.year, ymd.month, ymd.day),
      0.45,
    );
  }

  // Regional monthly archive (/archive)
  addRoute((lc) => localePath(lc, "/archive"), 0.5);
  for (const y of eventYears()) {
    addRoute((lc) => localePath(lc, `/archive/${y}`), 0.5);
  }
  const MIN_ARCHIVE_EVENTS = 3;
  const archiveOblasts = listOblasts("ua");
  for (const ym of eventYearMonths()) {
    const globalEvents = eventsInMonth(ym.year, ym.month);
    if (globalEvents.length < MIN_ARCHIVE_EVENTS) continue;
    addRoute(
      (lc) => localePath(lc, `/archive/${ym.year}/${monthSlug(ym.month)}`),
      0.5,
    );
    for (const o of archiveOblasts) {
      const regionCount = eventsInBbox(o.bbox).filter((e) => {
        const d = new Date(e.occurredAt);
        return d.getUTCFullYear() === ym.year && d.getUTCMonth() + 1 === ym.month;
      }).length;
      if (regionCount < MIN_ARCHIVE_EVENTS) continue;
      addRoute(
        (lc) => localePath(lc, `/archive/${ym.year}/${monthSlug(ym.month)}/${o.slug}`),
        0.45,
      );
    }
  }

  // Methodology subpages
  for (const t of METHODOLOGY_TOPICS) {
    addRoute((lc) => urls.methodologyTopic(lc, t.slug), 0.55);
  }

  // Cross-cut: topic × country (only emits pairs with ≥1 event)
  for (const cls of ALL_CLASSES) {
    for (const r of listRegions()) {
      const has = eventsInCountry(r.iso2).some((e) => e.class === cls.id);
      if (!has) continue;
      addRoute((lc) => urls.topicCountry(lc, cls.id, r.iso2), 0.5);
    }
  }

  // Cross-cut: topic × year (only emits pairs with ≥1 event)
  {
    const yearsByClass = new Map<string, Set<number>>();
    for (const e of listEvents()) {
      const y = new Date(e.occurredAt).getUTCFullYear();
      if (!yearsByClass.has(e.class)) yearsByClass.set(e.class, new Set());
      yearsByClass.get(e.class)!.add(y);
    }
    for (const cls of ALL_CLASSES) {
      const set = yearsByClass.get(cls.id);
      if (!set) continue;
      for (const y of set) {
        addRoute((lc) => urls.topicYear(lc, cls.id, y), 0.5);
      }
    }
  }

  // Cross-cut: threat × country (uses each threat's stated affectedRegions)
  for (const t of THREATS) {
    for (const iso2 of t.affectedRegions) {
      if (!listRegions().some((r) => r.iso2 === iso2)) continue;
      addRoute((lc) => urls.threatCountry(lc, t.slug, iso2), 0.55);
    }
  }

  // Cross-cut: equipment × operator (derived from EQUIPMENT.origin)
  for (const pair of listEquipmentOperatorPairs()) {
    addRoute(
      (lc) => urls.equipmentOperator(lc, pair.equipmentSlug, pair.operatorSlug),
      0.45,
    );
  }

  // Cross-cut: source × country (only for sources whose country has a region brief)
  for (const s of PUBLIC_SOURCES) {
    const iso2 = s.country.toLowerCase();
    if (!listRegions().some((r) => r.iso2 === iso2)) continue;
    addRoute((lc) => urls.sourceCountry(lc, s.slug, iso2), 0.5);
  }

  // 3D cross-cut: use-case task × country
  for (const t of USE_CASE_TASKS) {
    for (const r of listRegions()) {
      addRoute(
        (lc) => urls.useCaseTaskCountry(lc, t.vertical, t.slug, r.iso2),
        0.5,
      );
    }
  }

  // Scoring index
  addRoute((lc) => urls.scoringIndex(lc), 0.55);

  // Case studies
  addRoute((lc) => urls.caseStudies(lc), 0.65);
  for (const c of CASE_STUDIES) {
    addRoute((lc) => urls.caseStudy(lc, c.slug), 0.6);
  }

  // Podcast
  addRoute((lc) => urls.podcast(lc), 0.6);
  for (const e of PODCAST_EPISODES) {
    addRoute((lc) => urls.podcastEpisode(lc, e.slug), 0.55);
  }

  // Videos
  addRoute((lc) => urls.videos(lc), 0.6);
  for (const v of VIDEOS) {
    addRoute((lc) => urls.video(lc, v.slug), 0.55);
  }
  // Per-category video index
  {
    const cats = new Set(VIDEOS.map((v) => v.category));
    for (const cat of cats) {
      addRoute((lc) => urls.videosByCategory(lc, cat), 0.5);
    }
  }

  // Event sub-pages (4 facets × every event)
  for (const e of listEvents()) {
    addRoute((lc) => urls.eventTimeline(lc, e.eventId), 0.45);
    addRoute((lc) => urls.eventSources(lc, e.eventId), 0.45);
    addRoute((lc) => urls.eventMedia(lc, e.eventId), 0.4);
    addRoute((lc) => urls.eventRelated(lc, e.eventId), 0.45);
  }

  // Partner programmatic pages
  for (const p of PARTNERS) {
    addRoute((lc) => urls.partner(lc, p.slug), 0.5);
  }

  // Academy lesson deep links
  for (const p of ACADEMY_PATHS) {
    for (const l of p.lessons) {
      addRoute((lc) => urls.academyLesson(lc, p.slug, l.slug), 0.5);
    }
  }
  addRoute((lc) => urls.datasets(lc), 0.7);
  addRoute((lc) => urls.trends(lc), 0.6);
  addRoute((lc) => urls.useCases(lc), 0.7);
  for (const slug of ["defense", "journalism", "humanitarian", "financial", "analysts", "security", "civilians"]) {
    addRoute((lc) => urls.useCase(lc, slug), 0.6);
  }
  addRoute((lc) => urls.classifier(lc), 0.4);
  addRoute((lc) => urls.help(lc), 0.6);
  addRoute((lc) => urls.contact(lc), 0.5);

  // Programmatic — public sources
  for (const s of PUBLIC_SOURCES) {
    addRoute((lc) => urls.source(lc, s.slug), 0.5);
  }

  // Programmatic — reports
  for (const r of REPORTS) {
    addRoute((lc) => urls.report(lc, r.slug), 0.55);
  }

  // Google News sitemap
  entries.push({
    url: "https://aegislens.io/news/sitemap.xml",
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.9,
  });

  // Blog RSS feed
  addRoute(() => "/blog/feed.xml", 0.4);

  // Trends RSS feed
  addRoute(() => "/trends/feed.xml", 0.4);

  // Datasets RSS feed
  addRoute(() => "/datasets/feed.xml", 0.4);

  // RSS feeds — per-locale + per-topic-class
  addRoute((lc) => urls.newsFeed(lc), 0.4);
  addRoute(() => urls.newsAtom(), 0.4);
  addRoute(() => urls.newsJson(), 0.4);
  for (const lc of ACTIVE_LOCALES) {
    if (lc === "en") continue;
    addRoute(() => urls.newsJsonLocale(lc), 0.35);
  }
  for (const cls of ALL_CLASSES) {
    addRoute((lc) => urls.topicFeed(lc, cls.id), 0.3);
    addRoute(() => urls.topicJson(cls.id), 0.3);
    addRoute(() => urls.topicAtom(cls.id), 0.3);
    for (const lc of ACTIVE_LOCALES) {
      if (lc === "en") continue;
      addRoute(() => urls.topicAtomLocale(lc, cls.id), 0.25);
      addRoute(() => urls.topicJsonLocale(lc, cls.id), 0.25);
    }
  }
  for (const ent of ENTITIES) {
    if ((ent.relatedEventIds?.length ?? 0) + (ent.relatedInvestigationSlugs?.length ?? 0) > 0) {
      addRoute(() => urls.entityFeed(ent.slug), 0.3);
      addRoute(() => urls.entityAtom(ent.slug), 0.3);
      addRoute(() => urls.entityJson(ent.slug), 0.3);
      // Per-locale variants — EN canonical is already covered above.
      for (const lc of ACTIVE_LOCALES) {
        if (lc === "en") continue;
        addRoute(() => urls.entityFeedLocale(lc, ent.slug), 0.25);
        addRoute(() => urls.entityAtomLocale(lc, ent.slug), 0.25);
        addRoute(() => urls.entityJsonLocale(lc, ent.slug), 0.25);
      }
    }
  }

  // Programmatic — topic hubs (per event class)
  for (const cls of ["military_action","infrastructure","civilian_alert","humanitarian","cyber","maritime","aviation","environmental","political","economic"]) {
    addRoute((lc) => urls.topic(lc, cls), 0.5);
  }

  // Programmatic — regions
  for (const region of listRegions()) {
    addRoute((lc) => urls.region(lc, region.iso2), 0.6);
  }

  // Programmatic — admin-1 (UA oblasts, PL voivodeships, DE Bundesländer)
  for (const country of ["ua", "pl", "de"]) {
    for (const o of listOblasts(country)) {
      addRoute(
        (lc) =>
          lc === "en"
            ? `/regions/${country}/${o.slug}`
            : `/${lc}/regions/${country}/${o.slug}`,
        0.55,
      );
      // Per-oblast RSS + Atom + JSON Feed
      addRoute((lc) => urls.oblastFeed(lc, country, o.slug), 0.35);
      addRoute(() => urls.oblastAtom(country, o.slug), 0.3);
      addRoute(() => urls.oblastJson(country, o.slug), 0.3);
      for (const lc of ACTIVE_LOCALES) {
        if (lc === "en") continue;
        addRoute(() => urls.oblastAtomLocale(lc, country, o.slug), 0.25);
        addRoute(() => urls.oblastJsonLocale(lc, country, o.slug), 0.25);
      }
    }
  }

  // Programmatic — admin-2 (cities)
  for (const c of CITIES) {
    addRoute(
      (lc) =>
        lc === "en"
          ? `/regions/${c.iso2}/${c.oblastSlug}/${c.slug}`
          : `/${lc}/regions/${c.iso2}/${c.oblastSlug}/${c.slug}`,
      0.5,
    );
  }

  // Programmatic — equipment
  for (const eq of EQUIPMENT) {
    addRoute((lc) => urls.equipment(lc, eq.slug), 0.5);
  }

  // Programmatic — conflicts
  for (const c of CONFLICTS) {
    addRoute((lc) => urls.conflict(lc, c.slug), 0.6);
  }

  // Programmatic — glossary terms
  for (const g of GLOSSARY) {
    addRoute((lc) => urls.glossary(lc, g.slug), 0.4);
  }

  // Directory — companies
  for (const c of COMPANIES) {
    addRoute((lc) => urls.companyDetail(lc, c.slug), 0.4);
  }

  // Directory — tools
  for (const t of TOOLS) {
    addRoute((lc) => urls.toolDetail(lc, t.slug), 0.4);
  }

  // Events — every seed event has its own permalink
  for (const e of listEvents()) {
    addRoute((lc) => urls.event(lc, e.eventId), 0.5);
  }

  return entries;
}
