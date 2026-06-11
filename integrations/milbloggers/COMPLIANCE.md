# Compliance & Editorial Methodology — `@ua-map/milbloggers`

This package powers a **curated milblogger / OSINT allow-list** for Aegis Lens.
This document is the basis of the **public methodology page**.

## 1. Editorial, not algorithmic

The allow-list is **editorially curated**. Accounts are admitted by a human
editor through the vetting gate (`src/vetting.ts`), never auto-discovered or
auto-added by a ranking algorithm. **Quality over quantity.**

## 2. Vetting standard (admission criteria)

An account is admitted ONLY if it clears `src/vetting.ts`:

- **Documented track record** — a substantive, publicly verifiable history.
- **No anonymous accounts without a track record.** Anonymous accounts must
  clear a substantially higher reputation bar; pseudonymous accounts with no
  established record are rejected.
- **Editor sign-off** (`vettedBy` + `vettedAt`) is mandatory and logged.
- **Specialty tags** assigned so corroboration routing is meaningful.

## 3. Side-labelling — NO false equivalence

`side` (`ua` | `ru` | `int`) is a **structural, mandatory** field. It is never
dropped, normalized, or inferred per-post (`src/side-label.ts` enforces this with
a hard invariant that throws on violation).

- **UA-side** — Ukrainian official, war correspondents, OSINT analysts.
- **INT** — international OSINT organizations with verifiable identity
  (e.g. Bellingcat, ConflictNews, GeoConfirmed).
- **RU-side — opposite-narrative tracking ONLY.** Russian-side accounts are
  admitted *solely* so editors and users can see how the opposing side frames
  the same event. They:
  - carry a **mandatory `oppositionLabel`** surfaced in every rendering;
  - are **never** treated as neutral, verified, or trustworthy reporting;
  - are **never** used to corroborate UA/INT claims (`mayCorroborate` forbids
    cross-side corroboration);
  - have their confidence **capped low** on the canonical event surface
    (`src/adapter.ts`) and are kept internal (`isPublic: false`) by default.

There is **no false equivalence**: the two sides may *contrast* (narrative
comparison) but never *confirm* each other. The comparison view
(`src/narrative-compare.ts`) always renders a disclaimer stating the columns are
**not** equally credible.

## 4. Ingest & ToS discipline

- **Public surfaces only.** Telegram ingest uses the **Bot API** for public
  channels (see `integrations/telegram/src/bot-api-client.ts`); X ingest uses the
  official API. No user-account scraping, no private content.
- Secrets are read from `process.env`; none are hardcoded. A deterministic demo
  fetcher (`src/ingest.ts`) lets the pipeline run without credentials.
- Polite rate limits and caching cadence are inherited from the underlying
  platform clients.

## 5. Reputation, misinfo & appeal

- Each account has a per-account reputation seeded from an **editorial prior**
  and updated as posts are verified / disputed / retracted (`src/reputation.ts`).
- Accounts that propagate **confirmed** misinfo (human-reviewed in
  `services/misinfo/`) take a reputation strike (`src/misinfo-flag.ts`). We
  **only** downgrade on confirmed misinfo, never on un-reviewed automated
  suspicion — mirroring the misinfo service's "caveat, never auto-retract" stance.
- Every reputation change is **logged** (transparent and appealable). Accounts
  that fall below the suspension floor are surfaced to editors for review or
  removal — they are not silently deleted.

## 6. Attribution

Every ingested post is preserved with its **source URL** and account citation on
the canonical event (`src/adapter.ts`). Original (untranslated) text is retained;
UK/EN/RU user-facing strings are provided, with native-review debt tracked
per repo policy.

## 7. No new map layer

This cluster adds **no new map layer** — it feeds existing event surfaces and a
dedicated read API (`apps/web/src/app/api/integrations/milbloggers/route.ts`).
See handoff `c:\tmp\sprint259_shared_MILBLOG.txt` (`<none>`).
