# Compliance & Ethics — `@ua-map/ualosses` (verified casualty tracking)

This integration handles the **most ethically sensitive** data in the platform:
casualties of the war. The governing principle is **dignity over engagement**.
The single most important rule is the **aggregate-only, fail-closed** invariant
(`src/ethics-gate.ts` + `src/aggregate.ts`): the product publishes ONLY
de-identified aggregate figures (counts by region / period / source). Any record
carrying per-person data is **blocked and dropped**, never partially redacted,
never emitted. This document records the sources, terms, and the ethics-review
process that gate every release.

## 1. Sources, terms & attribution

Attribution is **always required** and enforced in code (`src/attribution.ts`
throws if a figure has no registered source). We consume the **aggregate
dimension only** of each source and never scrape per-person memorial records.

### UALosses (https://ualosses.org)
- Public memorial of **verified fallen Ukrainian service members**.
- We cite **aggregate counts by region/period** with attribution. We do **not**
  re-host or republish individual memorial entries; we **link** to the public
  memorial (`src/memorial-link.ts`).
- Framing: respectful; the memorial itself remains the place to honor names.

### Killed in Ukraine (https://killedinukraine.com)
- **Community-verified** casualty documentation.
- Because it is community-maintained, figures carry a **verification caveat**
  (`verification: "community_verified"`) surfaced in the framing/credit line.
- Aggregate figures only; attributed; community caveat shown to users.

### Mediazona / BBC Russian Service casualty database
- Editorial database of **confirmed Russian military deaths**.
- Shown, where applicable, for RU-side context. Aggregate confirmed-death
  figures only, attributed. **Dignity applies to all the dead, regardless of
  side** — the same aggregate-only / no-per-person rules apply.

### Crawler discipline (all sources)
- Descriptive `User-Agent`, ≥1.5 s inter-request delay, **aggregate endpoints
  only** (never per-person listings).
- Base URLs and any optional keys are read from `process.env`
  (`UALOSSES_BASE_URL`, `KIU_BASE_URL`, `MEDIAZONA_BASE_URL`). None are
  hardcoded. The package is fully usable with **demo fixtures** and no network.

## 2. Aggregate-only / no-per-person invariant (HIGHEST PRIORITY — fail-closed)

Enforced in code, not merely documented (tasks 4, 9, 11):

- **What we publish:** AGGREGATE counts only (region / period / source / side).
  Counts of people are **not** personal data.
- **What is forbidden (hard-block → record dropped):** person names, call signs,
  dates of birth/death, photos or any imagery of individuals, unit designations,
  burial places, home towns, exact coordinates, free-text obituaries, and any
  field whose **name** denotes per-person data.
- **Fail-closed:** `gateAggregate()` blocks the **entire record** on any
  per-person signal (`src/ethics-gate.ts`). `toPublicAggregates()`
  (`src/aggregate.ts`) is the single public funnel; it (a) runs the gate, then
  (b) re-projects onto a strict allow-list shape (`PublicAggregate`) that
  **physically cannot hold** per-person fields. There is **no best-effort
  partial pass-through**.
- **Defence in depth:** the API route mirrors the gate independently, so a public
  response is aggregate-only even if the package boundary were bypassed.
- **No imagery / no per-person data without consent (task 11):** consented
  per-person publication is **off by default** and requires BOTH an explicit
  `consented` flag AND a recorded ethics-review decision
  (`AggregateGateOptions.allowConsented`). The public surfaces never set it.
- **Conservative by design:** the gate favors recall — blocking a safe record is
  acceptable; leaking one person is not.

## 3. Take-down on family request (task 12)

- A family member or authorised party may request removal/suppression
  (`src/takedown.ts`, `TakedownRequest`).
- **Default posture is to honor the request.** Scoped requests
  (`memorial_link`, `aggregate_region`) are **accepted automatically**;
  `all_references` is suppressed immediately **and** flagged for a quick human
  review. Suppression directives propagate to the aggregate funnel, the widget,
  and memorial links.
- The requester's **relationship and contact are never published** — they are
  operational metadata only.

## 4. Strict ethics review per release (task 10)

Every release that touches this package MUST complete this checklist before ship:

1. **Aggregate-only proof:** confirm no public surface can emit a per-person
   field. Verify `gateAggregate` / `toPublicAggregates` are the only path to the
   API route, and that the route's mirrored gate is in sync.
2. **Fail-closed test:** feed a fixture containing each forbidden field
   (name, photo, dob/dod, unit, burial place, home town, exact coords) and
   confirm each record is **dropped** (not partially redacted).
3. **Attribution check:** every displayed figure resolves to a registered
   `SourceAttribution`; community sources show the verification caveat.
4. **Framing check:** respectful en + uk framing renders around all figures;
   no language that exploits grief or optimises for engagement.
5. **Take-down check:** the current suppression set is loaded and applied; any
   open family request is honored before publishing.
6. **No new imagery / per-person consent:** confirm `allowConsented` is not
   enabled on any public path.
7. **Sign-off:** an ethics reviewer records approval. No release ships without it.

## 5. What this package deliberately does NOT do

- Does not fetch, store, or expose individual casualty records.
- Does not place individuals on the map (no map layer — aggregate widget only).
- Does not rank, gamify, or "engage" with the dead.
- Does not optimise casualty content for reach. Dignity over engagement.
