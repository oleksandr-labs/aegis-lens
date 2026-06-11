# ISW Integration — License, Fair-Use & ToS Compliance

**Package:** `@ua-map/isw`
**Source:** Institute for the Study of War (ISW), with the American Enterprise
Institute's Critical Threats Project (CTP).
**Primary products consumed:**
1. The daily *Russia Offensive Campaign Assessment* (ROCA) — long-form text,
   published on the ISW blog and syndicated via RSS.
2. The ISW/CTP interactive *Control of Terrain* map (assessed-control polygons).

> This file is the binding contract for what the code may do. The TypeScript modules
> in `src/` are gated to stay inside the boundaries described here. **When in doubt,
> attribute and link out rather than republish.**

---

## 1. Copyright & ownership

All ISW analytical text, maps, graphics, and data are **© Institute for the Study of
War** (and, for the control-of-terrain layers, jointly with AEI's Critical Threats
Project). ISW is a 501(c)(3) non-profit. **ISW does not place its work in the public
domain** and does not grant a blanket reuse license.

ISW's stated terms (understandingwar.org "Terms of Use" / reprint guidance, as of this
writing): the work may be **quoted and cited with attribution**; **wholesale
republication or redistribution requires written permission**; commercial reuse and
the creation of derivative datasets are restricted.

**We treat ISW content as: cite + short attributed snippet = allowed; bulk
republication of full text or maps = NOT allowed without a written license.**

---

## 2. What this integration MAY do (and how the code enforces it)

| Action | Allowed? | Enforcement in code |
|---|---|---|
| Fetch the public RSS feed | Yes | `client.ts` — RSS only, identifying User-Agent |
| Store full assessment text **internally** for NLP/diff | Yes (internal) | `adapter.ts` keeps body in `originalText`/`rawPayload`; schema strips `rawPayload` before public API |
| Show **short attributed snippets** (≤ ~240–280 chars) | Yes (fair use) | `mentions.ts` / `widget.ts` clamp length + always attach attribution |
| Show ISW **key takeaways** verbatim in full | **No** | only the *first* takeaway is surfaced as a snippet; full list is internal |
| Republish the **full assessment** | **No** | never emitted to the public API; product links to ISW URL instead |
| Re-host / re-tile the **ISW control map as a standalone layer** | **No** | `map-ingest.ts` ingests polygons for INTERNAL diff/divergence only |
| Overlay assessed-control polygons **with ISW attribution** on our existing control layer | Yes, with attribution | overlay only; not a new standalone product |
| Create/sell a derived "ISW dataset" | **No** | not implemented; would require a written license |

**Attribution string** (always rendered with any ISW-derived snippet or overlay):
`Source: Institute for the Study of War (understandingwar.org)` — see
`mentions.ts:ATTRIBUTION` and `citations.ts` attribution labels.

Every surfaced item also carries the **canonical ISW URL** so users click through to
the original — this is both a courtesy and the safe-harbor behavior for fair use.

---

## 3. Crawler discipline (ToS-respecting fetch)

Encoded in `client.ts`:

- **Public RSS only** (`https://www.understandingwar.org/rss.xml`). No scraping of the
  rendered HTML site, no headless browser, no bypassing of any access control.
- **Polite cadence:** at most one live fetch per `minIntervalMs` (**default 6 hours**).
  The ROCA is published ~once per day, so more-frequent polling is wasteful and could
  look abusive. Cached body is reused inside the interval.
- **Identifying User-Agent** with a contact URL and a statement of purpose
  (`DEFAULT_USER_AGENT`).
- **Fail-soft:** any fetch error falls back to a bundled demo fixture; we never retry
  aggressively in a tight loop.
- **No secrets required** — the feed is public; `process.env.ISW_DISABLE_FETCH=1`
  forces offline/demo mode for CI.
- Honor `robots.txt` for any future endpoint added here. (RSS is explicitly published
  for syndication.)

---

## 4. Control-of-terrain map specifics

- The ISW/CTP control map is **assessed** control — it deliberately distinguishes
  "Russian-occupied" from merely "claimed / reported, not assessed". Our
  `ControlState` model preserves that distinction (`ru_occupied` vs `ru_claimed`) so we
  never upgrade an ISW *claim* into a *confirmed* fact.
- We ingest polygons to compute **differentials** (`map-diff.ts`) and **divergence vs
  DeepStateMAP** (`divergence.ts`). These are *analytical transformations*, not
  republication of the map image/tiles.
- If the map is surfaced visually, it is an **overlay on the platform's existing
  control layer (`troop_movement`)** with ISW attribution — **no new standalone ISW map
  layer is created** (see handoff: `<none>`).
- DeepStateMAP (DSM) data is **NOT** fetched or bundled by this package. DSM has its own
  source/ToS; `divergence.ts` accepts an already-normalized DSM model from a separate
  integration or fixture.

---

## 5. i18n / native-review debt

- **EN is canonical.** ISW publishes in English.
- UK strings are **AI-translated** (`i18n.ts`) and every user-facing UK payload sets
  `translationReview = true` (`UK_NEEDS_NATIVE_REVIEW`). **Republished ISW snippets in
  Ukrainian must be reviewed by a native speaker before the flag is cleared** — this is
  outstanding native-review debt, not a completed deliverable.
- Mistranslating an analytical military claim is a YMYL-adjacent risk; until review,
  UK snippets should be shown alongside the EN original and the ISW link.

---

## 6. Partnership / liaison notes

- No formal partnership or data-sharing agreement with ISW currently exists.
- For anything beyond fair-use citation (bulk text, full map tiles, a derived dataset,
  or commercial redistribution) we **must** obtain written permission via ISW's
  press/permissions contact before enabling it in code.
- Recommended next step if the product wants deeper ISW integration: request a reprint /
  data-use license and record its terms here, then relax the gates above accordingly.

---

## 7. Liability / accuracy disclaimer

ISW assessments are analytical judgments, not ground truth. Where ISW marks a claim
unconfirmed, the product must preserve that uncertainty (we map it to `ru_claimed` /
`contested`). Divergence with DeepStateMAP is surfaced as a *"verify"* signal, not as
either source being authoritatively wrong.
