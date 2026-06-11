# Aegis Lens — Social Media Playbook v1.0

**Status:** v1.0 — Sprint 2.39 (2026-05-24). Owner: Social lead.
**Pair with:** `BRAND_BOOK.md`, `VOICE_TONE.md`, `crisis_comms/TODO_pr_crisis_runbook.md`, `crisis_comms/TODO_misinfo_about_us.md`.

---

## 1. Goal

Consistent authority across X, LinkedIn, Bluesky, Mastodon, Telegram, YouTube. The point of social is **distribution + credibility**, not engagement-chasing. We do not dance, we do not trend-hop, we do not stitch reels.

**Success metrics (not engagement metrics):**
- Citations in tier-1 newsrooms per quarter.
- Subscribers added attributable to social.
- Verified-event reach (impressions of posts that surface verified intel within SLO).
- Time-to-first-corroboration after we post.

---

## 2. Per-platform personas

| Platform | Persona | Primary content | Cadence | Voice mode |
| --- | --- | --- | --- | --- |
| **X** | The breaking-news desk. Fast, sourced, ephemeral. | Verified events, threads on developing stories, source receipts. | 4–12 posts/day depending on signal. | Informational + crisis. |
| **LinkedIn** | The analyst. Slower, deeper, more polished. | Weekly briefs, methodology posts, hiring, partner announcements. | 3–5 posts/week. | Informational + educational. |
| **Bluesky** | The principled twin of X. | Mirror X content for the OSINT/journalism community migrating off X. | Mirror X 1:1 for now; review in Q3. | Informational + crisis. |
| **Mastodon** | The community presence. Federated, low-key, community-replying. | Mirror brief items, engage in OSINT instances. | 1–3 posts/day. | Informational + educational. |
| **Telegram** | The push channel. Subscribers opt in for alerts. | Verified events only. Crisis pushes. Weekly digest. | Event-driven, capped at 30/day. Digest weekly. | Crisis + informational. |
| **YouTube** | The long form. Methodology, case studies, recorded webinars. | 1 video / 2 weeks at launch; weekly later. | 1 / 2 weeks → weekly. | Educational. |

Decentralized hedge: we maintain Bluesky + Mastodon parity so that policy changes on X cannot strand our reach.

---

## 3. Posting cadence

- **Capped, not gamed.** We do not post to hit a quota. If signal is low, we post less.
- Crisis mode (active public-safety event in a covered theater) suspends caps; see § 7.
- LinkedIn limits: never more than 1 post/day. The platform punishes density and so does the audience.
- Time-of-day: schedule informational posts to land at audience-local 09:00 and 18:00. Crisis posts publish immediately, no scheduling.

---

## 4. Asset templates per post type

All assets live in the DAM (`DAM_PLAN.md`). Each post type has a template + variant set:

| Post type | Template | Sizes | Required fields |
| --- | --- | --- | --- |
| **Event card** | `event-card-v1` | 1:1 (X/LI), 9:16 (Stories), 16:9 (YT) | Location, time UTC, source count, verification badge, map snippet |
| **Brief preview** | `brief-card-v1` | 1.91:1 (OG), 1:1 (X/LI) | Title, lede, byline, date, "Read full brief" |
| **Deep dive (carousel)** | `carousel-v1` | 5 slides, 1:1 | Cover, hook, methodology, findings, CTA |
| **Comparison** | `compare-v1` | 1:1 | Two-column layout, source attribution per column |
| **Live thread cover** | `thread-cover-v1` | 16:9 | Theater, status, last updated |
| **Hiring** | `hiring-card-v1` | 1.91:1 | Role, location, link |
| **Partnership** | `partner-card-v1` | 1.91:1 | Co-brand lockup per BRAND_BOOK § 9, joint statement |

All templates are pre-approved by brand. Editing the template requires a brand review.

---

## 5. Scheduling + tooling

- **Primary tool:** Typefully (X-first, supports Bluesky + LinkedIn). Fallback: Buffer.
- **Crisis pushes:** native composer + Telegram bot — never queue a crisis post through a scheduler that might delay it.
- **Approval flow:** drafted in tool → reviewer (social lead or on-call editor) → publish.
- **Two-person rule** for: any post that names a casualty count, any post that names an active belligerent unit, any post that publishes a geolocation we did ourselves.

---

## 6. Response policy

**Engage:**
- Corrections from credible accounts (verify, then post a correction).
- Journalists asking for sourcing — point at our public source profile.
- OSINT community discussing our methodology.

