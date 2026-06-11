# Moderation Operations — Supplemental Playbook

> **Extends:** `docs/community/code-of-conduct.md`
> **Status:** v1.0 — operational guide. Review quarterly.

This document covers the operational layer of moderation: team rotation, language coverage, automated tooling, and transparency reporting. It is the internal companion to the public-facing Code of Conduct.

---

## 1. Mod Team Rotation & Training

### Team structure

| Role | Count | Description |
|---|---|---|
| **Community Lead** | 1 | Owns overall moderation health, escalation escalation point, quarterly report author |
| **Platform Moderator (EN)** | 2 (rotating) | Primary coverage for Forum, Discord, Telegram (English) |
| **Platform Moderator (UK)** | 2 (rotating) | Primary coverage for Ukrainian-language channels |
| **Platform Moderator (RU)** | 1 | Russian-language channels (read-only monitoring, defensive) |
| **Volunteer Senior Moderator** | Up to 4 | Level 4+ contributors who opt in; review appeals; do not handle escalations |
| **Trust & Safety** | 1 (part-time escalation only) | Handles CSAM, doxxing, legal requests — not routine moderation |

Minimum coverage: at least **1 active moderator per platform per 8-hour window** (Forum, Discord, Telegram covered by overlapping schedules).

### Rotation schedule

