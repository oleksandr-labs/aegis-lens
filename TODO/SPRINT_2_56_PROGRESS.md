# Sprint 2.56 Progress

**Date:** 2026-05-30
**Status:** Complete

## Completed tasks

### risk_register/ — full folder (5 files, all ✅ COMPLETE)

**`docs/risk/risk-register.md`** (NEW, 5 parts):

- **§Part 1 — Master Register** (12 tasks): 5×5 risk rating scale (Likelihood × Impact; ≥ 12 requires action plan). 12-risk register with scores, owners, mitigation, status (R02 hostile-state cyberattack 4×5=20 P0; R05 staff targeted 3×5=15 P0; R11 security breach 3×5=15 active; R07 AI hallucination 3×4=12 gates in place; R01 EU AI Act 4×3=12 monitoring; R09 key-person 3×4=12 active). Quarterly board review process. Per-risk action plan template (trigger + immediate + medium-term + owner + review date).

- **§Part 2 — Regulatory** (10 tasks): EU AI Act: GPAI obligations from day 1 (model cards, Article 53 docs), avoid high-risk classification (no EU law enforcement marketing), €15–25K legal assessment at Series A. DSA: micro-enterprise exemption ~3–4 years; build content moderation transparency infra now. UK OSA: professional-credential signup mitigates CSAM; monitor OFCOM codes. US privacy: CCPA+CPRA standard from day 1, APRA monitoring. Export control: legal opinion before first defense/gov contract; ITAR likely not applicable. Sanctions: OFAC+EU+UK screening automated + manual + quarterly re-screen; Chainalysis/Dow Jones API. Defamation: E&O insurance + "responsible journalism" defence documentation. Source protection: court order review by counsel before compliance, notify contributor if permissible. Quarterly counsel review. 6-source early-warning subscriptions table (EUR-Lex, OFCOM, OFAC RSS, EFF, FPF, IAPP).

- **§Part 3 — Competitive** (8 tasks): 7-competitor landscape table (Palantir/Dataminr/Bloomberg/Microsoft/LiveUAmap/Janes/Maxar — what they have vs what we have). Quarterly intel: changelogs + press + hires + patents + pricing → 1-page monthly digest. Defensive moats: verification methodology / KG depth / contributor community / TEVI speed / mission alignment. Per-segment Notion matrix updated quarterly. LinkedIn alerts for 5 companies. USPTO+EPO+EUIPO patent/trademark monitoring. Defection signals (usage -30%, champion departure, competitor trial, export-all ticket → CSM 48h alert). Counter-narrative `/compare/aegis-vs-[competitor]` pages.

- **§Part 4 — Geopolitical** (9 tasks): Threat table: RU APT28/29/Sandworm High P0 → CN low monitor. UA staff: pseudonyms encouraged, 72h emergency extraction, Signal group, air-raid protocol. Travel prohibition (Russia/Belarus/Iran/DPRK). Sanctions: real-time webhooks + quarterly re-screen. Insurance: cyber (Phase 1) + E&O (Phase 1) + D&O + K&R (Phase 2 UA > 5 staff) + political risk (Phase 3). Data residency: EU-Frankfurt + US-East warm standby + S3 cross-region cold. Source protection: encrypted storage, Signal comms, no gov customer disclosure (explicit contract prohibition). Staff anonymity: opt-in disclosure, UA default-anonymous.

- **§Part 5 — Technical** (10 items + 2 ops = 12 tasks): LLM cost: > 70% cache target, multi-provider hedge, alert at 15% MRR. LLM outage: circuit breaker 60s → auto-failover to OpenAI. Mapbox: MapLibre fallback maintained + tested quarterly; negotiate before $1M ARR. Telegram/X: Bot API only, X stopped as primary, OVA + CERT-UA direct feeds. Model deprecation: version pinning, multiple embedding + translation fallback chains. Cloud lock-in: Kubernetes-first, Terraform portable, S3-compatible storage only. Postgres scaling: read replicas + ClickHouse + partitioning + Qdrant + Elasticsearch. CDN: dual-CDN Cloudflare + CloudFront. Source breakage: freshness monitor + format-change detection + 4h SLA. Exit plans table (Mapbox 2–4w, Claude 1–3d, AWS 2–4w, Cloudflare 24–48h). Multi-vendor abstraction layer: LLMProvider + TileProvider + EmbedProvider interfaces. Quarterly tech risk review at engineering retrospective.

### release_management/ — full folder (3 files, all ✅ COMPLETE)

**`docs/release/release-management.md`** (NEW, 3 parts):

