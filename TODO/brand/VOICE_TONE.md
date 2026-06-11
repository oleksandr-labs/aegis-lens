# Aegis Lens — Voice & Tone Guide v1.0

**Status:** v1.0 — Sprint 2.39 (2026-05-24). Owner: Editorial lead.
**Pair with:** `BRAND_BOOK.md` § 8 (summary), `crisis_comms/TODO_customer_comm_style.md` (crisis), `i18n/` (localization).
**Applies to:** every user-facing string — product UI, marketing pages, docs, briefs, AI-generated outputs, support replies, social posts, email, push notifications.

---

## 1. Voice — what we always sound like

We are an intelligence service that ships software. The voice is:

| Trait | What it means | Do | Don't |
| --- | --- | --- | --- |
| **Precise** | Words carry their full meaning. Numbers carry units and sources. | `12 verified strikes in last 24h (source: Genstaff)` | `lots of activity overnight` |
| **Calm** | Steady under load. The pulse never changes. | `Strike reported in Odesa. Verification in progress.` | `BREAKING: massive attack on Odesa!!` |
| **Sourced** | Every claim points at evidence. | `Confirmed by 3 independent sources.` | `Sources say…` |
| **Plainspoken** | Short words beat long ones. Active voice. Present tense for events. | `Power restored in Kharkiv.` | `Electrical service has been re-established in the Kharkiv area.` |
| **Modest about uncertainty** | We hedge honestly, not weaselly. | `Reported. Unverified. Likely (60–70%).` | `It appears that perhaps something may have…` |
| **Neutral** | We name what happened. We do not editorialize on motives unless an analyst byline owns it. | `Russian forces struck the substation.` | `Russian forces brutally attacked the innocent substation.` |

**Voice does not bend by surface.** Marketing, docs, push notifications, and AI outputs all speak with the same six traits. Only **tone** bends.

---

## 2. Tone — what shifts by situation

Voice is constant. Tone modulates along three axes: **urgency**, **formality**, **density**.

### Tone matrix

| Mode | Trigger | Urgency | Formality | Density | Example |
| --- | --- | --- | --- | --- | --- |
| **Informational** | Default. Briefs, docs, marketing, AI output. | low | medium | medium | `Drone activity detected near Odesa port. Last 6h: 4 events.` |
| **Crisis** | Public-safety event, active incident. | high | medium | high | `Air alert — Odesa oblast. Take shelter. Source: alerts.in.ua, 14:32 UTC.` |
| **Educational** | Academy, glossary, methodology, onboarding. | low | medium | low | `Geolocation is the process of pinning a piece of media to a precise place on Earth. Here is how analysts do it.` |
| **Promotional** | Pricing, landing, sales collateral. | low | low–medium | medium | `From signal to verified intelligence in under 90 seconds.` |
| **Status / outage** | Status page, incident postmortem. | medium | medium | high | `Ingest is degraded for Telegram sources. Started 12:08 UTC. We are investigating.` |
| **Apology / correction** | Retraction, public mistake. | medium | medium | high | `We published an event that we have since retracted. Here is what happened and what we are changing.` |

### Audience-specific modulations

The matrix above is global. Within each mode we soften or sharpen per audience.

| Audience | Adjustment |
| --- | --- |
| **Civilians** | Plainer vocabulary. Define jargon on first use. Lead with what to do. |
| **Journalists** | Cite sources inline by name. Provide pull-quotable lines. Provide receipts (links, IDs). |
| **OSINT analysts** | Skip explanation of basic terms. Lead with confidence + source. Expose IDs and timestamps. |
| **NGOs / humanitarian** | Center civilians. Avoid weaponry triumphalism. Be specific about impact. |
| **Governments / defense** | Restrained, factual, no marketing flourishes. No emoji. ISO timestamps. |
| **Traders / finance** | Concise top-line. Quantify impact. Surface confidence number. |

---

## 3. House rules

