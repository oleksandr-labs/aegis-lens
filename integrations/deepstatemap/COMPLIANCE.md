# DeepStateMAP — Compliance, License & Partnership

This file is the authoritative record of the legal/ToS posture for the
`@ua-map/deepstatemap` integration. It is also the deliverable for the TODO tasks
**"License check"** and **"Coordinate with DeepState team for partnership"**.

> **Bottom line (conservative default):** DeepStateMAP data is **NOT** public-domain and
> **NOT** openly licensed for republication. Until a written permission/partnership is in
> place, the platform must **gate** any re-serving of DeepState polygons. The republication
> gate (`DEEPSTATE_REPUBLICATION_PERMITTED`, default `false`) enforces this in code — the
> public API route serves only synthetic DEMO polygons while the gate is off.

---

## 1. Source overview

| Field | Value |
|---|---|
| Name | DeepStateMAP |
| Site | https://deepstatemap.live |
| Telegram (commentary) | https://t.me/DeepStateUA |
| Nature | Volunteer-maintained, near-daily frontline map of Ukraine |
| Data shape | GeoJSON FeatureCollection (control polygons + point markers) |
| Update cadence | ~daily |

DeepStateMAP is widely regarded as the most accurate **public** source of Ukrainian
frontline positions. It is **not** an official military source and does not claim to be.

## 2. License / Terms-of-Service check (TODO: "License check")

**Status: republication NOT confirmed — gated OFF by default.**

Findings (to be re-verified against the live site terms before flipping the gate):

- DeepStateMAP publishes the map for public viewing, but there is **no broad open license**
  (no CC-BY / ODbL / public-domain dedication) granting third parties the right to
  **re-host or re-serve** their polygon data.
- The data is the product of substantial volunteer effort and is treated by the project as
  **theirs**; scraping + republication without permission would likely breach their ToS and
  community norms.
- Their site/API endpoints are **not a documented public contract**. Programmatic access
  must therefore be:
  - **rate-limited to a daily cadence** (the client enforces a ≥6h interval; daily in
    practice), with an identifying `User-Agent` and contact;
  - **preferentially read from a community GitHub mirror** (`mirror.ts`) of daily snapshots,
    to shift load off the volunteer-run service;
  - **never** scraped via a Telegram userbot — commentary is read via the **Bot API only**,
    public channel only (`telegram-context.ts`).

**Attribution (required regardless of republication):** every surface that displays
DeepState-derived data MUST show a prominent credit with a link back to
`deepstatemap.live`. This is implemented in `attribution.ts` (`buildAttribution`,
`attributionLine`) and surfaced by the API route's `meta.attribution`.

### Republication gate

```
DEEPSTATE_REPUBLICATION_PERMITTED=false   # default — DEMO polygons only, no live re-serving
DEEPSTATE_REPUBLICATION_PERMITTED=true    # set ONLY after written permission (see §3)
```

When the gate is `false`:
- `/api/integrations/deepstatemap` returns synthetic DEMO polygons and sets `isDemo: true`.
- The client/mirror may still be used **internally** (e.g. cross-referencing, analysis) but
  the resulting polygons must not be exposed to the public layer.

When the gate is `true` (after permission):
- Live polygons from `mirror.ts` / `client.ts` may be served on the `frontline_control` layer.
- Attribution remains mandatory and must stay prominent.

## 3. Partnership / formal feed (TODO: "Coordinate with DeepState team")

**Status: outreach drafted — not yet sent / no agreement in place.**

We should pursue a **partnership**, not a scrape. Goals, in priority order:

1. **Written permission** to display DeepState frontline polygons on Aegis Lens with
   prominent attribution.
2. A **stable, sanctioned feed** (their preferred endpoint or a blessed mirror) and an
   agreed polite cadence, so we never hammer their infrastructure.
3. Optional: **two-way value** — cross-referencing Aegis Lens corroboration back to
   DeepState, co-branding, or a donation/support arrangement.

### Outreach brief (to send)

- **Channel:** Telegram (@DeepStateUA) and/or the contact on deepstatemap.live; introduce
  Aegis Lens (OSINT situational-awareness platform), state intended use, and link this repo.
- **Ask:** (a) permission to display their frontline data with attribution; (b) preferred
  technical access (sanctioned endpoint or mirror) + acceptable cadence; (c) the exact
  attribution wording they want.
- **Offer:** prominent, persistent credit + backlink; rate-limited daily pulls only;
  willingness to switch to any feed they prefer; support/donation if welcomed.
- **Commitments we make up front:** no userbot scraping; daily cadence; honest
  "not an official military source" labelling; we apply a disputed-area display policy so
  their data is never used to overclaim sovereignty (see `disputed-policy.ts`).

### Liaison checklist

- [ ] Send outreach message (above).
- [ ] Record permission/agreement terms here, with date + the exact attribution string.
- [ ] If granted: set `DEEPSTATE_REPUBLICATION_PERMITTED=true`, switch to the sanctioned
      feed, confirm attribution wording matches their request.
- [ ] If declined: keep the gate OFF; use DeepState only for internal cross-reference, never
      public re-serving.

## 4. Crawler / fetch discipline (enforced in code)

- `client.ts`: identifying `User-Agent` with contact; ≥6h (daily) min interval; 15s timeout;
  no secrets hardcoded (all from `process.env`); demo fallback when unconfigured.
- `mirror.ts`: prefers a static GitHub mirror over DeepState's own API; one fetch/day.
- `telegram-context.ts`: Bot API only, public channel only; no MTProto userbot.
- API route: 6h cache, rate-limited, attribution always present, `isDemo` flag while gated.

## 5. Display honesty (disputed areas)

Per `disputed-policy.ts`:
- `controlled` is labelled **"occupied (per DeepStateMAP)"** — occupation ≠ recognized
  sovereignty; never "annexed"/"Russian territory".
- `contested` is hatched, low-opacity, and **never** coloured as either side's control.
- `liberated` is labelled "recently liberated" with a fluid-situation caveat.
- Low-confidence polygons get reduced opacity + dashed treatment.