- Full-time moderators work **4-week on / 1-week off** cycles.
- On-call shift: 8-hour window assigned in the Community Lead's scheduling sheet.
- Coverage gaps filled by:
  1. Schedule swap (mod team's own arrangement, 72h notice).
  2. Volunteer Senior Moderator stepping in (confirmed in `#mod-team` channel).
  3. Community Lead escalation.
- Holiday coverage planned at least 30 days in advance (major holidays: UA Independence Day Aug 24, Christmas Dec 25, New Year Jan 1).

### Training curriculum (new moderators)

All new moderators complete the following before taking an active shift:

| Module | Format | Duration | Required |
|---|---|---|---|
| **Platform context** — What Aegis Lens does, who our users are, why trust matters | Video + Q&A | 1h | Yes |
| **Code of Conduct walkthrough** — strike system, categories, edge cases | Self-paced reading + quiz | 1h | Yes |
| **Escalation protocols** — doxxing, CSAM, legal, national-security-adjacent reports | Guided doc + debrief | 1h | Yes |
| **Tool training** — Discourse admin, Discord bot commands, Telegram bots | Screen recording | 45min | Yes |
| **Conflict-zone context** — understanding the operational environment (UA conflict, psychological operations, disinformation patterns) | Reading list + 30min debrief with Community Lead | 2h | Yes |
| **Shadow shift** — monitor with a senior mod, no solo actions | 1 full 8h shift | 8h | Yes |
| **Quarterly refresher** — updated edge cases, new platform features, incident debrief | 30min async | Quarterly | Yes |

### Moderator wellbeing

Moderating conflict-zone content — including graphic imagery, victim accounts, and war crimes documentation — is psychologically taxing.

- **Content warnings** in `#mod-team` for shifts involving graphic content.
- **Debrief** option after any incident involving graphic imagery or severe violations — 15-minute call with Community Lead or peer.
- **Hard limit:** no moderator reviews graphic content for > 2 consecutive hours without a break.
- **Access to professional support:** Aegis Lens covers up to 3 counseling sessions/year for mod team members who request it (arranged confidentially via HR).
- **Opt-out:** Moderators can opt out of graphic-content queues at any time without penalty.

---

## 2. Automated Heuristics for Spam & Brigading

> **Note:** Automated systems assist moderators — they do not replace human judgment. All auto-actions are reviewable.

### Spam detection

| Signal | Threshold | Auto-action |
|---|---|---|
| Post rate | > 5 posts in 60 seconds | Rate-limit + flag for review |
| Duplicate content | > 80% similarity to existing post in 24h | Auto-remove + flag |
| New account posting external links | Account < 7 days + external link | Held for mod approval |
| Known spam domain | Domain in blocklist | Auto-remove + notify poster |
| Keyword pattern | Known scam / phishing patterns | Auto-remove + ban + notify Trust & Safety |

### Brigading & coordinated inauthentic behavior (CIB) detection

| Signal | Threshold | Auto-action |
|---|---|---|
| Coordinated report surge | > 15 reports on same post in 5 min | Freeze post + page Community Lead immediately |
| Account age clustering | > 5 accounts created within 1h all active in same thread | Flag for review (no auto-action) |
| Vote manipulation | > 10 upvotes from accounts < 3 days old on same post | Hold votes pending review |
| Cross-platform link seeding | Same URL appearing in > 3 channels within 10 min | Flag for review |
| Geolocation clustering | > 10 new accounts from the same /24 subnet in 1h | Soft-cap registrations from that subnet, alert Trust & Safety |

### Implementation notes

- Discourse: leverages Akismet + custom Discourse plugins (rate-limiting, post approval rules).
- Discord: custom bot (aegismod-bot) with rule engine backed by Postgres; actions logged to `#mod-log`.
- Telegram: Combot or equivalent + custom webhook handler for pattern detection.
- **False positive review:** Any auto-removed post can be appealed within 24h via `/help/contact` or `#appeals` Discord channel. Auto-actions are reviewed and reversed within 4h during active shifts.

---

## 3. Per-Language Moderation Coverage

### Language tiers

| Tier | Languages | Coverage requirement |
|---|---|---|
| **Tier 1 (launch)** | Ukrainian (UK), English (EN) | 24/7 coverage (overlapping mod shifts) |
| **Tier 2 (year 1)** | Russian (RU) | Read-only monitoring 08:00–22:00 UTC; automated spam filters cover overnight |
| **Tier 3 (expansion)** | Polish (PL), German (DE), Romanian (RO) | Volunteer moderators; 12h active coverage goal |
| **Tier 4 (future)** | All other ACTIVE_LOCALES | Automated tooling only; human review on escalation |

### Recruiting per-language moderators

- **UA moderators:** recruited from Level 3+ contributor pool, UA journalist community, and civic-tech orgs.
- **PL / DE / RO moderators:** partnerships with regional OSINT communities and journalism schools.
- **Language testing:** new moderators must demonstrate native/near-native fluency via a short written task reviewed by a native speaker on the team.

### Cross-language consistency

- Moderation decisions are language-agnostic in principle: the same violation in Ukrainian and English receives the same outcome.
- Edge cases: culturally ambiguous content (e.g., dark humor about the conflict, insider shorthand) is flagged by the language-native mod before action is taken.
- Weekly `#mod-sync` meeting reviews cross-language consistency issues.

### Machine translation aid

When a moderator is reviewing content in a Tier 3/4 language they don't speak natively:
- DeepL API used for draft translation (not for final judgment — context matters).
- Native speaker in `#mod-team` pinged for ambiguous cases (response target: 1h).
- Action deferred until native-speaker input unless content is clearly violating (e.g., spam, obvious doxxing).

---

## 4. Quarterly Transparency Report

### Purpose

Public accountability — showing the community (and the world) how moderation power is exercised. Published publicly on `aegislens.io/transparency/moderation-report`.

### Report cadence

| Action | Timing |
|---|---|
| Internal data pull | Last day of quarter |
| Draft report | 10 days after quarter end |
| Community Lead + Legal review | 14 days after quarter end |
| Published | 21 days after quarter end |

### Report sections & content

#### 1. Volume summary

| Metric | This Quarter | Last Quarter | Change |
|---|---|---|---|
| Total mod actions | | | |
| Warnings issued | | | |
| Posts removed | | | |
| Users suspended (temporary) | | | |
| Users banned (permanent) | | | |
| Appeals received | | | |
| Appeals upheld (action reversed) | | | |

#### 2. Action breakdown by violation category

Pie chart + table:
- Spam / bot activity
- Harassment / doxxing
- Coordinated inauthentic behavior
- Disinformation / fabricated events
- CSAM / NCII
- Off-topic / low quality
- Other policy violations

#### 3. Government and legal requests

Number of content removal or account data requests received from governments or law enforcement, and compliance rate. If zero, state explicitly. Format aligned with Google / Meta transparency report conventions.

#### 4. Automated action stats

- Auto-removals by category
- False positive reversal rate
- Coverage hours by language tier

#### 5. Notable incidents

Brief, anonymized descriptions of significant moderation incidents (brigading campaigns, major CIB attempts, high-profile bans). No PII. Each incident: date, category, action taken, outcome.

#### 6. Moderator team health

- Current team size (no names)
- Languages covered
- Average response time (median, p90)
- Wellbeing check-in results (aggregate, anonymized)

#### 7. Next quarter priorities

2–3 moderation improvements planned (e.g., new language coverage, tooling upgrade, policy update).

---

## Appendix: Escalation Contact Matrix

| Issue type | First contact | Escalation |
|---|---|---|
| Routine violation | On-shift moderator | Community Lead |
| Suspected doxxing | Community Lead | Trust & Safety within 1h |
| CSAM | Trust & Safety immediately | Legal + law enforcement (NCMEC / local authorities) |
| Threats of violence | Community Lead | Trust & Safety + Legal within 2h |
| National-security-adjacent | Community Lead → Trust & Safety | Legal + external security counsel |
| Legal / court order | Legal team | CEO aware within 24h |
| PR-sensitive incident | Community Lead + Comms | Exec escalation via `docs/crisis-comms/crisis-comms.md` |