**Ignore:**
- Trolls, bots, replies from accounts with < 30 day age and < 50 followers.
- Bait questions on political alignment.
- "Why didn't you cover X" complaints — link to the methodology page, do not litigate per-event coverage decisions in replies.

**Never:**
- Quote-dunk.
- Argue with belligerents' official accounts.
- Reply with sarcasm. Ever.
- DM journalists unsolicited. They can DM us.

**Mute > block.** Block only for sustained harassment after one mute.

---

## 7. Crisis posting rules

Active crisis = public-safety event in a covered theater (e.g., mass missile attack, large-scale grid outage, suspected NBC event).

- **First post within 5 minutes** of internal verification. Format: location, time UTC, one verified fact, source count, "verifying further."
- **Update at fixed intervals:** every 15 minutes for the first hour, every 30 minutes thereafter.
- **One thread per event.** All updates reply to the original. We do not start parallel threads.
- **Suspend non-crisis content** for the duration. No marketing posts, no hiring posts.
- **Retract within 60 minutes** if verification fails. Pinned correction, original post deleted only after pin + screenshot archived.
- **De-escalate language.** Crisis voice (see VOICE_TONE.md § 2) — compressed, factual, no adjectives.
- See `crisis_comms/TODO_pr_crisis_runbook.md` for cross-channel coordination.

---

## 8. Analytics + tracking

- Per-platform native analytics piped weekly into the social dashboard (PostHog event `social_post_published` with `{platform, post_type, ref_id}`).
- UTM convention: `?utm_source=<platform>&utm_medium=social&utm_campaign=<surface>&utm_content=<post_id>`.
- Track: impressions, profile clicks, link clicks, follower delta, citation lift in our news monitor.
- We do NOT optimize for engagement rate. We report it for context only.
- Citation lift: weekly job scans tier-1 newsroom mentions of "Aegis Lens" and attributes to most recent published post.

---

## 9. Banned topics

We are an intelligence platform. We do not post about:

- Electoral endorsements, in any country.
- Personal opinions of staff on belligerents' political legitimacy.
- Religious commentary.
- Cryptocurrency, NFTs, "Web3."
- Diet, fitness, "founder mindset."
- "Day in the life" content.
- Memes about war, casualties, or refugees. **Ever.**
- Memes that involve other companies' brand marks.

Internal debate on these topics is fine. External posting is not.

---

## 10. Verified accounts + handles

| Platform | Handle | Verification status target |
| --- | --- | --- |
| X | `@aegislens` | Paid verification + gold (org) tier. |
| LinkedIn | `/company/aegislens` | Verified page. |
| Bluesky | `@aegislens.<tld>` | Domain-handle verification (own the DNS-based handle). |
| Mastodon | `@aegislens@osint.<tld>` | Self-hosted instance for handle ownership. Reviewed Q3. |
| Telegram | `@aegislens` | Verified badge once eligible. |
| YouTube | `@aegislens` | Custom URL + verification. |

**Founder accounts** linked from the org page only after personal trademark review. No staff accounts may post org news ahead of the org account.

---

## 11. AI-assisted drafting

- AI may draft event cards, brief previews, and replies from a fixed template.
- Every AI draft requires human approval before publish — no auto-publish on any channel except the Telegram alerts channel, which is gated by the verification pipeline (not free-form AI).
- AI-drafted posts must pass the voice eval (see VOICE_TONE.md § 7).
- The copilot draft tool logs `draft_id, prompt, model, reviewer, decision` for audit.

---

## 12. Account security

- Hardware-key 2FA mandatory on all accounts. SMS-based 2FA disabled.
- Password manager only. No shared passwords in chat.
- Access list reviewed monthly. Off-boarded staff lose access within 4 hours.
- Quarterly impersonation sweep (see `BRAND_GOVERNANCE.md` § 5).
- Crisis-account-takeover runbook: see `incident_response/TODO_security_incident.md` (extend with social-specific subsection).

---

## 13. Localized accounts

Threshold for spinning up a localized account: ≥ 5,000 likely-audience users in that locale AND a dedicated local voice owner.

| Locale | Account | Status |
| --- | --- | --- |
| EN | `@aegislens` | Primary, day 1. |
| UK | `@aegislens_ua` | Day 1 (we cover Ukraine as primary theater). |
| DE | `@aegislens_de` | Pending threshold. |
| FR | `@aegislens_fr` | Pending threshold. |

Localized accounts follow the same voice + cadence rules. Translated, not transliterated (VOICE_TONE.md § 6).
