# Sprint 2.55 Progress

**Date:** 2026-05-30
**Status:** Complete

## Completed tasks

### hr_people/ — full folder (5 files, all ✅ COMPLETE)

**`docs/hr/hr-people.md`** (NEW, 5 parts):

- **§Part 1 — Compensation** (9 tasks): 8 role-family band table (Engineering L3–L6, AI/ML L3–L6, Design L3–L5, Analyst A2–A5, Sales S1–S4, CS CS1–CS3, Ops O2–O5, G&A G2–G4). Benchmark 60th–80th percentile with per-region adjustment table (US 100% → UA 40–55% but 80th–90th UA market). Equity grant table by level (L3: 0.05–0.10% → C-suite: 1–3%; 4-year vest, 1-year cliff, 10-year window). No equity-for-salary swap rule. Annual review in November, effective Jan 1, band-driven. UA no-downward-adjustment during conflict period. No-haggle offers defended with data. Refresh grants: top 20% annually, 25–100% of hire grant.

- **§Part 2 — Remote Policy** (9 tasks): Remote-first definition. 4h daily overlap rule with 10:00–14:00 UTC core window; air-raid exemption. Quarterly offsite: $1,500/person, 60%/40% split, hybrid option. Annual all-hands: Q3, Berlin/Warsaw/Vilnius, $2,500/person. Expense policy: economy < 6h / business > 6h, $80/day meals. Equipment: MacBook + $1K setup + $80/month internet + $1,500/year L&D. Coworking: $200/month high-cost → $50/month remote. UA crisis: Starlink kit, $75/month fuel, evacuation $500 logistics. 6 wellbeing days (UA: 9), not accumulated.

- **§Part 3 — DEI** (8 tasks): Pipeline targets (≥50% women/non-binary screened, ≥40% UA/Eastern European for OSINT+product, ≥30% non-English primary). Sourcing: Women Who Code + Dou.ua + Projector + Textio review. Structured interviews: scorecards + same questions + no ad-hoc + scorecard before debrief. Panels: ≥1 woman/non-binary where available. Pay-equity audit November: regression analysis, > 5% gap → immediate adjustment. Promotion-rate parity quarterly: < 80% → investigation. Structural changes over mandatory training. Inclusive language: 2-page living doc. DEI report Q4 with 3 measurable goals.

- **§Part 4 — Wellbeing** (11 tasks): 6 wellbeing days + unlimited sick leave. Mental health: Spring Health/Lyra (US 16 sessions), Spill/BUPA (UK 8–12), UA platforms + $200/year spending account. Exposure rotation: 4h max graphic content, weekly rotation, buddy system, opt-out without penalty. Workspace blur defaults + `content_warning: true` API field. Quarterly 30-min wellbeing check-in (not recorded). Trauma-informed culture norms. On-call: max 2×/month, 48h recovery, $150/week stipend. No-meeting Fridays company-wide. Sabbatical: 4 weeks after 4 years, repeating, 1-year postpone option. Therapist directory (vicarious trauma + UA-speaking + remote). Annual pulse: 10-question anonymous October survey.

- **§Part 5 — Security Training** (10 tasks): Day-1 training (3 modules: auth 30min / phishing 30min / secrets 20min). Annual September refresh. Analyst OpSec (3 modules: source protection 45min / data handling 30min / digital OpSec 45min including no sock puppets without approval). Travel security: 7-day advance notice, country briefing, daily check-in protocol, post-travel device wipe. Device hardening: FileVault + auto-lock 2min + MDM Jamf. Social-media OpSec: no capability reveals, analysts maintain separate research persona. Quarterly phishing simulations (3 difficulty levels, educational not punitive). IR basic training Month 2 (what constitutes incident, how to report, what not to do). MFA: TOTP minimum (no SMS), Yubikey required for engineers/analysts/leadership. Per-role advanced training table (analyst quarterly, engineers OWASP quarterly, leadership board threat brief semi-annually).

### okrs_metrics/ — full folder (5 files, all ✅ COMPLETE)

**`docs/okrs/okrs-metrics.md`** (NEW, 5 parts):

- **§Part 1 — North-Star** (7 tasks): TEVI (Time-from-Event-to-Verified-Intelligence) chosen as north-star. Definition: elapsed seconds from raw event entry to verified (confidence ≥ 0.85 or human-approved) and visible. Target: median < 90s Tier-1, P90 < 5 min. Decision rationale vs. alternatives (DAU, API volume, events seen). Per-tier sub-targets table (missile/drone < 60s median → maritime < 2min). Dashboard: green/yellow/red. Change bar: CEO + board + 2-quarter transition. OKR connection requirement with explicit rationale exception.

