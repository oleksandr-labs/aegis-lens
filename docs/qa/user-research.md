# User Research & UX Studies

> Continuous understanding of every persona. Avoid building from assumption.
> **Talk to analysts on the ground in UA — they will surface 80% of the best
> ideas.**

## 1. Research cadence

| Activity | Frequency | Volume |
| --- | --- | --- |
| **Depth interviews** (per persona) | Quarterly | 5 interviews × 8 personas = 40/year |
| **Weekly usability sessions** | Weekly | 3 sessions/week (moderated, 30–45 min) |
| **Quarterly product survey** | Quarterly | All active users (5-min NPS + open-end) |
| **Pre-launch concept tests** | Before every major feature launch | 5–8 participants, unmoderated |

Personas (8): OSINT analyst, humanitarian/NGO worker, government/defense, journalist,
financial/risk analyst, civil-society researcher, platform admin, open-access user.
Each gets a dedicated interview round; insights are tagged to persona in the
research repo (§9).

---

## 2. Depth interviews (semi-structured, recorded)

**Protocol:**
- 45–60 min, video call.
- Consent for recording obtained at the start (see §11 — consent form).
- Semi-structured guide: context-setting → current workflow → pain points →
  concept reactions → close. Guide versioned in the research repo.
- Two people per session (facilitator + note-taker); alternate roles across
  interviews to reduce bias.
- Recorded → auto-transcribed (Otter.ai / Whisper local) → human-reviewed
  → stored with PII scrubbed from transcript (see §10).

---

## 3. Diary studies

For the **OSINT analyst** and **humanitarian** personas: a 5-day diary study
where participants log their work in a structured template during a real work week.
- Format: Notion template or short daily video log (consent for recording).
- Surfaces: tool-switching frustration, time lost to manual verification, moments
  of uncertainty under pressure.
- Run at least **once per year** per high-priority persona; 5–8 participants.

---

## 4. Tree tests (IA changes)

When proposing a significant IA change (nav, filter hierarchy, layer panel):
- Run an unmoderated **tree test** via Optimal Workshop or Maze before building.
- Task success rate target: > 80% on primary tasks.
- Blocking regressions (< 70% on a previously-passing task) pause the IA change.

---

## 5. First-click tests (marketing pages)

Before launching or overhauling a marketing page:
- 20–30 participants, unmoderated, 30 s per page.
- Measure: correct first-click rate on primary CTA.
- Target: > 70% click the intended CTA first.

---

## 6. Heatmaps + session replay (opt-in only)

Tool: **PostHog** (EU-hosted, consent-gated — matches our subprocessor list).
- Enabled only for users who explicitly opt into product improvement data.
- **PII scrubbing** configured: mask all input fields, mask sidebar data columns,
  mask anything matching an event-coordinate pattern.
- Session replays reviewed weekly by design/research; insights tagged and linked
  to research repo.
- Heatmaps generated monthly per major workspace surface.

---

## 7. Research repository (Dovetail / Notion)

All research lives in a **single searchable repo** (Dovetail preferred for
auto-tagging; Notion as a simpler fallback):
- Every interview, usability session, and survey result has an entry with: date,
  persona, method, key insights (tagged), and quotes.
- Insights are tagged by: feature area, persona, severity, and source type.
- **Insight → backlog linkage:** every actionable insight links to a Linear issue
  (or upvotes an existing one). Nothing dies in a report PDF.

---

## 8. Insight → backlog item linkage

- After each research session: researcher posts ≥ 1 insight + 1 Linear link in
  the research Slack channel.
- Weekly research digest: top-5 insights that week → shared with product and
  design leads.
- Quarterly research synthesis: distilled themes per persona → feeds the roadmap
  prioritization session.

---

## 9. Participant recruitment pool

- Maintain a **consent-and-interest pool** of past and willing participants
  (stored in an EU-residency-compliant database — see §11).
- Compensation policy: `[amount]` gift card or equivalent per 30–45 min session
  (fair compensation reduces attrition and recruitment time).
- Participants in conflict zones: offer asynchronous methods (async video,
  written diary) to reduce risk; never record location or identifying operational
  detail. Field researchers and proxy interviews are acceptable substitutes.

---

## 10. Privacy — PII handling in research data

- **Consent before recording.** No recording without explicit verbal or written consent.
- **Transcript PII scrubbing:** participant names and any identifiers are replaced
  with `[PARTICIPANT]` or a code (P01, P02...) before storing in the research repo.
- **Session replay PII:** PostHog masking configuration must be reviewed whenever
  new data fields are added to the product UI. Any unmasked PII is a P1 privacy
  bug.
- **EU data residency for participant records:** all consent forms, recordings,
  and transcripts stored in EU-region storage (AWS eu-central-1 or equivalent).
  Aligns with the [DPA](../legal/dpa.md).

---

## 11. Consent forms + localization

- Consent forms available in **EN + UK** (and DE, FR on request for EU
  participants).
- Cover: purpose of the study, what's recorded, how data is stored and deleted,
  right to withdraw, compensation.
- Withdrawal: participant can request deletion of their data at any time; Research
  lead action within 48 h.
- Stored in the research repo with participant codes (not names).
