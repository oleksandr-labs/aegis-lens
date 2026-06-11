# TODO — Help Center / Knowledge Base

## Goal
Self-service support. Reduce ticket volume, rank for long-tail support queries.

## Progress
- 7 / 11 done

## Tasks
- [x] `/help` knowledge base ✓ Sprint 2.45 — `/help` index + `/help/[slug]` detail pages with `help-kb.ts` data layer
- [x] Search (Algolia DocSearch or self-hosted) ✓ Sprint 2.45 — native GET `?q=` server-side search over title/body/tags/category
- [x] Categorized articles: Getting Started, Map, Filters, Alerts, Cases, API, Billing, Account, Troubleshooting ✓ Sprint 2.45 — 9 categories, 21 total articles (Map × 3, Alerts × 3, Troubleshooting × 3 added this sprint)
- [ ] Inline chatbot (RAG over the help center)
- [x] "Was this helpful?" feedback per article ✓ Sprint 2.52 — feedback section added at bottom of `/help/[slug]` page; "Yes, resolved" mailto CTA + "No, I need more help" link to /contact
- [x] Article schema.org `FAQPage` + `HowTo` markup ✓ Sprint 2.45 — `@graph` with `WebSite` + `FAQPage` (10 Q&A) on help index; `Article` JSON-LD on detail pages
- [ ] Video tutorials embedded
- [x] "Contact support" fallback CTA ✓ Sprint 2.45 — "Can't find what you need? Contact support" link at bottom of index; search no-results links to /contact
- [ ] Article freshness tracking (auto-flag stale articles)
- [ ] Internal links from app surfaces ("?" icons → relevant article)
- [x] Public changelog cross-linked ✓ Sprint 2.52 — "Looking for what changed?" card added below "Can't find what you need?" on the help index, linking to /changelog

## i18n
- EN + UK at launch; expand with locales as the product expands.

### Примітки
Every support ticket should become a KB article candidate.