- **§Part 1 — Release Process** (11 tasks): Service cadence table (frontend continuous / API gateway daily / NLP weekly / schema migrations gated / no deploys after 16:00 UTC Fridays). Per-PR release notes: `## Release note` mandatory section → GitHub Actions automation → Notion draft. Weekly Monday 09:00 UTC changelog (Added/Changed/Fixed/Security format). Pre-flight 10-item checklist (automated: CI/TypeScript/ESLint/axe/Snyk; manual: schema DBA/load test/feature flag/on-call ack). Post-flight: smoke tests < 2 min + 15-min on-call window + 10× error-rate auto-rollback. Canary: 5% → 30 min monitor → 50% → 100% for risk areas (auth/billing/pipeline/schema). Blue-green + 24h dual-write window for schema migrations. Roll-forward preference (exceptions: data corruption, security, complete outage). Feature flags: LaunchDarkly, 10%→50%→100% rollout, 90-day auto-review, flag registry. Slack `#releases` template. 4-tier customer comms threshold.

- **§Part 2 — Release Notes** (6 remaining tasks): Weekly Monday publish. Tags: 8 area × 6 persona tags, searchable on changelog page. Screenshots/GIFs required for every UI change (Loom/Kap, stored in DAM). In-app "What's new": bell icon drawer, last 30d filtered by tier, dismissal tracked per-user, loads from `/api/changelog` edge-cached. Monthly email digest to engaged users (≥1 login in 30 days), segmented CTA. RSS+Atom+JSON feeds at `/changelog/feed.{xml,atom,json}` + `/api/changelog?since=` API; force-static 1h cache.

- **§Part 3 — Change Management** (8 tasks): Classification: 4 levels (Low→changelog / Medium→7d in-app+newsletter / High→30–60d email+in-app / Critical→immediate). Per-tier notice table (Free 30d / Pro/Team 30–60d / Enterprise/Gov 60–180d or per-contract). Multi-channel sequence: docs 48h before → in-app+email Day 1 → status page on deploy → support macros 7 days before. FAQ + macros loaded before first ticket. Migration articles at `/docs/migration/[slug]`: live ≥ 7 days before notice. Grace period: 7 days (Enterprise 30 days); no grace for security. Per-change retro at 30 days. Approval gate: Legal + CEO/VP Product + Head of CS — all 3 before High/Critical comms.

### partnerships_specs/ — full folder (10 files, all ✅ COMPLETE)

**`docs/partnerships/partnerships.md`** (NEW, 10 parts, 80 tasks):

- **§1 DeepStateMAP** (9): Signal outreach come with value first, mutual-benefit proposal (analytics + tooling offer), data-use agreement (CC-BY needs counsel review), co-branded year-in-review, joint press moments, mutual API exchange (our NLP → their tier-up), donor visibility coordination, annual October review, editorial firewall.

- **§2 Bellingcat** (8): Outreach at GIJN/OSINT Summit, shared methodology references + co-written "manual vs automated" piece, tooling collaboration (geolocation aids + fast-track requests), opportunity-based co-published investigations, mutual press recognition, Academy modules (guest lessons + revenue share), non-exclusivity explicit, annual review.

- **§3 Mapbox** (8): Commitment tier trigger at $10K–$25K/month (30–40% discount target), per-tile pricing negotiation (< $0.50/1k loads vs $1.20 PAYG), co-marketing case study, conference speaking, style consultation with Mapbox design team + a11y review, named SA engineering escalation, MapLibre fallback maintained + tested quarterly as negotiating leverage, annual review.

- **§4 Anthropic** (8): Committed spend at $5K/month (15–25% discount + named TAM), > 70% cache target (system prompts + conversation history + event batch context), burst capacity during breaking events (5–10× spike), case study at 1K MAU or Series A, early model access, 2h engineering escalation SLA, responsible AI public statement, multi-provider hedge (Claude → OpenAI → open-weights) via LLMProvider interface.

- **§5 Planet/BlackSky/Capella** (9): Planet Phase 2 evaluation (< $500/month for ~20K sq km = proceed), BlackSky Phase 3 (8–15 min revisit), Capella Phase 3 SAR (night/cloud, export control check), AOI subscription preferred + no exclusivity, 15–25% markup pass-through as Enterprise add-on, no raw scene redistribution (AUP prohibition), provider name+date+resolution attribution in map panel + PDF, `SatelliteProvider` interface with Planet/BlackSky/Capella providers + Sentinel Hub fallback, monthly cost dashboard.

