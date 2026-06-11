# Contributor Program

> **Status:** v1.0 — operational policy. Review quarterly.

Aegis Lens is a community-powered intelligence platform. Contributors — people who submit geolocations, verifications, source tips, and methodology improvements — are co-builders, not passive users. This document defines how we recognize, reward, and grow the contributor community.

---

## 1. Who Is a Contributor?

A **contributor** is any community member who submits:

| Contribution type | Examples |
|---|---|
| **Geolocation** | Matching photo/video to coordinates via landmarks, shadows, satellite imagery |
| **Verification** | Confirming or challenging an event's accuracy using open sources |
| **Source tip** | Submitting a new Telegram channel, social account, or public feed |
| **Methodology** | Writing a how-to guide, annotating a case for the Academy |
| **Translation** | Localizing guides or UI strings (EN↔UK↔PL↔DE) |
| **Archiving** | Preserving threatened content (screenshots, Wayback Machine submissions) |
| **Bug report** | Reproducible bugs with steps; confirmed before credit |

---

## 2. Verified-Contributor Application & Vetting

### Application flow

1. User fills out the Contributor Application form at `/community/apply` (email, expertise area, language, sample work link or description).
2. **Automated check:** account age ≥ 30 days, no active bans or warnings.
3. **Human review** (ops team within 7 business days): assess sample work quality, check for any red-team or adversarial patterns.
4. **Decision:** Approved → "Verified Contributor" badge activated; Rejected → email with reason + 90-day reapplication window.
5. New contributors receive the **Contributor Handbook** via email (see §8).

### Vetting criteria

- Sample work demonstrates ability to use open sources responsibly.
- No history of doxxing, PII exposure, or weaponized OSINT.
- Agreement to the Contributor Code of Conduct (see `docs/community/code-of-conduct.md`).
- Identity verification is **not required** — pseudonymous contributors are welcome; source quality is what matters.

---

## 3. Public Leaderboard (Opt-In)

Contributors may opt into the public leaderboard at `/community/leaderboard`.

- **Default:** off — contributions are private unless the contributor enables display.
- **Ranking inputs:** weighted score across contribution type × quality × volume (rolling 90-day window).
- **Displayed fields:** display name (or alias), badge tier, contribution count by type, current streak (days).
- **Opting out:** any time from account settings; historical rank data is anonymized, not deleted.
- **Anti-gaming rules:** duplicate submissions, cross-account boosting, and AI-generated geolocations submitted as human work are grounds for disqualification and tier demotion.

---

## 4. Badges per Contribution Type & Level

### Type badges (awarded automatically)

| Badge | Trigger |
|---|---|
| 🎯 Geolocator | 10 accepted geolocations |
| ✅ Verifier | 20 accepted verifications |
| 📡 Source Scout | 5 accepted source submissions |
| 📖 Methodologist | 1 published methodology guide |
| 🌐 Translator | 500 translated strings accepted |
| 🗃️ Archivist | 50 archived items linked to events |

### Level badges (cumulative contribution score)

| Level | Score range | Badge label |
|---|---|---|
| 1 | 0–499 | Analyst Trainee |
| 2 | 500–1,999 | Open-Source Analyst |
| 3 | 2,000–7,499 | Senior Analyst |
| 4 | 7,500–19,999 | Intelligence Lead |
| 5 | 20,000+ | Aegis Fellow |

Badges are visible on the public leaderboard, the contributor's profile, and (with consent) on event pages where their work appears.

---

## 5. Contributor Perks

| Perk | Tier threshold | Details |
|---|---|---|
| **Free Pro account** | Level 2+ | Full Pro feature set while tier is active; auto-renewed quarterly |
| **Free Team account** | Level 4+ | Team tier; also granted to top 10 on leaderboard each quarter |
| **Swag** | Level 3+ | Annual swag drop (sticker set, t-shirt, patch) — shipping opt-in |
| **Event invites** | Level 3+ | Invited to AMAs, workshops, contributor summits |
| **Co-authorship** | Case-by-case | Major contributions to investigations credited as co-authors in the published report |
| **Early access** | Level 2+ | Access to beta features and new data layers before public release |
| **Cash bounties** | Level 3+ | See §6 |
| **Academy Pro access** | Level 2+ | All paid Academy paths unlocked |

---

## 6. Quarterly Recognition & Cash Bounties

### Cash bounties

- Posted on the `/community/bounties` board.
- Categories: **Geolocation challenge** (specific unresolved event), **Verification deep-dive**, **Methodology research**, **Archiving sprint**.
- Amounts: $25–$500 per bounty depending on difficulty and impact.
- Payment via PayPal, Wise, or crypto (USDC/ETH) — contributor's choice.
- Tax: contributors in eligible jurisdictions will receive appropriate documentation (1099-NEC for US contractors earning >$600/year).

### Quarterly Top-Contributor Recognition

- Top 3 per contribution type receive a public recognition post on all channels.
- Top contributor overall receives a "Quarterly Fellow" title and a $250 bonus.
- Recognition published within the first week of the new quarter.

---

## 7. Contribution Attribution on Event Pages

With contributor consent:

- Accepted geolocations and verifications include a "Verified by [Contributor Name / alias]" byline on the event detail page.
- Consent is per-submission: contributors can enable attribution globally or per-submission in settings.
- Attribution is removed immediately on request (personal data deletion right under GDPR Article 17).
- Contributors who later request anonymization get a pseudonymous "Community Analyst" credit.

---

## 8. Onboarding Doc for New Contributors

Delivered via email immediately after approval. Key sections:

1. **Welcome & what we're building** (mission statement, why contributor quality matters)
2. **First steps:** complete your profile, join the Discord `#contributors` channel
3. **How to submit a geolocation** (step-by-step with example)
4. **How to submit a verification** (evidence standards, what counts)
5. **Contribution quality standards** (what gets rejected and why)
6. **Code of conduct** (link to `docs/community/code-of-conduct.md`)
7. **Where to get help** (Discord `#help-contributors`, weekly office hours)
8. **Earning your first badge** (quick wins to hit Level 2)

Full handbook available at `/docs/contributors/handbook`.

---

## 9. Mentor Pairing

For promising Level 1 contributors (signal: 3+ accepted submissions in first 30 days):

- Automated email offering mentor pairing.
- Mentor pool: Level 4+ contributors who opted in + core team members.
- Pairing: same language, overlapping expertise area.
- Format: async (Discord DMs) + optional 30-min monthly video call.
- Duration: 3 months; both parties can extend or exit at any time.
- Mentors earn bonus XP and are prioritized for the annual summit invitation.

---

## 10. Annual Contributor Summit

- **Format:** hybrid (in-person anchor city + remote stream).
- **Timing:** Q4 each year.
- **Attendance:** Level 3+ contributors invited; Level 4–5 travel stipend provided.
- **Content:** methodology deep-dives, platform roadmap preview, contributor awards ceremony, OSINT workshops.
- **Size target:** ~100 in-person, ~500 remote for year 1; scale with community.

---

## Appendix: Scoring Formula (v1)

```
contribution_score = sum(
  geolocation_accepted × 20
  + verification_accepted × 10
  + source_accepted × 15
  + guide_published × 100
  + translation_string_accepted × 0.5
  + archive_linked × 2
  + bounty_awarded × (bounty_value / 5)
)
```

Quality multiplier (applied to each submission):
- `1.0` — accepted
- `1.5` — featured / used in a published investigation
- `0.5` — accepted but flagged for minor quality issue
- `0.0` — rejected (does not count)

Score decays 10% per quarter to reward recency over legacy.
