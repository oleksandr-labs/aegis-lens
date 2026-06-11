# Oryx Integration — Compliance, License & Attribution

**Source:** Oryx (Oryxspioenkop) — https://www.oryxspioenkop.com
**What it is:** A volunteer-maintained OSINT blog documenting equipment losses in
the Russo-Ukrainian war. Its defining standard is **visual confirmation**: every
catalogued loss is backed by a photo or video. The published count is therefore a
**documented minimum**, never a complete total.

This document is the authoritative record of how Aegis Lens may use Oryx data.
Read it before changing the client, parser, sync cadence, or any surface that
shows Oryx-derived numbers.

---

## 1. License / republication status

- Oryx has **no published machine-readable license or formal API.** Content is
  ordinary copyrighted blog material; the underlying photo/video evidence is
  owned by third parties (the original posters), not by Oryx.
- **Do NOT republish Oryx's full lists or wholesale-mirror the dataset** without
  explicit permission. We ingest the *tallies* (model, side, status, count,
  coarse location, evidence link) to produce our own **derived analytics**
  (aggregates, trends, per-model rollups) — a transformative use — and we link
  back rather than rehost.
- **Evidence media:** never rehost or hotlink the underlying photos/videos as our
  own. We store the **evidence URL** and link out to it; the media remains the
  original rights-holder's. Treat thumbnails as off-site links.
- If a future partnership/permission is obtained, record it here and only then
  relax the republication gate.

## 2. Attribution — REQUIRED everywhere derived

Oryx is unpaid volunteer work; we cite it **generously and consistently**:

- Every API response (`/api/integrations/oryx`) embeds an `attribution` block.
- Every UI surface (equipment "verified losses" widget, equipment-loss map
  layer, loss-trend charts) must render the Oryx credit + homepage link.
- Every export/report including Oryx-derived numbers must carry the footer from
  `attribution.ts → exportAttributionFooter()`.
- Wording is centralised in `src/attribution.ts` — do not hand-roll credits.
- Always include the **visual-verification caveat** ("documented minimum, not a
  total") so readers don't misread counts as exhaustive.

## 3. Crawler / ToS discipline

Oryx is a small volunteer project hosted on a modest platform. Be a good citizen:

- **Fetch at most once per 24h** (`OryxClient.minFetchIntervalMs` default = 24h;
  daily sync cron `0 6 * * *`). Cache aggressively; never poll.
- Always send a **descriptive User-Agent** identifying Aegis Lens + a contact
  (`OryxClient.contact`). No anonymous scraping.
- Respect `robots.txt` and any rate signals; back off on errors.
- **Preferred ingest path is a community Google-Sheets CSV export** (`mode:
  "sheet"`, URL from `process.env.ORYX_SHEET_CSV_URL`) rather than scraping the
  HTML blog. Blog HTML parsing is intentionally **not auto-enabled** in the
  client (`fetchBlogRows` throws) to avoid fragile, impolite scraping.
- No secrets are hardcoded; all source URLs come from `process.env`.
- Default mode is `"demo"` (bundled fixture) so the package is fully usable
  offline and in CI without ever touching the origin.

## 4. Accuracy & interpretation guardrails

- Present Oryx counts as **visually-confirmed minimums**, never as total losses
  or casualty figures. Oryx tracks *equipment*, not personnel.
- Oryx locations are **coarse** ("near X, Y Oblast") and dates reflect when
  evidence surfaced, not necessarily when the loss occurred — surface dates as
  approximate where flagged (`OryxEntry.dateApproximate`).
- Status taxonomy is Oryx's own (destroyed / damaged / abandoned / captured);
  do not silently reclassify.
- Confidence is set high (verified visual standard) but reduced for approximate
  dates in `event-mapping.ts`.

## 5. Partnership / liaison notes

- No formal partnership exists as of this integration. Contact path, if needed,
  is via the Oryx authors' public profiles. Any agreement (republication rights,
  data-sharing) must be recorded here before code relies on it.
- Consider an optional donation/credit line to the Oryx project given reliance on
  their volunteer work.

## 6. Data flow summary

```
Oryx blog / community sheet
   → client.ts (polite daily fetch, demo fallback)
   → parser.ts (raw rows → OryxEntry, evidence URL preserved)
   → sync.ts (daily diff: added / status-changed)
   → kg-mapping.ts   (→ KG equipment Entity + loss rollup, evidence as source)
   → event-mapping.ts(→ canonical AegisEventV1, type "equipment_loss", evidence cited)
   → widget.ts / trends.ts  (product surfaces)
   → attribution.ts (Oryx credit on every derived surface)
   → /api/integrations/oryx (equipment_losses layer + widget + trends)
```
