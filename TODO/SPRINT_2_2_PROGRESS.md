# Sprint 2.2 — Progress

**Theme:** Account surface, Drizzle schema build-out, content depth, GDPR cookie banner, seed data expansion.

**Date:** 2026-05-24

**Method:** 5 parallel agents.

---

## Delivered

### /account family (cookie-gated, redirects to /login when missing session)
- [x] `lib/account.ts` — `getCurrentUser()` reads `aegis_session` cookie; returns user + apiKeys + usage stub.
- [x] `/account` — profile, plan, upgrade CTA.
- [x] `/account/api-keys` — list with prefix-masking (`ak_live_xxx****`), create form, revoke per-key.
- [x] `/account/usage` — today vs limit progress, 7-day SVG sparkline, per-endpoint table.
- [x] `/api/account/keys` — GET/POST/DELETE handlers, all 401 if not signed in. Accept JSON + FormData (forms post `_method=DELETE`).
- [x] Sidebar layout (Account / API Keys / Usage / Sign out) wraps `/account/*`.
- [x] Middleware: `/account` added to skip list.

### Drizzle schema (`packages/db/src/schema/`)
- [x] `events.ts`, `sources.ts`, `reports.ts`, `subscribers.ts`, `users.ts`, `apiKeys.ts`, `ingestLog.ts` — each with proper indexes, FKs (`api_keys.user_id` → `users.id`), `$inferSelect`/`$inferInsert` exports.
- [x] `legacy.ts` preserves earlier `orgs/memberships/regions/aois/alertRules/eventSources/eventMedia` tables.
- [x] `schema/index.ts` barrel + `drizzle.config.ts` updated to glob `./src/schema/*.ts`.
- [x] `tsc --noEmit` passes clean in `packages/db`.

### Content pages
- [x] `/faq` — 15 Q&As, `<details>/<summary>` collapsibles, schema.org `FAQPage`.
- [x] `/partners` — tiers, directory cards, mailto CTA.
- [x] `/careers` — values + 5 example roles, one `JobPosting` JSON-LD per role.

### Cookie consent
- [x] `CookieConsent.tsx` client component, bottom-fixed, Esc dismissal, `aria-label="Cookie consent"`.
- [x] `lib/consent.ts` — `getConsent()`, `hasAnalyticsConsent()`, `setConsent()`, dispatches `aegis-consent-change` CustomEvent.
- [x] Mounted in root `app/layout.tsx`. SSR-safe (renders nothing until `useEffect` mounts).

### Seed data expansion
- [x] `EQUIPMENT`: 3 → **39 entries** (UAVs, AD, artillery, tanks, ships, missiles).
- [x] `COMPANIES`: 3 → **23 entries** (Anduril, Palantir, Helsing, Bellingcat, Maxar, Planet, Ukroboronprom, Antonov, CrowdStrike, etc).
- [x] `TOOLS`: 3 → **25 entries** (OSM, Sentinel Hub, Maltego, Spiderfoot, TinEye, FlightRadar24, OpenCorporates, etc).

### Plumbing
- [x] `urls.faq`, `urls.partners`, `urls.careers`, `urls.account`, `urls.accountKeys`, `urls.accountUsage` added.
- [x] Sitemap +3 hreflang sets (`/faq`, `/partners`, `/careers`). Account paths intentionally omitted (auth-gated).
- [x] Footer: Resources column gets `FAQ`; Legal column gets `Careers`, `Partners`.

---

## Smoke tests

```
200  /faq
200  /uk/faq
200  /partners
200  /careers
200  /account             (with aegis_session cookie)
200  /account/api-keys    (with aegis_session cookie)
200  /account/usage       (with aegis_session cookie)
307  /account             (no cookie → redirects /login)
200  /sitemap.xml
```

---

## Open follow-ups
- [ ] `/api/account/logout` endpoint (sidebar sign-out form currently posts to a missing route)
- [ ] `/login` and `/signup` actual auth pages (currently only redirect targets exist)
- [ ] First Drizzle migration: `pnpm db:generate && pnpm db:migrate` against the docker-compose Postgres
- [ ] Replace seed imports with DB reads once migrations are applied
- [ ] Analytics consent gating — read `hasAnalyticsConsent()` before mounting any 3p script
