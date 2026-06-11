# Partnerships

> **Status:** v1.0 — partnership strategy + per-partner specs. Review annually.
> **Covers:** DeepStateMAP, Bellingcat, Mapbox, Anthropic, Planet/BlackSky/Capella, UN OCHA, Anchor Newsrooms, Universities, ISW, Cloud (AWS + Cloudflare).

---

## Partnership Philosophy

Aegis Lens is a data-driven intelligence platform. Partnerships are how we extend our coverage, credibility, and reach beyond what we can build alone. We invest in partnerships where the mutual benefit is clear and the editorial/operational independence of both parties is protected.

**Tiers:**
- **Strategic:** Mission-aligned, mutual benefit, high investment (DeepStateMAP, Bellingcat, UN OCHA)
- **Commercial:** Vendor relationships with co-marketing potential (Mapbox, Anthropic, AWS, Cloudflare)
- **Academic / think-tank:** Citation + credibility building (ISW, universities, research centers)
- **Editorial:** Content distribution + joint investigations (anchor newsrooms)
- **Data:** Bi-directional data access (Planet/BlackSky/Capella satellite, NASA FIRMS)

---

## Part 1 — DeepStateMAP

> "Partnership > scrape. Earn this one."

### 1.1 Outreach + Initial Alignment

- Initial contact: direct outreach to DeepStateMAP core team (Signal/Telegram)
- Introductory call agenda: explain Aegis Lens mission, how we differ from LiveUAmap, what we've already built, what we want to offer them
- Come with value first: offer free Enterprise access, data analytics on their frontline data, engineering support for features they want
- Do not lead with "we want your data" — lead with "how can we support your work?"

**Timeline:** Phase 1 outreach. No revenue expectation from this partnership.

### 1.2 Mutual-Benefit Proposal

What we offer DeepStateMAP:
- Analytics on their published data: trend analysis, media pickup patterns, source attribution
- Tooling collaboration: if they want a feature, we build it for them first
- Distribution: we amplify their maps and reports to our analyst + journalist audience
- Credit: every event sourced from DeepStateMAP carries explicit attribution in the event detail and API response

What DeepStateMAP gains:
- Larger reach to Western OSINT and journalist audiences
- Analytics they don't currently have
- Engineering resources for requested features
- Potential future revenue share if their data is part of enterprise data packages (with their approval)

### 1.3 Formal Data-Use Agreement

Legal document covering:
- **License type:** Attribution-required, non-commercial first; commercial use requires separate agreement
- **Attribution:** Every public-facing display of DeepStateMAP data must show "Source: DeepStateMAP" with a link
- **Redistribution:** Aegis Lens may aggregate and display data; cannot resell raw DeepStateMAP data as a standalone product
- **Territory:** Global (DeepStateMAP data is public; agreement formalizes the relationship)
- **Termination:** Either party may terminate with 30 days notice; Aegis Lens retains data already processed but cannot ingest new data

*Needs counsel review before use.*

### 1.4 Co-Branded Content Options

- Joint year-in-review report (annual): "Ukraine Conflict in 2026: By the Numbers" — co-authored
- Shared social media content: mutual amplification of key investigations
- Joint press release for partnership announcement

### 1.5 Joint Press Moments

- Partnership announcement: coordinated with a significant news event to maximize reach
- Year-end data report: published in December, annual tradition
- When a major investigation uses their data: co-released

### 1.6 Mutual API Exchange

