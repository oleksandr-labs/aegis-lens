# TODO — Schema.org Library (Master List)

## Per-template schemas
- Org-wide: `Organization`, `WebSite`, `SearchAction`
- Pages: `WebPage`, `BreadcrumbList`, `FAQPage`, `Article`
- News: `NewsArticle` + author markup
- How-to / guide: `HowTo`
- Event pages: `Event` (where lawful), `Place`
- Equipment: `Product` (informational use)
- People: `Person` (public figures only)
- Datasets: `Dataset`
- Glossary: `DefinedTerm`, `DefinedTermSet`
- Courses: `Course`, `LearningResource`
- Videos / podcasts: `VideoObject`, `PodcastSeries`, `PodcastEpisode`
- Reviews: `Review`, `AggregateRating`
- Listings: `ItemList`, `SoftwareApplication` (tools), `Service`
- Books: `Book`
- Jobs: `JobPosting`
- Conferences / webinars: `Event`

## Progress
- 3 / 3 done

## Tasks
- [x] Per-template generator in code ✓ Sprint 0
- [x] CI test: Rich Results Tester per template — apps/web/src/lib/seo/schema/schema.test.ts (vitest; validates every generator's output against required-props contract, structural/no-network); contract in apps/web/src/lib/seo/schema/required-props.ts; generators in apps/web/src/lib/seo/schema/generators.ts (extends Sprint-0 organizationJsonLd/websiteJsonLd)
- [x] Quarterly schema audit — apps/web/src/lib/seo/schema/audit.ts (TEMPLATE_SCHEMA_SPECS enumeration → buildChecklist required-props checklist + runAudit report model with quarterly staleAfterDays=92 threshold; network-free, accepts pre-fetched docs)
