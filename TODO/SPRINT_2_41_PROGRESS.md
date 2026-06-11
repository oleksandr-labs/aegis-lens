# Sprint 2.41 — Progress

**Theme:** Acceptable Use Policy, Changelog categories + anchors, About page full content, Trust Center expansions (AI transparency, compliance, security overview), Careers culture + benefits + hiring process.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Legal — Acceptable Use Policy (AUP)
- [x] New page at `/legal/aup` with full policy sections: scope, permitted uses, prohibited uses (targeting, disinformation, technical misuse, legal violations), source protection, AI-generated outputs, enforcement, reporting, and changes.
- [x] Schema.org `WebPage` JSON-LD with `dateModified`.
- [x] Linked from About page (ethics section) and Trust Center.
- [x] Closes legal TODO: Acceptable Use Policy.

### Changelog — category tags, linkable anchors, Sprint 2.40 entry, Schema.org hasPart
- [x] Each bullet now tagged with one of: `Added`, `Changed`, `Fixed`, `Deprecated`, `Security` — color-coded badges.
- [x] Each entry has a `#sprint-X-Y` anchor; permalink icon appears on hover.
- [x] Jump-to-release nav at the top (links to each anchor).
- [x] Sprint 2.40 entry added with 14 categorized bullets.
- [x] Sprint 2.39 entry added with brand-book bullets.
- [x] Schema.org Article JSON-LD updated to include `hasPart` array (one sub-Article per sprint).
- [x] Closes changelog TODOs: per-release categories, linkable anchors, Schema.org Article per entry.

### About page — full content expansion
- [x] Mission section: expanded two-paragraph statement explaining the access-to-intelligence equity argument.
- [x] Vision section: full-paragraph description of the long-term goal.
- [x] "Why this exists" section: explains legacy intel tooling failures and the speed-vs-verification false dichotomy.
- [x] Methodology section: expanded with four key dimensions (sources, verification, AI role, corrections), each with label + description. Link to `/methodology`.
- [x] Ethics section: expanded with AUP cross-link and ethics board mention.
- [x] Team block: three team members with initials avatar, role, and bio. Link to `/careers`.
- [x] Press section: email + link to `/press`.
- [x] Closes about TODO: mission, vision, why, methodology, ethics, team, press — 7 content tasks done.

### Trust Center — AI transparency, compliance badges, security overview
- [x] AUP added to documents grid (8 cards total).
- [x] Compliance badges section: GDPR (active), SOC 2 Type II (in-progress), ISO 27001 (planned), CCPA (active) — with status color coding.
- [x] Security overview section: TLS/HSTS, AES-256 at rest, RBAC + MFA, audit logging, pen test, vulnerability disclosure.
- [x] AI usage transparency table: 5 capabilities (event summarisation, geolocation, translation, search, AI copilot) with model/provider, data processed, and provider retention policy.
- [x] System status section links to `/status`.
- [x] Enterprise procurement contact block at bottom.
- [x] Closes trust center TODOs: compliance badges, security overview, VDP link, AI usage transparency.

### Careers — culture, benefits, hiring process
- [x] Culture & mission section: two-paragraph narrative + four value tiles (Mission, Craft, Ethics, Flexibility).
- [x] Benefits section: 8 items — salary, remote, deep-work culture, hardware, learning budget, health, parental leave, PTO minimum.
- [x] Hiring process transparency: 4-step numbered flow (Application → Async screen → Team calls → Offer).
- [x] Open roles restructured with section anchor `#roles`.
- [x] Apply section kept with email link.
- [x] Closes careers TODOs: team/culture, benefits/comp/remote, hiring process transparency, open roles list.

---

## Files touched

New:
- `apps/web/src/app/[locale]/legal/aup/page.tsx`
- `TODO/SPRINT_2_41_PROGRESS.md`

Edited:
- `apps/web/src/app/[locale]/changelog/page.tsx` — categories, anchors, jump nav, Sprint 2.40+2.39 entries
- `apps/web/src/app/[locale]/about/page.tsx` — full content expansion with mission/vision/why/team/press
- `apps/web/src/app/[locale]/trust/page.tsx` — compliance badges, security overview, AI table, status link
- `apps/web/src/app/[locale]/careers/page.tsx` — culture, benefits, hiring process sections
- `TODO/pages/TODO_legal.md` — AUP closed
- `TODO/pages/TODO_about.md` — 7 content tasks closed
- `TODO/pages/TODO_changelog.md` — 3 tasks closed
- `TODO/pages/TODO_trust_center.md` — 4 tasks closed
- `TODO/pages/TODO_careers.md` — 4 tasks closed

---

## TODO bookkeeping
- `TODO/pages/TODO_legal.md` — Progress: 4→5/12; AUP closed
- `TODO/pages/TODO_about.md` — Progress: 2→9/10; 7 content tasks closed
- `TODO/pages/TODO_changelog.md` — 3 tasks closed (categories, anchors, schema)
- `TODO/pages/TODO_trust_center.md` — Progress: 2→5/11; compliance, security, VDP, AI transparency closed
- `TODO/pages/TODO_careers.md` — Progress: 2→5/9; culture, benefits, hiring process, roles list closed

## Open follow-ups
- [ ] AUP: localize to UK
- [ ] Changelog: tag entries by area (map, AI, sources, API, billing)
- [ ] Changelog: author byline per entry
- [ ] About: Static MDX page (when CMS is ready)
- [ ] Trust: Subprocessor list (live)
- [ ] Trust: DPA + SCC downloads
- [ ] Trust: Penetration test summary (redacted)
- [ ] Trust: Incident history with postmortems
- [ ] Trust: Data residency options
- [ ] Careers: Application form with diversity questionnaire
- [ ] Careers: EU / UA / US legal compliance per jurisdiction