- DeepStateMAP exposes their data API to Aegis Lens (beyond what's publicly available)
- Aegis Lens exposes our API to DeepStateMAP (event confidence, source attribution, NLP analysis) for their internal use
- Rate limits: negotiated based on their usage patterns; free for editorial use

### 1.7 Mutual Donor / Funding Visibility

Both organizations are funded (in part) by donations and grants. Agreement to:
- Not compete for the same specific grant program without mutual awareness
- Reference each other as partners in funding applications where relevant
- If a donor funds both: coordinate to avoid duplication

### 1.8 Renewal Cadence

Annual partnership review (October each year):
- Has the relationship been mutually beneficial?
- Any data-use issues to resolve?
- Any new technical collaboration to propose?
- Update the data-use agreement if needed

### 1.9 Editorial Firewall

The DeepStateMAP editorial team's content and positions are entirely theirs. We do not:
- Influence their coverage decisions
- Request corrections to their published content
- Publish commentary that contradicts their analysis without a joint discussion first

Our data is ours; theirs is theirs. We display it faithfully.

---

## Part 2 — Bellingcat

> "Bellingcat = methodology gold standard. Aligning publicly = trust signal."

### 2.1 Outreach + Alignment

- Initial contact: cold outreach via their published contact + conference meeting (GIJN, OSINT Summit)
- Frame: "We built tools to do at scale what your analysts do by hand. We'd like your input on our methodology."
- Offer: free Enterprise access; methodology review by their team; credit in our methodology docs

### 2.2 Shared Methodology References

- Aegis Lens methodology pages link to Bellingcat's published guides as references
- Bellingcat's methodology documentation links to Aegis Lens for examples of automated OSINT at scale
- Co-written methodology comparison piece: "Manual OSINT verification vs. AI-assisted verification — where automation helps and where it doesn't"

### 2.3 Tooling Collaboration

- Joint development of geolocation aids: shadow analysis tools, street-view integration, satellite landmark matchers
- If Bellingcat analysts want a feature in Aegis Lens: fast-track to our roadmap
- Bellingcat analysts can use Aegis Lens internally for their investigations (free Enterprise access)

### 2.4 Co-Published Investigations

When both teams are working on related investigations:
- Option to co-publish (with clear credit and editorial independence for each team's contributions)
- Co-publication model: each team reviews and approves their sections only
- Revenue from any resulting media attention is managed independently

**Cadence:** Opportunity-based, not scheduled.

### 2.5 Mutual Press Recognition

- When citing each other in press releases or public statements: always specific and accurate
- Aegis Lens does not speak on behalf of Bellingcat; Bellingcat does not speak on behalf of Aegis Lens
- If press asks "what do you think of Bellingcat?" — positive, accurate, no exaggeration

### 2.6 Shared Training / Academy Modules

- Bellingcat analysts contribute guest lessons to the Aegis Lens Academy
- Aegis Lens engineers contribute a "Building OSINT tools" module to Bellingcat's training
- Revenue from paid Academy content: negotiated per module (revenue share or flat fee)

### 2.7 No Exclusivity (Their Independence Respected)

This partnership is explicitly non-exclusive:
- Bellingcat may partner with or use any other intelligence platform
- They are not our "official OSINT partner" — they are an independent organization with their own mission
- We do not require editorial review of their content before they publish

### 2.8 Renewal Cadence

Annual review (same timing as DeepStateMAP — October):
- Is the relationship working?
- Any tooling collaboration to formalize?
- Any joint publication opportunities for the coming year?

---

## Part 3 — Mapbox

> "Mapbox bills scale brutally. Negotiate before hitting the wall."

### 3.1 Move from PAYG to Commercial Commitment Tier

- At $10K/month Mapbox spend: initiate negotiation for commitment-based pricing
- At $25K/month: renegotiate; explore enterprise contract with custom terms
- Target: 30–40% discount vs. PAYG through annual commitment

**Current baseline:** PAYG starter plan. Negotiate before we need to (lower burn = stronger negotiating position).

### 3.2 Negotiate Per-Tile Pricing at Scale

Key negotiation points:
- Map load pricing (per 1000 loads): target < $0.50 vs $1.20 PAYG
- Style API calls: capped or flat fee
- Satellite raster tiles: per GB cap vs. metered
- Commitment discount: 20% for 12-month, 30% for 24-month
- Burst provisions: automatic burst capacity during major conflict events without overage charges

### 3.3 Co-Marketing Case Study

In exchange for commercial pricing: Mapbox case study published on their site.
- "How Aegis Lens built a real-time conflict intelligence map with Mapbox"
- Includes: technical architecture, layers used, performance metrics
- Approval gate: Aegis Lens reviews before publication

### 3.4 Joint Conference Presence

- Share a speaking slot at Mapbox-sponsored events (State of the Map, FOSS4G)
- Mapbox covers travel for our speaker if we contribute a talk

### 3.5 Map Style Consultation

Request consultation with Mapbox design team on our Dark Tactical style:
- Optimize the style for performance (reduce style layers, consolidate sprites)
- Accessibility review (their a11y team)
- Bilingual label implementation review

### 3.6 Engineering Escalation Path

Enterprise contract includes:
- Named Solutions Architect (contact within 24h for P1 issues)
- Priority bug reporting queue
- Access to Mapbox beta features before public release

### 3.7 MapLibre Fallback Maintained

We maintain a fully functional MapLibre GL JS fallback at all times:
- Same custom style JSON works with MapLibre (GL JS compatible)
- Self-hosted tiles from OpenMapTiles / Protomaps for the Ukraine coverage area
- Fallback activated within 4h if Mapbox becomes unavailable or too expensive

This is our negotiating leverage and our risk mitigation.

### 3.8 Annual Review

Every October: Mapbox spend vs. commitment discount vs. alternative tile providers. Decision to renew, renegotiate, or partially migrate.

---

## Part 4 — Anthropic (Claude)

> "LLM provider lock-in is a real risk. Hedge structurally; partner emotionally."

### 4.1 Move from Pay-Go to Committed-Spend Tier

- At $5K/month Claude spend: contact Anthropic sales for committed spend agreement
- Committed spend typically provides: 15–25% discount, priority capacity, named TAM
- Annual commitment: evaluate in Q4; renew or renegotiate each January

### 4.2 Prompt-Caching Enablement + Tuning

Claude's cache-read pricing is ~10% of full input pricing. Priority optimization:
- System prompts (methodology context, entity schemas, event taxonomy): cached in all requests
- Conversation history in copilot: cache-optimized (write once; read many)
- Event batch summaries: cache the event context block across related queries

**Target:** > 70% of tokens served from cache on repeat patterns.

### 4.3 Capacity Commitments for Traffic Spikes

During major conflict events (Kyiv missile strikes, Odesa port attacks), our copilot usage spikes 5–10×:
- Negotiate a burst capacity provision: guaranteed capacity at committed tier rate (no throttling) for events flagged as breaking
- Alternatively: secondary OpenAI budget reserved for burst periods
- SLA: < 2s response time from Claude API maintained during burst

### 4.4 Joint Case Study

With our consent:
- Anthropic can publish a case study on how Aegis Lens uses Claude for conflict intelligence
- Our approval gate: we review before publication; we may redact specific technical details
- Timing: when we reach 1,000 MAU or Series A announcement (whichever first creates a compelling narrative)

### 4.5 Early Access to New Models / Features

Enterprise partnership gives us:
- Early access to new Claude models before public GA (valuable for evaluation)
- Access to new features (long-context, tool use improvements, extended context caching)
- Participation in Anthropic's research partner program if invited

### 4.6 Engineering Escalation Contact

Named technical contact at Anthropic for:
- Production API issues > 5 min downtime
- Rate limit issues during crisis events
- Model behavior bugs (hallucination patterns specific to our domain)

Response SLA: 2 business hours for production issues.

### 4.7 Safety + Responsible-AI Alignment Public Statement

Publish a joint statement (or Aegis Lens unilateral statement) on our AI use policy:
- "We use Claude to assist analysts, not replace them. Every AI output is human-reviewed before publication."
- Aligned with Anthropic's Responsible Scaling Policy and our own AI disclosure page
- Published on our Trust Center and methodology page

### 4.8 Multi-Provider Hedge

We maintain functional integrations with all three major providers:
- **Claude (Anthropic):** primary for copilot, summarization, reasoning
- **GPT-4o (OpenAI):** secondary for burst; batch classification at lower cost
- **Open-weights (Llama 3, Mistral):** for sovereignty-sensitive government deployments; offline/airgap use

Provider abstraction: `LLMProvider` interface ensures switching providers doesn't change business logic.

---

## Part 5 — Planet Labs / BlackSky / Capella (Commercial Satellite)

> "Commercial satellite = high unit cost. Pass-through pricing to enterprise customers."

### 5.1 Phase 2: Planet SkySat (Revisit + Cost Evaluation)

**Capability:** Planet SkySat provides 50cm resolution imagery, multiple revisits per day.

**Evaluation (Phase 2):**
- Cost per sq-km for Ukraine coverage area
- Tasking lead time for conflict-zone imagery
- License terms for intelligence product use (commercial redistribution restrictions)
- Integration into our satellite imagery layer

**Decision criteria:** If per-sq-km cost at our target coverage area (eastern Ukraine front line, ~20,000 sq km) is < $500/month at the resolution tier we need, proceed to contract.

### 5.2 Phase 3: BlackSky (Rapid Revisit)

**Capability:** 8–15 minute revisit rates; critical for time-sensitive events.

**Use case:** Near-real-time before/after imagery for confirmed strikes. Black Sea maritime monitoring.

**Evaluation (Phase 3):** Same criteria as Planet + specific rapid-revisit pricing for tiered delivery (1h tasking vs. 4h standard).

### 5.3 Phase 3: Capella (SAR — Night/Cloud)

**Capability:** Synthetic Aperture Radar — works at night, through clouds and smoke.

**Use case:** Post-strike damage assessment when optical imagery is unavailable. Particularly valuable in winter conflict periods with cloud cover.

**Evaluation:** SAR licensing terms; export restrictions (SAR can be export-controlled for certain resolution thresholds); integration complexity.

### 5.4 Per-Vendor Commercial Terms

For each provider, negotiate:
- Annual subscription vs. pay-per-scene
- AOI subscription: fixed monthly fee for a defined geographic area (preferred for Ukraine coverage)
- Burst access: credit-based system for out-of-AOI tasking
- Exclusivity: we do not want exclusivity on their data; we want reliability + favorable pricing

### 5.5 AOI Subscription Pricing Model Pass-Through

Enterprise customers who want commercial satellite access:
- We charge a markup (15–25%) over our provider cost
- AOI subscriptions sold as an add-on to Enterprise plans
- Customer's AOI defined in our system; tasking automated when events occur in the AOI

This avoids Aegis Lens absorbing all satellite costs — pass-through with reasonable margin.

### 5.6 License Compliance per Scene

Each provider has specific redistribution terms:
- Most commercial satellite providers: permit display in a product (our map) but prohibit raw data resale
- We must not: distribute raw satellite scenes to customers; only rendered tiles and value-added products
- Customer AUP: explicitly prohibits customers from using our satellite data outside our platform or re-distributing it

### 5.7 Per-Scene Attribution

Every satellite-derived image displayed must credit:
- Provider name (e.g., "© 2026 Planet Labs PBC")
- Date + time of capture
- Resolution (if permitted by provider)

Attribution displayed in the map layer info panel and in any PDF export.

### 5.8 Multi-Vendor Abstraction Layer

Our `SatelliteProvider` interface:
- `tasking(aoi: BBox, priority: 'standard' | 'rush'): Promise<TaskingID>`
- `getScene(taskingId: TaskingID): Promise<SceneURL>`
- Implemented by: `PlanetProvider`, `BlackSkyProvider`, `CapellaProvider`
- Fallback order: Planet → Sentinel Hub (free; lower resolution) → NASA FIRMS (fire/thermal only)

### 5.9 Cost Dashboard per Provider

Monthly internal dashboard:
- Cost per scene delivered
- Cost per sq-km covered
- Scenes used vs. contracted
- Projection: current run rate vs. annual commitment

Reviewed by CTO + Finance monthly.

---

## Part 6 — UN OCHA / ReliefWeb

> "Humanitarian credibility = compounding asset. Even if no immediate revenue."

### 6.1 Outreach to OCHA Centre for Humanitarian Data (The Hague)

- Initial contact: Centre for Humanitarian Data team (data@humdata.org)
- Frame: "We want to become a HDX data contributor and explore coordination on humanitarian activations"
- Offer: free access to our verified event data for humanitarian response use; API access for their data teams

### 6.2 HDX Data Provider Status

Humanitarian Data Exchange (HDX) is the UN's open data platform for humanitarian response. Being a listed provider:
- Gives Aegis Lens credibility with the entire NGO and UN ecosystem
- Allows NGOs to access our data directly in their workflows
- Requires: data to be openly licensed (CC-BY 4.0 for our public event subset); regular updates; data quality standards

**Action:** Apply for HDX provider status with our conflict events dataset (public subset, CC-BY 4.0) by Series A.

### 6.3 Activation Co-Deployment

During OCHA emergency activations (Level 3 humanitarian emergencies), Aegis Lens can support:
- Accelerated data feeds for the affected region
- Analyst support (OSINT analyst from our team seconded to OCHA coordination for critical events)
- Free platform access for OCHA staff and their NGO partners during the activation

**Commitment:** Best-effort activation support; formalized in the partnership agreement with specific response SLAs.

### 6.4 Per-Cluster Relationship

OCHA coordinates through "clusters" (logistics, health, protection, shelter, etc.). Build relationships with cluster leads for the Ukraine response:
- Logistics cluster: supply route mapping, infrastructure damage
- Protection cluster: civilian alert data, area denial/access constraints
- Health cluster: hospital damage, healthcare access disruption

**Contact strategy:** Attend OCHA cluster coordination calls as observers; introduce Aegis Lens data capabilities.

### 6.5 NGO-Tier Free-Access Agreement

All NGOs in good standing with OCHA (listed in the Financial Tracking Service) receive:
- Free Pro tier access (during the humanitarian activation period and for 12 months following)
- Application process: verify NGO status via email domain + FTS listing
- Renewal: annual renewal with NGO standing verification

### 6.6 Joint Training (Academy Modules on Humanitarian OSINT)

- Aegis Lens contributes to OCHA's training programs (e.g., IM Officer training)
- OCHA contributes a "Humanitarian data use for OSINT" module to the Aegis Lens Academy
- Joint webinar: "Real-time intelligence for humanitarian response" (targeting OCHA information managers + NGO safety officers)

### 6.7 Mutual Citation Policy

- OCHA/ReliefWeb cites Aegis Lens data in their situation reports (with our methodology link)
- Aegis Lens cites OCHA's situation reports and assessments in our briefings
- Neither party makes statements about the other without prior review

---

## Part 7 — Anchor Newsrooms

> "Anchor newsrooms generate compounding press citations. Invest editorially first; revenue follows."

### 7.1 Target Newsrooms

**Ukraine:**
- Kyiv Independent: English-language, internationally read, conflict-focused — top priority
- Hromadske: Ukrainian-language, investigative, trusted domestically
- Suspilne: Ukrainian public broadcaster; reach across UA

**International wires:**
- Reuters: data team collaboration potential; global reach; citation = global credibility
- AP: similar to Reuters; AP Verify program as entry point
- BBC Verify: UK public broadcaster; verification-forward journalism aligns with our methodology

**United States:**
- New York Times: data journalism / The Upshot / NYT Graphics; hard to reach, high value
- Washington Post: PostData / data desk

**Germany:**
- Der Spiegel: strong investigative reputation; European credibility
- Süddeutsche Zeitung: data journalism team

**Poland:**
- OKO.press: fact-checking + investigative; key UA diaspora reader
- Gazeta Wyborcza: largest Polish daily; foreign news desk covers UA heavily

### 7.2 Per-Partner Deliverables

For each anchor newsroom:

| Deliverable | Description |
|---|---|
| **Free verified-press tier** | Full Pro access for all editorial staff with verified press credentials |
| **Branded embed kit** | Customizable map embed; attributed "Powered by Aegis Lens" + newsroom branding option |
| **Co-publishing rights for select investigations** | Agreed on a case-by-case basis; Aegis Lens provides data; newsroom publishes with credit |
| **Citation generator** | Pre-formatted citation for any event (APA, Chicago, AP style, newsroom's house style) |
| **Dedicated Slack channel** | Direct line to Aegis Lens editorial + data team for questions and early-access |

### 7.3 Annual Review per Partner

Every October:
- Is the partnership generating citations?
- Is the newsroom using the embed kit? How much traffic?
- Any co-publishing opportunities for the coming year?
- Any editorial concerns we need to address?

### 7.4 Joint Launch Moments

- Year-end review: "2026 Conflict in Data" — co-published with 2–3 anchor newsrooms
- Breaking investigation: when a major verified investigation is ready, offer anchor newsrooms a 24-hour embargo before public release in exchange for the first published citation

---

## Part 8 — Universities & Research Centers

> "Academic credibility takes years to build. Start Phase 1."

### 8.1 Target Institutions

**UK / US think tanks + research centers:**
- RUSI (Royal United Services Institute, UK): defence and security research; conflict intelligence aligned
- IISS (International Institute for Strategic Studies, UK): Military Balance; strong conflict data
- CSIS (Center for Strategic and International Studies, US): geopolitics + technology policy
- Brookings Institution (US): Ukraine focus since 2022
- RAND Corporation (US): conflict analysis methodology; potential government-contract reference

**European policy research:**
- SWP (Stiftung Wissenschaft und Politik, Berlin): EU and NATO policy
- DGAP (Deutsche Gesellschaft für Auswärtige Politik, Berlin): German foreign policy
- IFRI (Institut français des relations internationales): French geopolitics + Ukraine

**Ukrainian + regional:**
- Kyiv-Mohyla Academy: Ukraine's most respected research university; conflict studies
- Kyiv School of Economics: economic + security analysis; Dr. Tymofiy Mylovanov network
- NATO StratCom CoE (Riga): strategic communications + disinformation; methodology partner

**General conflict/security academia:**
- London School of Economics (LSE): conflict economics
- Sciences Po (Paris): European security
- Georgetown University (Walsh School): conflict + intelligence studies

### 8.2 Free Academic Tier

All university and research institution researchers receive:
- Free Pro tier with API access (limited rate)
- DOI-citable dataset releases for published research
- Application: institutional email + active researcher status (PhD student, faculty, or research staff)

**Academic usage monitoring:** We may publish aggregate statistics on how academic partners are using our data (with their consent) — builds credibility.

### 8.3 DOI-Citable Dataset Access

- Quarterly dataset releases: conflict events (public subset, CC-BY 4.0)
- Each dataset release has a DOI assigned (via Zenodo)
- Format: CSV, JSON-LD, GeoJSON (with metadata schema)
- Versioned: `aegis-conflict-events-2026-Q2-v1.0`
- Citation format: "Aegis Lens. (2026). Ukraine Conflict Events Dataset Q2 2026 (v1.0). [Data set]. Zenodo. https://doi.org/10.5281/zenodo.XXXXX"

### 8.4 Co-Authored Papers (Annual Goal: 2–3)

- Identify research questions where our data provides unique insight (verification speed, source reliability patterns, geographic coverage)
- Propose to research partners: "We have the data; you have the methodology and publication track record"
- Author credit: Aegis Lens credited as data contributor + co-author if analysis is shared
- Target journals: Conflict and Health (BMC), Global Crime, Intelligence and National Security

### 8.5 Joint Webinars

- Quarterly: invite a researcher to present their findings using Aegis Lens data
- Annual: "OSINT and Conflict Research" symposium (Aegis Lens-hosted, partners present)

### 8.6 Visiting-Fellowship Potential (Phase 3)

At Phase 3 scale (Series B, > 40 employees):
- Host a visiting researcher for 3–6 months (embedded in our editorial team)
- Mutual benefit: they contribute to our methodology; we give them data access and a publication platform
- Funded by: a research grant applied for jointly

### 8.7 Academic Relations Lead

- Phase 1–2: handled by CEO + editorial team on a part-time basis
- Phase 2+: hire an Academic Relations Manager (part-time contractor; 20h/week)
- Phase 3: full-time position

### 8.8 Annual Academic Conference Presence

Target 2 conferences per year:
- APSA (American Political Science Association) — conflict studies panels
- ISA (International Studies Association) — international security panels
- EISA (European International Studies Association) — EU conflict research

At each: present a data paper; meet potential co-authors; build relationships.

### 8.9 Per-Partner Renewal Cadence

Annual review per institution:
- Papers published using our data?
- Ongoing usage of the academic API tier?
- New collaboration opportunities?
- Update data agreements if scope changes

---

## Part 9 — ISW (Institute for the Study of War)

> "ISW partnership = legitimizing for Western enterprise + gov sales."

### 9.1 Outreach + Meeting (DC-Based)

- Initial contact: via DC policy network or cold outreach to ISW Research team
- Frame: "We automate in minutes what your analysts confirm in hours. Let's compare methodology."
- Offer: free Enterprise access; methodology review; offer to surface their analysis in our AI copilot responses

### 9.2 License Clarification on ISW Outputs

ISW publishes under a Creative Commons license (CC-BY-NC). Specific questions:
- Can we aggregate and display ISW battlefield assessments in our platform?
- What attribution is required?
- Commercial use (our enterprise subscription revenue) — does CC-BY-NC restrict us? (May require a separate commercial license negotiation)

*Needs legal review before ISW data is integrated.*

### 9.3 Cross-Citation Policy

- Aegis Lens copilot responses cite ISW analyses when relevant (with link)
- ISW maps and assessments linked from our region pages (where their assessments cover the same area)
- ISW cites Aegis Lens data in their event tracking when we have faster or more granular data

### 9.4 Co-Published Analytical Pieces (Annual)

Annual co-authored piece:
- "Year in Conflict Data: What OSINT Tells Us That Traditional Analysis Missed"
- Published on both platforms; distributed to shared media list
- Each team retains editorial control over their sections

### 9.5 Cross-Link Program

- ISW assessment page for a region → links to "Live Aegis Lens map of this region"
- Aegis Lens region page → links to "ISW's latest assessment for [region]"

Increases traffic for both; SEO benefit (mutual DA improvement from high-authority cross-links).

### 9.6 Joint Events / Webinars

Quarterly: ISW researcher joins an Aegis Lens webinar to present their analysis alongside our data visualization.

### 9.7 Renewal Cadence

Annual review (October): citation counts, cross-link traffic, any new collaboration opportunities.

---

## Part 10 — Cloud (AWS + Cloudflare)

> "Cloud credits = real runway. Apply early."

### 10.1 AWS Activate for Startups (Credits)

**Eligibility:** Early-stage startup; not previously received AWS Activate credits.

**Apply via:** AWS Activate portal or via an AWS-partnered accelerator (YC, Techstars, etc.) for up to $100K in credits.

**Priority:** Apply immediately. Credits burn fast on GPU/ML workloads and data storage.

**Target credits:** $25K–$100K depending on tier. Covers: EC2 for Kubernetes nodes, RDS Postgres, S3 storage, SageMaker for ML, CloudFront CDN.

### 10.2 AWS Partner Network (When Scale)

At $250K+ ARR or 50+ enterprise customers:
- Apply for AWS Partner Network (APN) Independent Software Vendor (ISV) tier
- Benefits: access to co-selling with AWS sales teams, marketplace listing, go-to-market support
- AWS marketplace listing: allows enterprise + gov customers to purchase through existing AWS spend commitments

### 10.3 AWS Solutions Architect Engagement

At committed spend > $10K/month:
- Request a dedicated AWS Solutions Architect (free with enterprise support plan)
- Use for: architecture review (Well-Architected Framework), cost optimization, scaling guidance

### 10.4 Co-Published Case Study (AWS)

In exchange for credits or APN support:
- AWS case study on how Aegis Lens uses AWS for real-time conflict intelligence
- Published on AWS's customer case study site + our blog
- Approval gate: Aegis Lens reviews before publication

### 10.5 Cloudflare for Startups (Credits)

**Apply via:** Cloudflare for Startups program.

**Target credits:** $500/month × 12 months = $6,000 in credits.

**Covers:** Workers (edge computing for the map tile serving), CDN bandwidth, WAF, DDoS protection, R2 object storage.

**Apply immediately** — eligibility criteria: early-stage startup.

### 10.6 Cloudflare Partner Program

At > $1K/month Cloudflare spend:
- Move to Cloudflare's Pro or Business plan with negotiated pricing
- Access to Cloudflare for Teams for internal zero-trust access
- Priority support tier

### 10.7 Enterprise Contract Phase 2–3

At $5K+/month Cloudflare spend:
- Negotiate enterprise contract with custom pricing
- Key negotiation: Workers bandwidth pricing (we have high edge compute usage)
- SLA: Cloudflare's 99.99% uptime guarantee with credits for downtime

### 10.8 Multi-Cloud Portability Docs

All infrastructure is documented as portable:
- No AWS-proprietary services used (no Lambda-only, no DynamoDB, no Kinesis without S3-compatible fallback)
- Terraform modules work on AWS, GCP, and Hetzner with minimal changes
- Self-hosted Postgres as an alternative to RDS in all architecture diagrams

**Internal docs:** `infra/docs/multi-cloud-portability.md` — updated when any new AWS service is added.

### 10.9 Hetzner / OVH for Batch as Cost Hedge

Non-latency-sensitive workloads (batch ML inference, historical data processing, cold storage) run on Hetzner:
- ~50–60% cheaper than AWS for compute
- EU-based (data residency advantage for EU customers)
- Used for: dbt transformations, historical event reprocessing, model fine-tuning

No Hetzner dependency for latency-sensitive paths (map tiles, API, real-time ingest).