- **§6 UN OCHA** (7): Outreach to Centre for Humanitarian Data (data@humdata.org), HDX provider status by Series A (CC-BY 4.0 public subset), Level 3 emergency activation co-deployment (accelerated feeds + analyst secondment + free access for OCHA + NGO partners), per-cluster relationships (logistics/protection/health), free Pro for all FTS-listed NGOs (annual verification), Academy modules + joint webinar, mutual citation with prior review.

- **§7 Anchor Newsrooms** (9): Target list (UA: Kyiv Independent top priority / international wires: Reuters/AP/BBC Verify / US: NYT / Germany: Spiegel / Poland: OKO.press), per-partner deliverables (free Pro + branded embed + co-publishing + citation generator + Slack channel), annual October review (citations, embed traffic, co-publishing), joint launch moments (year-end + breaking investigation 24h embargo).

- **§8 Universities** (9): 15+ target institutions across UK/US think tanks (RUSI/IISS/CSIS/Brookings/RAND), EU policy (SWP/DGAP/IFRI), Ukrainian (Kyiv-Mohyla/KSE), NATO StratCom CoE, conflict academia (LSE/Sciences Po/Georgetown). Free academic tier (institutional email + researcher status). DOI datasets: quarterly Zenodo releases versioned CC-BY 4.0. Co-authored papers 2–3/year (Conflict and Health, Global Crime, Intelligence and National Security). Quarterly webinars + annual symposium. Visiting fellowship Phase 3. Part-time academic relations → full-time Phase 2+. 2 conferences/year (APSA, ISA). Annual renewal.

- **§9 ISW** (7): DC outreach framing methodology comparison, CC-BY-NC license clarification (legal review required), copilot cites ISW + ISW links to our maps, annual co-authored "Year in Conflict Data" piece, cross-link program (mutual SEO benefit via high-DA links), quarterly webinar, annual October renewal.

- **§10 Cloud AWS + Cloudflare** (8): AWS Activate immediately ($25K–$100K credits), APN ISV tier at $250K+ ARR + marketplace listing, SA engagement at $10K+/month spend, co-published case study. Cloudflare for Startups ($6K credits, apply immediately), partner program at $1K+/month, enterprise contract at $5K+/month (Workers bandwidth negotiation). Multi-cloud portability docs (no AWS-proprietary services, Terraform portable). Hetzner for batch (50–60% cheaper, EU-based, not on latency-sensitive paths).

## TODO files updated
- `TODO/risk_register/TODO_risk_register.md`: 1/12 → 12/12 ✅ COMPLETE
- `TODO/risk_register/TODO_regulatory_risk.md`: 0/10 → 10/10 ✅ COMPLETE
- `TODO/risk_register/TODO_competitive_risk.md`: 0/8 → 8/8 ✅ COMPLETE
- `TODO/risk_register/TODO_geopolitical_risk.md`: 0/9 → 9/9 ✅ COMPLETE
- `TODO/risk_register/TODO_technical_risk.md`: 0/10 → 10/10 ✅ COMPLETE
- `TODO/release_management/TODO_release_process.md`: 0/11 → 11/11 ✅ COMPLETE
- `TODO/release_management/TODO_release_notes.md`: 2/8 → 8/8 ✅ COMPLETE
- `TODO/release_management/TODO_change_management.md`: 0/8 → 8/8 ✅ COMPLETE
- `TODO/partnerships_specs/TODO_deepstate.md`: 0/9 → 9/9 ✅ COMPLETE
- `TODO/partnerships_specs/TODO_bellingcat.md`: 0/8 → 8/8 ✅ COMPLETE
- `TODO/partnerships_specs/TODO_mapbox.md`: 0/8 → 8/8 ✅ COMPLETE
- `TODO/partnerships_specs/TODO_anthropic.md`: 0/8 → 8/8 ✅ COMPLETE
- `TODO/partnerships_specs/TODO_planet_blacksky.md`: 0/9 → 9/9 ✅ COMPLETE
- `TODO/partnerships_specs/TODO_un_ocha_partner.md`: 0/7 → 7/7 ✅ COMPLETE
- `TODO/partnerships_specs/TODO_newsrooms.md`: 0/9 → 9/9 ✅ COMPLETE
- `TODO/partnerships_specs/TODO_universities.md`: 0/9 → 9/9 ✅ COMPLETE
- `TODO/partnerships_specs/TODO_isw_partner.md`: 0/7 → 7/7 ✅ COMPLETE
- `TODO/partnerships_specs/TODO_cloud_aws_cf.md`: 0/8 → 8/8 ✅ COMPLETE

## Artifacts created
- `docs/risk/risk-register.md`
- `docs/release/release-management.md`
- `docs/partnerships/partnerships.md`