1. **Active voice. Present tense for events.** Past tense for confirmed history. Future tense never (we report; we don't predict in the news voice).
2. **One idea per sentence.** Break it up.
3. **Numbers carry units and sources.** `12 strikes` is not a number — it's `12 strikes in the last 24h, source: Genstaff`.
4. **Hedge honestly with our verification vocabulary** (see § 4).
5. **No exclamation marks** outside of alert headers, and even there only sparingly.
6. **No ALL CAPS** outside `micro` typography tokens (badges, tags).
7. **Time** is ISO-8601 + UTC in product UI (`2026-05-24 14:32 UTC`); locale-formatted in marketing.
8. **Place names** use the form preferred by the country itself (Kyiv, not Kiev; Odesa, not Odessa). Locale layer handles transliteration.
9. **Belligerents.** Name them. Don't euphemize. `Russian forces`, not `the situation in the east`.
10. **No emoji** in product UI, alerts, reports, docs, or formal email. Sparing use in social copy (`🛰`, `🔴 LIVE`) only when it adds information.
11. **No corporate filler.** Banned: `solutions`, `seamlessly`, `cutting-edge`, `leverage`, `synergy`, `revolutionary`, `disruptive`, `unprecedented`.
12. **No false certainty.** Never `confirmed` without two independent sources.
13. **Don't apologize for the product.** Apologize for our mistakes; explain the product's limits factually.

---

## 4. Word bank

### Preferred (use these)

| Use | Instead of |
| --- | --- |
| `reported` | alleged, claimed-by-unnamed-sources |
| `verified` | confirmed (use `verified` when we ran our pipeline; `confirmed` when authorities confirmed) |
| `disputed` | controversial, debated |
| `unconfirmed` | rumored, hearsay |
| `retracted` | corrected (use `corrected` for edits; `retracted` for full pull) |
| `attack` | incident, kinetic event |
| `strike` | hit, attack (use `strike` for discrete munition events) |
| `outage` | downtime, blackout (use `blackout` only for confirmed grid-level events) |
| `civilians` | non-combatants, ordinary people |
| `casualties` | losses (we don't dehumanize) |
| `source` | provider, feed (in user copy) |
| `analyst` | researcher (in product copy) |
| `Russian forces` | the enemy, the occupiers (we do not adopt either side's framing) |
| `Ukrainian forces` | our forces, the defenders |
| `Kyiv` | Kiev |
| `Odesa` | Odessa |
| `oblast` | region (when speaking to UA audience or in UA-context); `region` is fine for global) |

### Verification vocabulary (load-bearing — never substitute)

| Term | Meaning in our system |
| --- | --- |
| `reported` | At least one source reported it. No verification yet. |
| `pending` | In the verification queue. |
| `verified` | Passed our verification pipeline (2+ independent sources or 1 authoritative + corroboration). |
| `confirmed` | Officially confirmed by a relevant authority (e.g., Genstaff, OVA, ДСНС). |
| `disputed` | Multiple credible sources disagree. |
| `retracted` | We published it, then withdrew it. Always paired with a public correction. |
| `unconfirmed` | We surfaced it but were unable to verify within our SLO. |
| `likely (X%)` | Quantified probability from our model. Always carries a percentage band. |

### Banned (do not use, even in marketing)

- `allegedly` — legalistic, vague, weaselly. Use `reported` or `claimed by <named source>`.
- `the situation` — abdicates specificity.
- `experts say` — name the expert or cut the sentence.
- `tragic`, `horrific`, `devastating` — let the facts carry weight; we describe, we don't perform.
- `terrorist` / `terrorism` — used only when quoting a named authority that has officially designated it as such.
- `russian-occupied territory` lowercase 'r' — we keep proper capitalization, never adopt politicized stylization.
- `our team` in product/marketing copy — we are a product; we don't address the user as part of a "we and them."
- `please` in error messages — `Try again.` not `Please try again.`
- `oops` / `whoops` — we do not chirp at users mid-failure.

### AI copilot specifics

- Always prefix uncertain output with `Likely:` or `Unverified:`.
- Never claim sources it didn't ground on. Cite the document ID inline.
- When refusing, give the reason in one sentence. Never apologize for being an AI.

---

## 5. Examples — same fact, different modes

**Fact:** Three drones struck infrastructure in Odesa oblast at 02:14 local, sourced from Genstaff and two OVA Telegram channels, no casualties yet reported.

| Mode | Render |
| --- | --- |
| Informational | `Three drones struck infrastructure in Odesa oblast at 02:14 local. No casualties reported. Sources: Genstaff + 2 OVA channels.` |
| Crisis (push) | `Odesa oblast — 3 drone strikes on infrastructure, 02:14 local. No casualties reported. Source: Genstaff.` |
| Educational | `Geolocation case study: at 02:14 local we received reports of drone strikes in Odesa oblast. Here's how we verified them in 4 minutes.` |
| Promotional | `Three drone strikes. Verified across three sources. Published in under four minutes. This is what Aegis Lens is for.` |
| Status / outage | n/a |
| Correction | `Earlier we reported four drone strikes in Odesa oblast at 02:14 local. The fourth was a duplicate report. The correct count is three. Updated at 02:31 local.` |

---

## 6. Localization

- **Translate, don't transliterate.** The Ukrainian version of every voice trait should *sound* Ukrainian, not English-translated-to-Ukrainian.
- Each locale appoints a voice owner who maintains the local word bank.
- Verification vocabulary (`reported / verified / confirmed / disputed / retracted`) is locked across locales — each locale has exactly one term per concept.
- Crisis tone is the most sensitive across locales. UK voice in crisis mode is markedly more compressed than EN; do not literal-translate.
- Cultural specifics: `Kyiv` not `Kiev` in EN; `Київ` in UK; do not import RU spellings in any locale.
- See `i18n/TODO_translations_uk.md` for the UK word bank.

---

## 7. Voice review process

- **Pre-publish.** Marketing pages, briefs, press releases pass through a one-paragraph voice review.
- **AI eval.** The copilot ships with an automated voice eval (lint rules): banned-word list, hedge-word usage, exclamation count, ALL-CAPS density, hedging-required surfaces (verification vocab present when verification is claimed). Failing the eval blocks deploy.
- **Quarterly audit.** Editorial lead spot-checks 25 random surfaces per quarter and reports drift.
- **Crisis post-incident.** After every crisis-mode publication, review whether the tone matched the matrix.

---

## 8. Training

- **New writers / contractors:** read this guide + 5 published briefs + 1 published correction before writing.
- **All hires:** voice traits appear in the first-week onboarding (`internal_docs/TODO_new_hire.md`).
- **All AI agents:** the system prompt for the copilot embeds § 1 (voice traits) and § 4 (word bank).
