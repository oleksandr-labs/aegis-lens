# Risk Register

> **Status:** v1.0 — strategic risk tracking. Board-reviewed quarterly.
> **Covers:** Master register, Regulatory, Competitive, Geopolitical, Technical risks.
> **Format:** Risk · Category · Likelihood · Impact · Owner · Mitigation · Status

---

## Part 1 — Master Risk Register

> "Risks don't go away; they hide. Force quarterly visibility."

### 1.1 Risk Rating Scale

| Score | Likelihood | Impact |
|---|---|---|
| 1 | Rare (< 5% probability in 12 months) | Minimal (operational nuisance) |
| 2 | Unlikely (5–20%) | Minor (recoverable; < 1 week disruption) |
| 3 | Possible (20–50%) | Moderate (1–4 week disruption; < $100K cost) |
| 4 | Likely (50–80%) | Significant (multi-month disruption; $100K–$1M cost) |
| 5 | Near-certain (> 80%) | Critical (existential; > $1M cost or company-ending) |

**Risk score = Likelihood × Impact.** Scores ≥ 12 require immediate action plan. Scores 6–11 require quarterly monitoring. Scores ≤ 5 are monitored annually.

### 1.2 Master Register (Current)

| # | Risk | Category | Likelihood | Impact | Score | Owner | Mitigation | Status |
|---|---|---|---|---|---|---|---|---|
| R01 | EU AI Act compliance burden (GPAI + high-risk classification) | Regulatory | 4 | 3 | 12 | Legal + CEO | Legal counsel monitoring; AI impact assessment; comply-from-day-1 posture | **Active — monitor** |
| R02 | Hostile-state cyberattack against infrastructure or staff | Geopolitical | 4 | 5 | 20 | CISO + CEO | Multi-region infra, staff OpSec training, zero-trust architecture | **P0 — active mitigation** |
| R03 | LLM API cost spike (Anthropic/OpenAI pricing change) | Technical | 3 | 4 | 12 | CTO | Multi-provider hedge; open-weights fallback; prompt-caching optimization | **Active — hedged** |
| R04 | Palantir / Dataminr enters consumer OSINT market | Competitive | 3 | 4 | 12 | CEO + Product | Speed + verification depth moat; UA-specific coverage advantage | **Monitor** |
| R05 | Staff member in Ukraine targeted by hostile state | Geopolitical | 3 | 5 | 15 | CEO + Security | Staff anonymity policy; remote-safe defaults; K&R insurance Phase 2 | **P0 — active mitigation** |
| R06 | Key source (Telegram channel) goes dark or bans us | Technical | 4 | 3 | 12 | Ingest team | 20+ source diversification; OVA + CERT-UA direct feeds; scrape-free API approach | **Monitor** |
| R07 | Reputational damage from AI hallucination published as fact | Reputational | 3 | 4 | 12 | NLP team + Editorial | Human-review gate; confidence threshold; prominent AI disclosure | **Active — gates in place** |
| R08 | Export-control violation (EU/US dual-use data concerns) | Regulatory | 2 | 5 | 10 | Legal | Legal opinion on data classification; no targeting-level data; customer AUP | **Monitor** |
| R09 | Founder / lead engineer single-point dependency | Key-person | 3 | 4 | 12 | CEO + Board | Knowledge transfer docs; key-hire plan; vesting acceleration on key-person exit | **Active** |
| R10 | Financial: LLM inference cost exceeds ARR growth | Financial | 3 | 4 | 12 | CFO + CTO | Prompt caching; open-weights fallback; usage metering; cost per event tracking | **Monitor** |
| R11 | Security breach / data exfiltration | Security | 3 | 5 | 15 | CISO | SOC 2 controls; pen test annually; zero-trust; MFA enforced; security incident runbook | **Active mitigation** |
| R12 | Mapbox pricing shift makes unit economics unviable | Technical | 3 | 3 | 9 | CTO | MapLibre fallback maintained; negotiate commitment tier before $1M ARR | **Monitor** |