- **§Part 2 — OKR Cadence** (9 tasks): 5-step quarterly ritual (planning → alignment → kickoff → mid-check → retro). Max 3 objectives × 3 KRs company level; sample Q2 OKRs with specific targets. Team OKRs cascade: must connect to ≥1 company KR, max 2 objectives. OKR template with markdown table + retro section. Scoring: 0.6–0.7 healthy stretch, 1.0 = easy target. No OKR-tied comp: 4 explicit reasons. Registry: indefinite retention, locked 14 days after quarter. Stretch vs. commit annotation: immutable mid-quarter. Investor subset: narrative + customer metrics, excludes TEVI actuals.

- **§Part 3 — Metrics Tree** (8 tasks): Full ASCII metrics tree TEVI → Source Input → Ingest Pipeline → AI/NLP → Verification Pipeline → Product/User (Acquisition/Activation/Engagement/Revenue/Quality). Acquisition: organic signups > 50/week, trial-to-paid > 8%. Activation event defined (view map + filter + 7-day return), D7 target > 35%. Revenue: NDR > 110%, churn < 3%/month, LTV/CAC > 3×. Quality branch. Per-metric owner: named role + dashboard URL + Slack channel. Tree review Q4: remove unused metrics.

- **§Part 4 — Leading/Lagging** (7 tasks): Leading indicators table (7 items with thresholds: source freshness P95 > 10min → alert, queue > 200 → alert, D7 activation < 30% → review). Lagging indicators (8 metrics with frequency and targets). Automated alerts: Grafana+PagerDuty + PostHog + weekly Monday Slack digest. Monthly metrics review meeting: last Thursday, 45 min. Per-indicator: named owner + dashboard accuracy + root-cause on alerts.

- **§Part 5 — Dashboards** (8 tasks): TV dashboard (TEVI + sources + OKR scores + MRR + DAU + incident; real-time operational, hourly business). Per-team dashboards linked from OKR registry. Investor dashboard: 8 metrics, 2 excluded (TEVI actuals, pipeline), sent via DocSend on 5th. AI quality dashboard: F1 by class + ECE + copilot satisfaction + queue stats. Cost dashboard: cloud spend + cost/1k events + LTV/CAC + gross margin. CSM customer health: 0–100 score (green ≥ 80, yellow 50–79, red < 50). Alert routing table (8 alert types with channel and responder). BI stack: Postgres + ClickHouse + dbt + Metabase + Grafana; all SQL in `packages/analytics/`.

### sales/ — full folder (6 files, all ✅ COMPLETE)

**`docs/sales/sales.md`** (NEW, 6 parts):

- **§Part 1 — Master Playbook** (10 tasks): ICP table for 5 segments with characteristics + buying signals. Value props (1 sentence + proof points per segment). Objection handler table: 8 objections × segment × handler ("We use LiveUAmap" → "We add verification + sourcing on top"). Demo script: 30-min flow (hook 3min → map 8min → copilot 5min → alerts 4min → export 4min → Q&A 6min). Discovery questions: 3 universal + 3–4 per segment. Pricing guardrails: AE ≤ 20%, CEO ≤ 30%, annual 15% discount. MEDDICC framework (7 elements, no deal to Proposal without Champion + Economic Buyer). CRM stages: 7 stages with required fields. Win/loss interviews (5 questions, won in 60 days, lost in 7 days). Quarterly playbook update.

- **§Part 2 — SDR Outbound** (9 tasks): List sources by segment (Apollo / ZoomInfo / hand-curated GIJN/ONA/SAM.gov). Newsroom 7-touch 21-day + Government 9-touch 45-day sequence templates with specific step content. Cadence: 20 sequences/week, 4–5 meetings/week, no spray-and-pray. Personalization: 3 observable facts per touch, monthly random audit. A/B testing: 1 per segment per quarter, 50-send minimum. Handoff: 4h after qualification, AE schedules 24h; warm handoff template. CRM: every touch logged 24h. Metrics: open rate > 35%, reply > 8%, positive > 3%, meeting→demo > 70%.

- **§Part 3 — Enterprise Motion** (11 tasks): Multi-threading 5-stakeholder table with engagement strategy. Mutual close plan markdown template. POC: 30 days, 4-week structure, mid-check Day 14, 7-day contract window. Security questionnaire CAIQ+SIG Lite 48h SLA. Cross-functional review > $25K ACV (SE+Legal+Finance, 48h). ROI calculator web+Sheets (inputs/outputs). Reference program: 3–5 per segment, briefed. Procurement pack: 7 items. Renewal Month 9–12 timeline. Multi-year: 15%/20%/25%.

