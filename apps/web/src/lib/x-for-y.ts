import type { IndustryView } from "@/lib/industries";

export type LensKey = "ai" | "osint" | "cybersecurity" | "intelligence" | "monitoring";

export type LensCopy = {
  key: LensKey;
  /** Lens label as it appears in the title (e.g. "AI", "OSINT"). */
  label: string;
  /** URL prefix path (without locale). e.g. "/ai-for". */
  routePrefix: string;
  /** What this lens IS, in one sentence. */
  intro: string;
  /** Problem framing, parameterized by industry label. */
  problem: (industry: string) => string;
  /** Applications, parameterized by industry label. Returns 3-5 bullets. */
  applications: (industry: string) => string[];
  /** FAQ pairs, parameterized by industry label. */
  faqs: (industry: string) => { q: string; a: string }[];
};

export const LENSES: Record<LensKey, LensCopy> = {
  ai: {
    key: "ai",
    label: "AI",
    routePrefix: "/ai-for",
    intro:
      "AI applied to public-information signals — classification, entity extraction, summarization, anomaly detection, and decision support.",
    problem: (ind) =>
      `${ind} teams sit on more open-source signal than any human can read. The question is no longer "can we collect this" but "what's actually worth a human's attention this hour?"`,
    applications: (ind) => [
      `Triage incoming reports: classify, score severity, route to the right ${ind} analyst.`,
      `Entity and location extraction from free-text reports, social posts, and broadcast transcripts.`,
      `Anomaly detection over time-series indicators: catch the unusual before a human notices the trend.`,
      `Cross-language coverage without doubling headcount — Ukrainian, Russian, Polish, German, English in the same pipeline.`,
      `Summarization of long-form documents, technical filings, and multi-source clusters for ${ind} leadership.`,
    ],
    faqs: (ind) => [
      {
        q: `What's the difference between AI and traditional analytics for ${ind}?`,
        a: `Traditional analytics answers questions you already knew to ask. AI surfaces patterns you didn't — including the bad ones — and lets you ask follow-up questions in natural language.`,
      },
      {
        q: `Does AI replace ${ind} analysts?`,
        a: `No. It eliminates the queue between an analyst and their first useful read. The analyst's judgment is still the deliverable.`,
      },
      {
        q: `How do you avoid hallucinations in production?`,
        a: `Strict retrieval grounding (RAG over the actual corpus) and an audit trail that ties every claim back to a source event. See /methodology and /trust/data-policy for details.`,
      },
    ],
  },
  osint: {
    key: "osint",
    label: "OSINT",
    routePrefix: "/osint-for",
    intro:
      "Open-source intelligence — public information collected, verified, and structured into decision-useful findings.",
    problem: (ind) =>
      `Decisions in ${ind} increasingly rest on facts that are publicly available but practically invisible. OSINT is the discipline of making them visible — at speed, with sources cited.`,
    applications: (ind) => [
      `Real-time situational awareness for ${ind} operations, with confidence-scored events.`,
      `Verification of social-media and broadcast claims before they influence a decision.`,
      `Geolocation of incidents, vessels, infrastructure damage, and movement patterns.`,
      `Sanctions and supply-chain monitoring across corporate filings, trade data, and shipping records.`,
      `Long-form investigative work tying together months of public signal into a single named finding.`,
    ],
    faqs: (ind) => [
      {
        q: `How is OSINT different from traditional intelligence in ${ind}?`,
        a: `OSINT works exclusively with publicly available information. The discipline is in scoping, verification, and accountability — not in access. For ${ind}, that means findings can be cited and audited externally.`,
      },
      {
        q: `Is OSINT legal?`,
        a: `Collection of publicly available information is generally legal in most jurisdictions Aegis Lens operates in. Storage, processing, and publication have specific obligations (GDPR, sectoral law) — see /trust/data-policy.`,
      },
      {
        q: `How accurate is OSINT for ${ind} decisions?`,
        a: `Accuracy is the discipline's first-class concern. Aegis Lens publishes confidence scores and corroboration counts on every event. Findings without sources are not findings.`,
      },
    ],
  },
  cybersecurity: {
    key: "cybersecurity",
    label: "Cybersecurity",
    routePrefix: "/cybersecurity-for",
    intro:
      "Defensive cyber posture informed by open-source intelligence, threat actor tracking, and infrastructure monitoring.",
    problem: (ind) =>
      `${ind} security teams need to know who is targeting them, what techniques are in active use, and where the next attack vector is opening — before it touches their environment.`,
    applications: (ind) => [
      `Threat actor tracking — campaigns, TTPs, infrastructure, and attribution evolution.`,
      `Early-warning feeds for ransomware, wipers, and APT activity affecting ${ind}.`,
      `Sector-specific vulnerability and exploitation reporting.`,
      `Supply-chain risk: dependencies, vendors, and adversary access pathways.`,
      `Incident-context briefings: what an analyst at a peer ${ind} org would have wanted last week.`,
    ],
    faqs: (ind) => [
      {
        q: `How does this differ from a commercial threat-intel feed?`,
        a: `Commercial feeds excel at indicator volume. Open-source-driven ${ind} threat intel adds context, attribution reasoning, and the analyst-readable narrative behind why an IoC matters.`,
      },
      {
        q: `Do you cover state-sponsored actors targeting ${ind}?`,
        a: `Yes. State-nexus and cybercrime are treated as a continuum — same families, different operators — and tracked together.`,
      },
      {
        q: `How are findings delivered into existing security tooling?`,
        a: `JSON via /api/events and /api/sources, RSS at /news/feed.xml + /topics/cyber/feed.xml, Postman collection, and webhook support (Sprint 3.x). See /docs/api.`,
      },
    ],
  },
  intelligence: {
    key: "intelligence",
    label: "Intelligence",
    routePrefix: "/intelligence-for",
    intro:
      "All-source open intelligence: events, reports, investigations, methodology, and structured data delivered to decision-makers.",
    problem: (ind) =>
      `${ind} decision cycles are paced by the slowest source. Open intelligence done well shortens that cycle without compromising the quality of what reaches the principal.`,
    applications: (ind) => [
      `Daily / weekly briefings on the situation across regions of interest to ${ind}.`,
      `Custom topic feeds piped into briefing tools, intranets, or principal-level summaries.`,
      `Investigation library on subjects of recurring concern.`,
      `Methodology disclosure that survives external audit and litigation discovery.`,
      `Embeddable data products — maps, charts, RSS, JSON — for ${ind} internal portals.`,
    ],
    faqs: (ind) => [
      {
        q: `Who consumes this in ${ind} organizations?`,
        a: `Analysts (raw events + API), team leads (reports + investigations), and principals (executive briefings). The platform is designed so all three see the same evidence chain.`,
      },
      {
        q: `Can we export findings into internal classification systems?`,
        a: `All findings are open-source by design; classification is the consumer's job. Standard exports (JSON, GeoJSON, CSV, RSS, OpenAPI) and a Postman collection are at /datasets and /docs/api.`,
      },
    ],
  },
  monitoring: {
    key: "monitoring",
    label: "Monitoring",
    routePrefix: "/monitoring-for",
    intro:
      "Continuous monitoring of regions, topics, threats, and named entities — alerts when they cross a threshold you set.",
    problem: (ind) =>
      `${ind} teams can't pay attention to everything all the time. Monitoring is the discipline of paying attention to nothing — until something specific happens.`,
    applications: (ind) => [
      `Region-scoped event monitoring with adjustable severity thresholds.`,
      `Per-topic RSS subscriptions and per-class JSON feeds.`,
      `Source-health monitoring — when a tracked source goes dark, you know.`,
      `Anomaly alerts: cluster spikes, unusual class mixes, and verification-state changes.`,
      `Webhook delivery into ${ind} incident channels (Slack, MS Teams, internal ticketing).`,
    ],
    faqs: (ind) => [
      {
        q: `How do you avoid alert fatigue in ${ind}?`,
        a: `Per-subscription severity floor, deduplication across sources, and digest mode for non-urgent topics. Fewer better alerts > more noisy ones.`,
      },
      {
        q: `Can we monitor specific named entities (companies, ships, individuals)?`,
        a: `Entity-level monitoring is on the roadmap (Sprint 3.x). Today you can monitor regions, topics, and threats. See /entities for the current entity surface.`,
      },
    ],
  },
};

export function pickFeatured<T>(items: T[], count: number): T[] {
  return items.slice(0, count);
}

export function describeIndustryFit(industry: IndustryView, lens: LensCopy): string {
  return `${lens.intro} For ${industry.label}, that means turning ${industry.companies.length + industry.tools.length} catalogued companies and tools into decision-useful work.`;
}