### 1.3 Quarterly Risk Review

At each board meeting, the CEO presents:
1. Risk register (all entries, updated scores)
2. Any new risks added since last quarter
3. Any risks elevated (score increased) or retired (score < 3 or mitigated)
4. Action plans for any risk scoring ≥ 12 that lacks one

Board may add risks; CEO owns the register.

### 1.4 Per-Risk Action Plan (When Status Worsens)

When a risk score increases, a written action plan is required within 14 days:
```
Risk: [ID + title]
Score change: [old] → [new]
Trigger: What caused the score change
Immediate actions (next 30 days): ___
Medium-term actions (next 90 days): ___
Owner: ___
Review date: ___
```

### 1.5 Public-Safe Subset in Trust Center

A curated subset of risks (no sensitive details, no internal scores) is published at `/trust` as part of our transparency commitment. Published subset covers: regulatory posture, AI disclosure, data security commitment, and government-access policy. *(✓ Sprint 2.3)*

---

## Part 2 — Regulatory Risk

> "Regulatory changes are slow until they aren't. Watch DSA + AI Act closely."

### 2.1 EU AI Act

**Scope:** Regulation (EU) 2024/1689, fully applicable from 2026.

**Classification risk:** Aegis Lens's AI features may fall under:
- **General-Purpose AI (GPAI):** Our LLM-based copilot and classification models are likely GPAI systems. Obligations include: documentation, transparency to users, copyright compliance for training data.
- **High-risk system (Annex III):** If our data is used in "law enforcement" or "migration" contexts, obligations escalate to conformity assessment, human oversight requirements, and registration in the EU database.

**Current stance:**
- Assume GPAI obligations apply from day 1
- Do not market to EU law enforcement for policing purposes (avoids high-risk classification)
- Maintain model cards for all deployed AI systems
- Implement technical documentation per Article 53 (GPAI providers)
- Register in the EU GPAI model database when required (likely 2025–2026 threshold)

**Action:** Engage EU AI Act specialist counsel by Series A. Budget: €15K–25K for initial compliance assessment.

**Owner:** Legal + CTO. **Review:** Quarterly with counsel.

### 2.2 EU Digital Services Act (DSA)

**Scope:** Regulation (EU) 2022/2065. Applies to online platforms and intermediaries.

**Applicability:** Aegis Lens as a platform where users share content (OSINT submissions, case files) may qualify as an "online platform" under DSA. Micro-enterprise exemption applies if < 45 million EU monthly active users AND < €10M annual revenue (likely safe for 3–4 years).

**Key obligations when exemption lapses:**
- Transparency report on content moderation (annual)
- Single point of contact in the EU
- Notice-and-action mechanism for illegal content
- Advertising transparency (if we run ads — currently not planned)
- Risk assessment for "systemic risks" (VLOP threshold: 45M EU MAU — very unlikely for us)

**Current action:** Build content moderation transparency report infrastructure now (reuses our community metrics + moderation reports already planned). Register EU representative when approaching 45M EU MAU.

**Owner:** Legal + Community Lead. **Review:** Annually.

### 2.3 UK Online Safety Act

**Scope:** UK OSA 2023. Applies to UK-accessible services with user-generated content.

**Applicability:** Any service accessible in the UK with UGC. Our community features (OSINT contributions, bounty submissions) likely qualify.

**Key obligations:**
- Risk assessment for illegal content and content harmful to children
- Safety duties: prevent illegal content; age-appropriate design for under-18s (mitigate: verify professional credentials at signup)
- Transparency report (annual, once OFCOM publishes codes of practice)
- Named UK contact for compliance

**Current action:** Professional-credential-only signup mitigates most CSAM and harmful-content risks. Monitor OFCOM codes of practice publication (expected 2025). Engage UK counsel when UK revenue > £100K.

**Owner:** Legal. **Review:** Annually + on OFCOM code publication.