- **§Part 4 — Government Motion** (12 tasks): Sovereign deployment story (EU-Frankfurt tenant + Docker deployment). Country compliance map (US/EU/UK/UA/NATO). Gov procurement pack additions (ITAR statement, SAM.gov, Section 889 letter). FedRAMP deferred to Phase 3, honest comms template. Reference path: EU transparency → multilaterals → UA digital bodies. Prime contractor Phase 3. No lobbying: no PAC, no registered lobbying. No political endorsement: factual data + media freedom OK; no party/candidate/military-decision endorsement. Deal authorization: CEO + export control + conflict-of-interest per new country. Conference table (CYBERUK active / Eurosatory very cautious / IDEX not attending). Multi-year: 12-month + 2×1-year options, CPI+3% escalation, 90-day termination. Ethics review: CEO + security advisor before close + enhanced AUP.

- **§Part 5 — Newsroom Motion** (9 tasks): Press tier funnel (verified email → Free + 30-day Pro → prompt + citation onboarding). Champion ID: data editor / OSINT lead / senior correspondent; found via bylines + GIJN/ONA attendees. Demo: always a real event from their beat. Citation-friendly: format generator + methodology URL + CSV/PDF export + source tracing. Embed kit: 100-line JS, brand colors, 15% referral revenue share. Renewal: January budget cycle awareness. Case studies: anonymous immediately + named consent at `/customers/[slug]`. Conference table (GIJN ★★★★★). Per-region anchor newsrooms: Kyiv Independent/Texty (UA), OKO.press (PL), DW (DE), BBC Verify (UK), NYT data desk (US).

- **§Part 6 — Collateral Library** (10 tasks): Master deck: 25 slides with 5 audience-swap slots, slide-by-slide order documented. 8 one-pagers (OSINT Analyst / Journalist / NGO Field / NGO Safety / Enterprise Risk / Gov Defense / Maritime / Trader). 6 vertical 2-page pitches. 4 region pitches with local currency. ROI calculator web+Sheets. Demo videos: 5 formats (teaser 90s / product 5min / per-persona 3min / API quickstart 4min / testimonials 2min). Case studies: anonymous + named. 2-page tech brief (stack + security architecture + SLO). Security questionnaire. Versioning: naming convention + quarterly review.

## TODO files updated
- `TODO/hr_people/TODO_compensation.md`: 0/9 → 9/9 ✅ COMPLETE
- `TODO/hr_people/TODO_remote_policy.md`: 0/9 → 9/9 ✅ COMPLETE
- `TODO/hr_people/TODO_dei.md`: 0/8 → 8/8 ✅ COMPLETE
- `TODO/hr_people/TODO_wellbeing.md`: 0/11 → 11/11 ✅ COMPLETE
- `TODO/hr_people/TODO_security_training.md`: 0/10 → 10/10 ✅ COMPLETE
- `TODO/okrs_metrics/TODO_north_star.md`: 0/7 → 7/7 ✅ COMPLETE
- `TODO/okrs_metrics/TODO_okrs.md`: 0/9 → 9/9 ✅ COMPLETE
- `TODO/okrs_metrics/TODO_metrics_tree.md`: 0/8 → 8/8 ✅ COMPLETE
- `TODO/okrs_metrics/TODO_leading_lagging.md`: 0/14 → 14/14 ✅ COMPLETE
- `TODO/okrs_metrics/TODO_dashboards.md`: 1/9 → 9/9 ✅ COMPLETE
- `TODO/sales/TODO_sales_playbook.md`: 0/10 → 10/10 ✅ COMPLETE
- `TODO/sales/TODO_sdr_motion.md`: 0/9 → 9/9 ✅ COMPLETE
- `TODO/sales/TODO_enterprise_motion.md`: 0/11 → 11/11 ✅ COMPLETE
- `TODO/sales/TODO_gov_motion.md`: 0/12 → 12/12 ✅ COMPLETE
- `TODO/sales/TODO_newsroom_motion.md`: 0/9 → 9/9 ✅ COMPLETE
- `TODO/sales/TODO_collateral_library.md`: 0/10 → 10/10 ✅ COMPLETE

## Artifacts created
- `docs/hr/hr-people.md`
- `docs/okrs/okrs-metrics.md`
- `docs/sales/sales.md`
