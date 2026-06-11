# TODO — Entity Relationship Diagram (ERD)

## Goal
Authoritative data model. Every entity, relationship, and constraint documented.

## Progress
- 7 / 14 done

## Core entities
- [x] User, Org, Team, Project, Membership, Role — `docs/architecture/erd.md` (Mermaid ERD: USERS, ORGS, ORG_MEMBERS)
- [x] Event (PostGIS), Source, Media, Entity (KG), Tag — EVENTS + SOURCES + KG_ENTITIES + EVENT_ENTITY_MENTIONS in erd.md
- [ ] Region (admin hierarchy), Conflict, Equipment, Unit
- [x] AOI, Watchlist, Case, Notebook, Dashboard, Widget, Preset — AOIS, CASES, NOTEBOOKS, PRESETS in erd.md
- [x] Alert, AlertRule, Subscription, Notification — ALERTS in erd.md
- [ ] Report, ReportRun, Citation
- [x] Plugin, PluginInstall, ApiKey, Webhook ✓ Sprint 2.2 + WEBHOOK_ENDPOINTS, WEBHOOK_DELIVERIES, API_KEYS in erd.md
- [ ] Listing (directory: company / tool / service), Review, Rating
- [ ] Embedding refs (Qdrant point IDs)
- [x] AuditLog, AccessLog — AUDIT_LOG in erd.md
- [ ] BillingPlan, Invoice, UsageEvent
- [ ] ContentDoc (CMS), Locale
- [x] Tasks: ER diagram exported (dbdiagram.io / Mermaid) — `docs/architecture/erd.md` with Mermaid erDiagram syntax
- [ ] Per-entity owner + freshness review quarterly

## i18n
- Every text field has `locale` variant or sits in localized child table.

### Примітки
The KG entity (`Entity`) is what makes regional / equipment / unit pages defensible.