### 2.4 US Privacy Laws + Federal Proposals

**State laws:** California (CCPA/CPRA), Colorado (CPA), Virginia (VCDPA), Texas (TDPSA), and growing. No comprehensive federal law yet.

**Key obligations (CCPA as benchmark):**
- Privacy policy disclosures (what data collected, how used, third parties)
- Right to deletion, correction, access (data subject requests)
- No selling personal data (we don't — confirm in DPA)
- Opt-out of sharing for cross-context behavioral advertising

**Federal risk:** APRA (American Privacy Rights Act) is in active discussion. If passed, would preempt state laws and impose national standards.

**Current action:** Privacy policy designed to CCPA+CPRA standard from day 1 (most restrictive US standard). DSR (Data Subject Request) process in place. No data selling or advertising behavioral profiling. Monitor APRA progress quarterly.

**Owner:** Legal + Engineering (DSR implementation). **Review:** Quarterly.

### 2.5 Export Control (EAR / EU Dual-Use)

**Risk:** Satellite imagery, precise geolocation data, and conflict-event data may trigger US Export Administration Regulations (EAR) or EU Dual-Use Regulation (2021/821) if exported to sanctioned or embargoed parties.

**Our posture:**
- We do not export targeting-level data (no grid coordinates for active military positions)
- Commercial satellite imagery provided only at resolutions publicly available from Sentinel-2 / NASA FIRMS (no military-grade sub-meter SAR)
- Customer AUP prohibits use for military targeting
- ITAR (International Traffic in Arms Regulations): likely not applicable (we are an information service, not a defense article manufacturer), but obtain legal opinion before $1M ARR

**Action:** Legal opinion on EAR/ITAR classification before first US government or defense-sector contract. Annual review. Customer screening against denied parties list via Sanctions API (Chainalysis / Dow Jones Watchlist).

**Owner:** Legal + Sales (customer screening). **Review:** Before any defense/gov contract + annually.

### 2.6 Sanctions Screening (OFAC / EU / UK)

All customers and partners screened against:
- OFAC Specially Designated Nationals (SDN) list
- EU Consolidated Financial Sanctions List
- UK OFSI Consolidated List

**Process:**
- At signup: automated name/email/domain check via Chainalysis or equivalent API
- At contract: manual review for Enterprise/Gov customers
- Ongoing: quarterly re-screen of active customers (using webhooks from sanctions list providers for real-time alerts on new designations)

**False positive policy:** If a customer appears to be mis-screened, they may appeal via legal@aegislens.io. Appeal reviewed within 5 business days by legal + CEO.

### 2.7 Defamation Law per Major Market

Our data contains unverified claims from sources (before verification completes). If we publish a false claim that harms an identified person or organization, we face defamation exposure.

**Mitigations:**
- Confidence score displayed on every event — unverified events clearly labeled
- Editorial review before any AI-generated content is published as fact
- Retraction and corrections policy publicly documented (see `docs/data/workflow-orchestration.md`)
- UK defamation: "responsible journalism" defense requires showing serious harm and publication in public interest — our methodology documentation supports this
- US defamation: actual malice standard for public figures; neutral reportage doctrine protects aggregation of public statements

**Action:** Legal review of defamation exposure by counsel in UK and Germany (highest-risk jurisdictions) before public launch. Insurance: media liability / E&O policy.

**Owner:** Legal + Editorial. **Review:** On policy changes + annually.

### 2.8 Press / Source-Protection Laws

Countries vary widely on journalist source protection:
- Ukraine: press law protects journalists and sources; Aegis Lens contributors who are journalists may invoke this
- UK: Police and Criminal Evidence Act + Contempt of Court Act; courts can compel disclosure of sources in serious crime cases
- Germany: strong press law protection (Tendenzschutz); generally robust
- US: Federal First Amendment + state shield laws (vary by state)

**Policy:** Aegis Lens treats all OSINT contributors as potential sources and does not disclose contributor identities to third parties absent a court order. Any court order for contributor identity data is reviewed by legal counsel before compliance; we notify the affected contributor if legally permissible to do so.

### 2.9 Counsel-Led Quarterly Review

Every quarter, legal counsel reviews:
- Regulatory landscape changes in the preceding quarter
- New enforcement actions against comparable platforms
- Status of pending legislation in key jurisdictions
- Any actual or threatened legal action against Aegis Lens

**Output:** Brief memo to CEO + board. Material changes escalated immediately.

### 2.10 Per-Regulation Early-Warning Subscriptions

| Source | What it covers | Who reads it |
|---|---|---|
| EU EUR-Lex alerts | AI Act, DSA, Data Act, GDPR amendments | Legal |
| OFCOM policy updates | UK OSA codes of practice | Legal |
| OFAC SDN list RSS | Sanctions list changes | Legal + Sales Ops |
| EFF (Electronic Frontier Foundation) | US privacy law developments | Legal |
| Future of Privacy Forum | Global privacy law tracking | Legal |
| IAPP (International Association of Privacy Professionals) | Privacy law newsletter | Legal + Privacy lead |

---

## Part 3 — Competitive Risk

> "The biggest competitive threat is a quiet one. Watch the quiet ones."

### 3.1 Competitive Landscape Map

| Competitor | Threat level | What they have that we don't | What we have that they don't |
|---|---|---|---|
| **Palantir** | ★★★★ | Government contracts, Gotham, massive sales team | Speed for OSINT journalists; open access; community; verification; UA depth |
| **Dataminr** | ★★★★ | Real-time social media firehose, global newsrooms | Verification layer; conflict-specific depth; open academic access |
| **Bloomberg Terminal** | ★★★ | Finance customers, decades of trust, financial data | OSINT + verification; conflict-specific layers; affordable access |
| **Microsoft (Bing Maps + Copilot)** | ★★★ | AI integration budget; Office suite distribution | Specialized conflict intelligence; verification; community; mission |
| **LiveUAmap** | ★★★ | Established UA-specific audience; 10+ years | Verification; AI; API; multi-conflict; analytics; monetization |
| **Jane's / Janes** | ★★ | Defense pedigree; institutional trust | Open access; speed; AI copilot; community; affordability |
| **Maxar / Planet** | ★★ | Satellite imagery quality and archive | Fused intelligence; text + social + satellite; AI synthesis |

### 3.2 Quarterly Competitive Intel Review

**Process:**
1. Monitor competitor product changelogs and press pages (RSS + Google Alerts)
2. Review competitor job postings (signal: new capabilities being built)
3. Review LinkedIn for competitor exec hires and departures
4. Review patent and trademark filings (USPTO, EPO alert)
5. Monitor competitor pricing changes
6. Compile a 1-page competitive digest distributed to product + sales

**Cadence:** Monthly competitive digest; quarterly board presentation.

### 3.3 Defensive Moves

Our structural moats — invest in these before competitive pressure arrives:

| Moat | Why it's hard to replicate | Investment |
|---|---|---|
| **Verification methodology** | Trust takes years; methodology is public; community validates it | Continuous methodology improvement; publish audit results |
| **Knowledge graph depth (UA)** | Thousands of entities, relationships, historical context | KG investment ongoing (see `TODO/data/TODO_knowledge_graph.md`) |
| **Community of contributors** | Network effects; OSINT community is small and sticky | Contributor program + ambassador program |
| **Speed to verified intelligence** | TEVI requires deep pipeline investment | Ingest + AI + verify pipeline |
| **Mission alignment** | Mission-driven employees + customers are harder to poach with money alone | Culture + compensation philosophy |

### 3.4 Per-Segment Competitive Matrix (Updated Quarterly)

For each segment (newsroom / NGO / enterprise / gov), maintain a 5-column table:
- Competitor name
- Their key differentiator for this segment
- Our key differentiator vs. them
- Price comparison
- Win/loss patterns (from CRM data)

Maintained in Notion; updated by sales lead + product lead quarterly.

### 3.5 LinkedIn Watch on Competitor Hiring Patterns

Set up LinkedIn Company Page Alerts for:
- Palantir, Dataminr, LiveUAmap, Janes, Maxar

Watch for: sudden hiring in OSINT, conflict intelligence, Ukrainian language roles, or product/engineering roles that signal a new product direction. New hires often appear 6–12 months before a product announcement.

### 3.6 Patent / Trademark Filings Monitoring

- USPTO: Google Patent Alerts for Palantir, Dataminr, and adjacent surveillance/intelligence companies
- EPO: automated alerts via esp@cenet
- Trademark: EUIPO + USPTO for "Aegis Lens" and close variants to protect our brand

Any relevant filing reviewed by legal within 30 days.

### 3.7 Customer-Side Defection-Signal Monitoring

Signals that a customer may be evaluating a competitor:
- Usage drop > 30% over 30 days
- Champion departure from the customer org
- Competitor trial registered by the same email domain (if detectable via marketing analytics)
- Support ticket asking "can we export all our data?"

CSM receives automated alert when any customer triggers 2+ signals. CSM outreach within 48h.

### 3.8 Counter-Narrative Content

For each major competitor, maintain a "Why choose Aegis Lens over X" comparison page at `/compare/aegis-vs-[competitor]`:
- Honest: acknowledge where they're better
- Specific: data-backed claims (TEVI, verification accuracy, source count)
- Updated when competitor launches materially relevant feature

Also maintain a methodology brief that explicitly contrasts our verification approach with platforms that do not verify.

---

## Part 4 — Geopolitical Risk

> "Our staff in UA / sensitive regions are at real risk. Treat as P0."

### 4.1 Hostile-State Threat Assessment

Aegis Lens is a high-profile open-source intelligence platform tracking a major active conflict. This makes us a target.

| Threat actor | Likelihood of targeting | Likely methods | Priority |
|---|---|---|---|
| **Russian state (APT28, APT29, Sandworm)** | High | Spear-phishing staff; DDoS; info-ops discrediting our data | P0 |
| **Iranian state (IRGC-affiliated)** | Low–Medium | Targeting if we expand to Middle East / Iran coverage | Monitor |
| **Chinese state (APT40, APT41)** | Low | Interest if we acquire high-value intelligence subscribers | Monitor |
| **Non-state actors (pro-Russian groups)** | High | DDoS; doxxing of staff; social media harassment; CIB against our data | P0 |

**Primary threat:** Russian state actors targeting staff (especially UA-based), infrastructure, and attempting to discredit data.

### 4.2 Staff-Safety Protocols per Region

**Ukraine (highest risk):**
- All UA-based staff are encouraged to use pseudonyms for public-facing work
- No public linking of employee's personal identity to Aegis Lens without their explicit consent
- Staff profiles (LinkedIn, Twitter) not required to mention employer
- Emergency extraction plan: 72-hour relocation support if staff reports credible physical threat
- Signal group for UA team: real-time emergency communications channel
- Air-raid protocol: all scheduled work suspended during alerts; async-first

**Outside Ukraine (elevated risk):**
- Any staff traveling to Russia, Belarus, or other high-threat jurisdictions: not permitted without CEO + security advisor approval
- Conference attendance in adjacent regions: security briefing required

**Remote-first advantage:** Most staff are remote, making physical targeting harder. No public office address.

### 4.3 No Staff Travel to High-Risk Jurisdictions

Prohibited without explicit CEO + security advisor approval:
- Russia
- Belarus
- Iran
- North Korea
- Any jurisdiction under active OFAC comprehensive sanctions

For adjacent-risk jurisdictions (Turkey, Georgia, Serbian-aligned areas):
- Standard OpSec briefing required before travel
- Daily check-in protocol while in-country
- Device hygiene (travel device, VPN, no sensitive data)

### 4.4 Per-Country Sanctions Monitoring

**Real-time sanctions monitoring:**
- OFAC SDN list: webhook alerts (within 24h of list changes)
- EU Consolidated Financial Sanctions List: daily update monitoring
- UK OFSI Consolidated List: daily update monitoring

**Quarterly customer re-screening:** All active enterprise and government customers re-screened against current lists. Any match: account suspended pending legal review within 24h.

**New customer screening:** Automated at signup and at contract signing (both points, since enterprise contracts may lag signup by months).

### 4.5 Customer-Screening Sanctions Checks

Workflow:
1. Signup: automated check (name, email domain, IP country) against sanctions lists
2. Enterprise/Gov contract: manual review by legal + sales ops
3. Quarterly re-screen: automated, with human review on any match

Sanctions check tool: Dow Jones Risk & Compliance API or Chainalysis KYT (Know Your Transaction) — evaluated at $1M ARR.

### 4.6 Insurance Posture

| Insurance type | When to obtain | Description |
|---|---|---|
| Cyber liability | Phase 1 (now) | Data breach, ransomware, business interruption |
| Media liability / E&O | Phase 1 (now) | Defamation, errors in published intelligence |
| Directors & Officers | Before first external board member | Personal liability protection |
| Kidnap & Ransom (K&R) | Phase 2 (when UA staff > 5) | UA-specific; covers staff at elevated physical risk |
| Political Risk / CEND | Phase 3 (when gov contracts active) | Coverage for forced closures, expropriation |

**Target:** Cyber + Media Liability secured before public launch. K&R before UA headcount exceeds 5.

### 4.7 Data-Residency Contingencies

If a jurisdiction restricts data processing or requires data localization:
- EU (GDPR): EU-Frankfurt tenant already operational as a contingency
- Ukraine: UA data may be required to stay on UA infrastructure for certain gov contracts → self-hosted deployment option
- US federal: FedRAMP path planned for Phase 3 — currently use AWS GovCloud-compatible architecture as hedge
- Emergency data export: any customer can request a full data export within 30 days of notice of service termination

**Geographic redundancy:** Active region (EU-Frankfurt primary) + warm standby (US-East) + cold backup (S3 cross-region). No customer data stored only in a single jurisdiction.

### 4.8 Source-Protection Protocol

For contributors and sources in high-risk environments (especially UA front-line areas):

- Source identity stored only in an encrypted, access-controlled system (not in the main database)
- Source communication: Signal, Session, or ProtonMail — never standard SMS/email
- No public attribution without explicit, written consent — and even with consent, risk assessment conducted
- If a source signals they may be under surveillance: communication suspended immediately; source advised on protective measures
- Source list is never shared with government customers — this is an explicit prohibition in all contracts

### 4.9 Per-Region Staff Anonymity Policy

Staff may opt into full anonymity:
- Public-facing work attributed to "Aegis Lens editorial team" instead of individual names
- LinkedIn and social profiles: listing employer is optional
- Conference speaking: pseudonym allowed if requested (with full bio visible to conference organizer privately)
- Any public content mentioning staff by name: staff must approve before publication

Anonymity is opt-in; disclosure is never required. For UA-based staff, anonymity is the **default** — disclosure is opt-in.

---

## Part 5 — Technical Risk

> "Hedge structurally. One pricing change ≠ one bad week if you've hedged."

### 5.1 LLM Cost Spike (Anthropic + OpenAI)

**Risk:** LLM inference costs consume > 20% of ARR.

**Current mitigations:**
- Prompt caching: Claude's cache-read pricing at 10% of full input pricing — all static context blocks (system prompts, event schemas, methodology context) are cache-optimized
- Open-weights fallback: NLLB (translation), open embedding models (bge-m3), quantized Mistral/Llama for classification — non-reasoning tasks don't require frontier models
- Usage metering: every copilot query tracked against usage budget; rate-limited on free tier
- Multi-provider hedge: Claude primary → OpenAI GPT-4o secondary → Gemini tertiary (per task type)

**Threshold:** If LLM costs exceed 15% of current MRR, trigger a cost optimization sprint.

**Owner:** CTO. **Review:** Monthly cost dashboard.

### 5.2 LLM API Outage (Multi-Provider Hedge)

**Risk:** Anthropic outage disables AI copilot and classification for hours.

**Mitigation:**
- Circuit breaker: if Anthropic API fails for > 60s, automatic failover to OpenAI
- If OpenAI also fails: degrade gracefully (disable copilot; keyword-only classification; human review queue for all events)
- SLO impact: copilot outage does not affect TEVI if classification degradation is bounded to keyword-only mode
- Status page: immediate incident notification when any LLM provider degrades

**Owner:** CTO + On-call engineer.

### 5.3 Mapbox / Satellite License Shift

**Risk:** Mapbox changes pricing (has happened before) or restricts the use of tiles for intelligence applications.

**Mitigation:**
- MapLibre GL JS (open-source fork of Mapbox GL JS) maintained in the codebase — can serve our custom style JSON from self-hosted tiles
- Planet / Sentinel Hub raster fallback for satellite layer (redundant provider)
- Maptiler as a tile provider alternative (lower cost, similar quality)
- Custom basemap tiles self-hosted for the core Ukraine coverage area (most-used region)

**Trigger for activation:** Mapbox announces > 20% price increase or > 90 days notice of terms change.

**Owner:** CTO + Lead frontend engineer. MapLibre fallback tested quarterly.

### 5.4 Telegram / X API Restrictions

**Risk:** Telegram restricts bot API access or changes ToS to block OSINT aggregation. X (Twitter) has already done this (pricing + API restrictions in 2023).

**Current posture:**
- Telegram: using Bot API (permitted) + manual subscription archiving for high-value channels — not scraping
- X: stopped using X API as primary source due to cost/restriction risk; Reddit, Mastodon, and Bluesky monitored as alternatives for open-web social signals
- Alternative sources: DeepStateMAP direct feed, CERT-UA RSS, OVA Telegram channels (official government accounts — less likely to be restricted)

**If Telegram restricts access:** Activate manual archiving workflow for tier-1 channels; engage DeepStateMAP API as compensating control; reduce Telegram-source reliance to < 30% of event volume.

**Owner:** Ingest team lead. **Review:** On any Telegram policy announcement.

### 5.5 Key Open-Weights Model Deprecation

**Risk:** A model we rely on (e.g., bge-m3 for embeddings, NLLB for translation) is deprecated or significantly changed.

**Mitigation:**
- Pin specific model versions in production; test upgrades in staging
- Maintain multiple embedding model options (OpenAI text-embedding-3-small as fallback for bge-m3)
- Translation: DeepL API primary; NLLB secondary; Argos Translate tertiary (fully offline)
- Model version locked in `packages/nlp/src/model-registry.ts` with a `lastVerified` date field

**Owner:** AI/ML team.

### 5.6 Cloud Vendor Lock-In

**Risk:** AWS increases pricing, changes terms, or becomes unavailable in our operating regions.

**Mitigation:**
- Kubernetes-first: workloads containerized and portable across AWS, GCP, Hetzner
- Terraform IaC: infrastructure declarative and reproducible in any supported cloud
- Hetzner used for batch inference and cost-sensitive workloads (2× cheaper than AWS in EU)
- Data: Postgres on RDS + self-managed Postgres on Hetzner — both options maintained
- Object storage: S3-compatible API (works on AWS, GCP, Cloudflare R2, Hetzner Object Storage) — no AWS-proprietary storage primitives

**Goal:** Any service should be migratable to a new cloud provider within 30 days.

**Owner:** DevOps lead. **Review:** Annually (multi-cloud portability test).

### 5.7 Postgres Scaling Ceiling

**Risk:** Event volume (target 10,000+/hour) + PostGIS + full-text search overwhelm Postgres at scale.

**Mitigation:**
- Read replicas: event queries routed to read replicas; writes to primary
- ClickHouse: analytical queries offloaded to ClickHouse replica (updated via CDC)
- Partitioning: events table partitioned by date (monthly) — historical queries don't touch active partition
- Qdrant: vector embeddings in dedicated vector DB, not Postgres
- Elasticsearch: full-text search via Elasticsearch (not Postgres `tsvector`) at scale
- Citus / pg_partman: horizontal sharding option if vertical scaling hits ceiling

**Scaling trigger:** Run load test quarterly; Postgres capacity review at 5M events/month.

**Owner:** CTO + data engineer.

### 5.8 CDN / WAF Single-Vendor Dependency

**Risk:** Cloudflare (our primary CDN + WAF) experiences an outage or prices us out.

**Mitigation:**
- Static assets: dual-CDN configuration (Cloudflare primary + AWS CloudFront secondary on hot standby)
- WAF: Cloudflare primary; AWS WAF activated as failover
- DNS: Cloudflare DNS with NS records backed up and portable to Route53 within 30 minutes
- DDoS mitigation: both providers offer DDoS protection at CDN layer

**Owner:** DevOps lead.

### 5.9 Source Breakage (Major Upstream Goes Silent)

**Risk:** A key data source (NASA FIRMS, OVA Telegram, ISW) stops publishing or changes format.

**Monitoring:**
- Per-source freshness monitor: if any tier-1 source hasn't produced data in > 30 minutes, Slack alert
- Source health dashboard (public) shows last-updated time per source
- Automated format-change detection: schema validation on ingested data; any new field or missing field triggers a warning

**Response playbook:**
1. Source goes silent: check if the source is temporarily down or permanently changed
2. If permanently changed: update adapter within 4h for tier-1 sources; 48h for tier-2
3. If source is gone: activate compensating sources; communicate to users in status page

**Owner:** Ingest team lead.

### 5.10 Per-Vendor Exit Plan

Each critical vendor has a documented exit plan reviewed annually:

| Vendor | Exit plan | Estimated migration time |
|---|---|---|
| Mapbox | MapLibre GL JS + self-hosted tiles or Maptiler | 2–4 weeks |
| Anthropic Claude | OpenAI GPT-4o primary; open-weights local | 1–3 days |
| AWS | Migrate to GCP or Hetzner via Terraform | 2–4 weeks |
| Cloudflare | AWS CloudFront + WAF activation | 24–48 hours |
| Qdrant | Weaviate or pgvector migration | 1–2 weeks |
| Postgres (RDS) | Self-managed Postgres on Kubernetes | 1–2 weeks |

Exit plans tested annually (tabletop simulation, not necessarily live migration).

### 5.11 Multi-Vendor Abstraction Layer

All vendor integrations are wrapped in adapter interfaces:
- LLM: `LLMProvider` interface → `ClaudeProvider`, `OpenAIProvider`, `OllamaProvider`
- Map tiles: `TileProvider` interface → `MapboxProvider`, `MapLibreProvider`, `MaptilerProvider`
- Object storage: S3-compatible client (works with AWS, GCP, Cloudflare R2, Hetzner)
- Embedding: `EmbedProvider` interface → `OpenAIEmbedder`, `LocalBGEEmbedder`

Switching a provider = swapping the adapter, not rewriting business logic.

**Owner:** CTO + engineering team. **Standard:** New vendor integrations must implement the abstraction interface — no direct SDK calls in business logic.

### 5.12 Quarterly Technical-Risk Review

At each quarterly engineering retrospective:
- Any new technical risks identified in the past quarter?
- Are all per-vendor exit plans current?
- Has any risk score changed (new pricing announced, new outage occurred, dependency deprecated)?
- Load test results: any scaling issues emerging?

Output: updated risk register entries + any new mitigation actions added to the engineering backlog.
