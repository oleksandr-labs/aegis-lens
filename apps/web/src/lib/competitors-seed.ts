export type ComparisonRow = {
  feature: string;
  aegis: string | boolean;
  them: string | boolean;
};

export type Competitor = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  homepageUrl: string;
  category: string;
  /** Honest "when to choose them" guidance — credibility matters more than a sales pitch. */
  whenToChooseThem: string;
  whenToChooseUs: string;
  comparisonTable: ComparisonRow[];
  /** FAQs specific to the vs page */
  faq: { q: string; a: string }[];
};

export const COMPETITORS: Competitor[] = [
  {
    slug: "liveuamap",
    name: "LiveUAMap",
    tagline: "Real-time conflict map",
    description:
      "LiveUAMap is a real-time interactive map aggregating social-media posts and news reports about conflict events globally, with a strong focus on Ukraine.",
    homepageUrl: "https://liveuamap.com",
    category: "Conflict mapping",
    whenToChooseThem:
      "LiveUAMap is a strong choice for rapid situational awareness from a single map view. Their broad social-media ingestion means breaking events sometimes appear faster. If you need a free, no-login map with extensive historical pins, LiveUAMap is a solid starting point.",
    whenToChooseUs:
      "Aegis Lens adds confidence scoring, tier-weighted source corroboration, structured API access, bulk export, and a verifiable audit trail — essential if you need to cite data in reporting, research, or legal proceedings.",
    comparisonTable: [
      { feature: "Real-time map", aegis: true, them: true },
      { feature: "Event confidence score", aegis: true, them: false },
      { feature: "Source chain (auditable)", aegis: true, them: false },
      { feature: "Structured API", aegis: true, them: false },
      { feature: "Bulk data export (JSON/Parquet)", aegis: true, them: false },
      { feature: "RSS / Atom feeds per topic", aegis: true, them: "Limited" },
      { feature: "Email + Telegram alerts", aegis: true, them: false },
      { feature: "Danger score per region", aegis: true, them: false },
      { feature: "Free tier", aegis: true, them: true },
      { feature: "Open license for core data (CC-BY)", aegis: true, them: false },
    ],
    faq: [
      {
        q: "Is Aegis Lens better than LiveUAMap for journalists?",
        a: "For journalists who need a citable, auditable record, Aegis Lens provides the source chain and confidence score required by editorial standards. LiveUAMap is faster for browsing at a glance but does not expose source provenance per event.",
      },
      {
        q: "Does Aegis Lens cover as many events as LiveUAMap?",
        a: "Coverage depth differs: LiveUAMap casts a very wide net over social media; Aegis Lens applies verification gates before publication. A verified event on Aegis Lens carries higher confidence than an unscreened pin on LiveUAMap.",
      },
    ],
  },
  {
    slug: "palantir",
    name: "Palantir",
    tagline: "Enterprise intelligence platform",
    description:
      "Palantir is an enterprise software company offering data integration and intelligence platforms (Gotham, Foundry, AIP) primarily to government and large institutional clients.",
    homepageUrl: "https://www.palantir.com",
    category: "Enterprise intelligence",
    whenToChooseThem:
      "Palantir is purpose-built for large governments, defense ministries, and intelligence agencies with existing classified or sensitive data that needs to be fused with commercial feeds. If your organisation requires on-premises sovereign deployment, bespoke data connectors, and a large-scale professional-services engagement, Palantir may be the right fit.",
    whenToChooseUs:
      "Aegis Lens is designed for teams that need to go live in hours rather than months. Our API-first architecture, transparent methodology, open-data defaults, and self-serve pricing make us the right choice for newsrooms, NGOs, mid-size analyst teams, and financial institutions that need verified conflict data without a multi-year procurement cycle.",
    comparisonTable: [
      { feature: "Self-serve onboarding", aegis: true, them: false },
      { feature: "Public API with documented endpoints", aegis: true, them: "Partial" },
      { feature: "Open data license (CC-BY)", aegis: true, them: false },
      { feature: "Transparent methodology", aegis: true, them: false },
      { feature: "Sovereign / on-prem deployment", aegis: "Roadmap", them: true },
      { feature: "Classified data fusion", aegis: false, them: true },
      { feature: "NGO / journalist pricing", aegis: true, them: false },
      { feature: "Real-time conflict event feed", aegis: true, them: "Via partners" },
      { feature: "Free tier", aegis: true, them: false },
      { feature: "OSINT-native verification workflow", aegis: true, them: false },
    ],
    faq: [
      {
        q: "How does Aegis Lens compare to Palantir for NGOs?",
        a: "Palantir's licensing and onboarding process is designed for large institutional clients and typically involves substantial cost and contract time. Aegis Lens offers a free NGO tier with verified event data, API access, and alert delivery — ready in hours.",
      },
      {
        q: "Can Aegis Lens replace Palantir for government intelligence work?",
        a: "For classified data fusion and sovereign deployment, Palantir remains the more mature choice. For OSINT-derived conflict events, public-source analysis, and open-data workflows, Aegis Lens is often faster and more transparent.",
      },
    ],
  },
  {
    slug: "dataminr",
    name: "Dataminr",
    tagline: "Real-time event detection from public data",
    description:
      "Dataminr uses AI to detect breaking events from social media and public data streams, delivering alerts to newsrooms, financial institutions, and government clients.",
    homepageUrl: "https://www.dataminr.com",
    category: "Real-time event detection",
    whenToChooseThem:
      "Dataminr excels at very-early signal detection from social media, particularly Twitter/X. If first-alert speed from social chatter (before verification) is your primary need and you have budget for an enterprise license, Dataminr is a proven option.",
    whenToChooseUs:
      "Aegis Lens adds structured corroboration, source-chain transparency, geolocation accuracy classes, and a verifiable record — essential if you need to act on, publish, or archive the intelligence. Our open API and free tier also make us accessible to teams that cannot afford Dataminr enterprise pricing.",
    comparisonTable: [
      { feature: "Breaking-event speed (social-first)", aegis: "Verification-gated", them: true },
      { feature: "Source corroboration + tier weighting", aegis: true, them: false },
      { feature: "Geolocation accuracy class", aegis: true, them: false },
      { feature: "Public API", aegis: true, them: "Enterprise only" },
      { feature: "Free tier", aegis: true, them: false },
      { feature: "Open data license", aegis: true, them: false },
      { feature: "Conflict-specific taxonomy", aegis: true, them: "General" },
      { feature: "Bulk historical export", aegis: true, them: "Enterprise only" },
      { feature: "RSS / Atom feeds", aegis: true, them: false },
      { feature: "Telegram bot alerts", aegis: true, them: false },
    ],
    faq: [
      {
        q: "Does Aegis Lens detect events as fast as Dataminr?",
        a: "Dataminr surfaces social-media signals before verification; Aegis Lens applies a verification gate that adds latency (typically minutes to hours) but substantially reduces false positives. If verified accuracy matters more than raw speed, Aegis Lens is the better fit.",
      },
      {
        q: "Is Aegis Lens cheaper than Dataminr?",
        a: "Dataminr is enterprise-priced with no public self-serve tier. Aegis Lens has a free tier and transparent self-serve pricing — significantly more accessible for smaller teams and non-profits.",
      },
    ],
  },
  {
    slug: "bellingcat",
    name: "Bellingcat",
    tagline: "Open-source investigation collective",
    description:
      "Bellingcat is a non-profit investigative journalism and OSINT collective known for groundbreaking conflict investigations using open-source methods. They publish guides and tools as well as investigations.",
    homepageUrl: "https://www.bellingcat.com",
    category: "OSINT journalism",
    whenToChooseThem:
      "Bellingcat's published investigations are essential reading for anyone doing conflict OSINT. Their methodology guides (geolocation, chronolocation, source verification) are the field standard. If you want to learn OSINT or read in-depth investigations, start with Bellingcat.",
    whenToChooseUs:
      "Aegis Lens is a real-time data platform, not an investigation outlet. We provide the continuous, structured event stream and API that allows your team to do what Bellingcat does — at scale, in real time, with machine-readable outputs.",
    comparisonTable: [
      { feature: "Real-time event feed", aegis: true, them: false },
      { feature: "Structured API", aegis: true, them: false },
      { feature: "Free investigation methodology guides", aegis: "Help center", them: true },
      { feature: "Published investigations (journalism)", aegis: false, them: true },
      { feature: "Danger score / regional analytics", aegis: true, them: false },
      { feature: "Alert subscriptions (RSS, email, webhook)", aegis: true, them: "Newsletter only" },
      { feature: "Bulk data export", aegis: true, them: false },
      { feature: "Open-source tool directory", aegis: true, them: true },
      { feature: "Equipment identification reference", aegis: true, them: "Via guides" },
      { feature: "Non-commercial / free access", aegis: true, them: true },
    ],
    faq: [
      {
        q: "Is Aegis Lens a replacement for Bellingcat?",
        a: "No — they serve different purposes. Bellingcat publishes deep-dive investigations; Aegis Lens provides the real-time, structured data infrastructure. Many analysts use both: Bellingcat for methodology and published findings, Aegis Lens for ongoing monitoring and API-driven workflows.",
      },
      {
        q: "Does Aegis Lens follow Bellingcat's verification standards?",
        a: "Yes. Our tier-weighting methodology was designed to be consistent with OSINT best practices promoted by Bellingcat and similar organizations. Tier-A sources (geolocated imagery, official statements) anchor event confidence.",
      },
    ],
  },
  {
    slug: "maxar",
    name: "Maxar Intelligence",
    tagline: "Commercial satellite imagery",
    description:
      "Maxar Technologies provides very-high-resolution commercial satellite imagery and geospatial intelligence products, widely used in conflict monitoring, disaster response, and infrastructure assessment.",
    homepageUrl: "https://www.maxar.com",
    category: "Satellite imagery",
    whenToChooseThem:
      "Maxar's sub-50cm resolution imagery is unmatched for detailed facility assessment, ship tracking, and battle-damage analysis. If you need the clearest possible satellite image of a specific target or area, Maxar is the industry standard.",
    whenToChooseUs:
      "Aegis Lens provides the event-level context layer that makes satellite imagery actionable: what happened, when, with what confidence, and from which sources. Our platform integrates freely available satellite layers (Sentinel-2, NASA FIRMS) and links events to imagery timestamps — without the per-image licensing cost of commercial providers.",
    comparisonTable: [
      { feature: "Very-high-resolution imagery (<50 cm)", aegis: false, them: true },
      { feature: "Freely available satellite layer (Sentinel-2)", aegis: true, them: false },
      { feature: "Structured conflict event feed", aegis: true, them: false },
      { feature: "API for event data", aegis: true, them: "Imagery API only" },
      { feature: "Free tier", aegis: true, them: false },
      { feature: "Open data license for events", aegis: true, them: false },
      { feature: "Danger score / regional analytics", aegis: true, them: false },
      { feature: "Alert subscriptions", aegis: true, them: false },
      { feature: "OSINT source corroboration", aegis: true, them: false },
      { feature: "Fire detection (NASA FIRMS overlay)", aegis: true, them: false },
    ],
    faq: [
      {
        q: "Does Aegis Lens provide satellite imagery?",
        a: "Aegis Lens integrates freely available Sentinel-2 true-colour imagery (updated every 5 days) and NASA FIRMS near-real-time fire detection as map overlays. For very-high-resolution tasked imagery, Maxar and Planet are the specialists.",
      },
      {
        q: "Can I use Aegis Lens alongside Maxar?",
        a: "Yes — many analysts use Aegis Lens for event context and alert triggering, then pull Maxar imagery to assess specific incidents in detail. The event's `occurred_at` timestamp helps you identify the right imagery collection window.",
      },
    ],
  },
  {
    slug: "blacksky",
    name: "BlackSky",
    tagline: "AI-powered geospatial intelligence",
    description:
      "BlackSky is a commercial satellite operator offering high-revisit Earth observation, combining synthetic aperture radar (SAR) and electro-optical imagery with AI-driven analytics for government and enterprise customers.",
    homepageUrl: "https://www.blacksky.com",
    category: "Satellite intelligence",
    whenToChooseThem:
      "Choose BlackSky if your workflow requires tasked, sub-meter-resolution optical or SAR imagery with guaranteed revisit rates, direct integration into government classified environments (FedRAMP authorised), or AI-powered change detection on a specific target area. Their 'Spectra AI' platform provides ready-to-use analytics for site monitoring.",
    whenToChooseUs:
      "Aegis Lens provides the conflict event layer that satellite imagery alone cannot supply: what happened, when, from which sources, and with what confidence. We integrate freely available Sentinel-2 and NASA FIRMS overlays, deliver structured JSON feeds, and offer a free tier — making Aegis Lens the starting point for most open-source analysts before escalating to commercial imagery for specific events.",
    comparisonTable: [
      { feature: "High-revisit tasked imagery", aegis: false, them: true },
      { feature: "SAR imagery (cloud-penetrating)", aegis: false, them: true },
      { feature: "Structured conflict event feed", aegis: true, them: false },
      { feature: "Confidence / danger scoring", aegis: true, them: false },
      { feature: "Auditable source chain", aegis: true, them: false },
      { feature: "Free public data tier", aegis: true, them: false },
      { feature: "Open data license (CC-BY)", aegis: true, them: false },
      { feature: "API for event data", aegis: true, them: "Imagery API only" },
      { feature: "Alert subscriptions by region", aegis: true, them: false },
      { feature: "OSINT source corroboration", aegis: true, them: false },
    ],
    faq: [
      {
        q: "How does Aegis Lens differ from BlackSky?",
        a: "BlackSky provides the imagery layer — what a location looks like from space at a specific time. Aegis Lens provides the event intelligence layer — what happened, verified from open sources, with structured data you can query via API. They are complementary: Aegis Lens alerts you to events; BlackSky lets you image the aftermath.",
      },
      {
        q: "Can I use Aegis Lens and BlackSky together?",
        a: "Yes. A common workflow: Aegis Lens fires an alert on a high-danger event, you record the `occurred_at` timestamp, then task BlackSky to collect imagery over the coordinates in the next available window. Aegis Lens exports coordinates in GeoJSON compatible with standard GIS tools.",
      },
    ],
  },
  {
    slug: "planet",
    name: "Planet Labs",
    tagline: "Daily satellite imagery of the entire Earth",
    description:
      "Planet Labs operates the largest commercial Earth-observation constellation, capturing a daily snapshot of the entire planet at 3–5 m resolution (PlanetScope) and tasking capabilities down to 50 cm (SkySat). Primarily serves defence, agriculture, environmental, and government customers.",
    homepageUrl: "https://www.planet.com",
    category: "Satellite intelligence",
    whenToChooseThem:
      "Choose Planet if you need daily change detection at scale across large areas — monitoring deforestation, infrastructure damage, or force movements across an entire country. Their Education & Research programme offers subsidised access for non-profit and academic users. The daily cadence is unmatched for longitudinal analysis.",
    whenToChooseUs:
      "Aegis Lens is built for OSINT analysts, journalists, and security teams who need verified event data, source citation, and structured API access — not imagery subscriptions. Our free tier covers a typical analyst's daily workflow; Planet's cost structure targets enterprise and government. Use Aegis Lens for event context and Sentinel-2 basemaps; escalate to Planet when you need daily change detection on specific coordinates.",
    comparisonTable: [
      { feature: "Daily global imagery (3–5 m)", aegis: false, them: true },
      { feature: "High-resolution tasking (50 cm)", aegis: false, them: true },
      { feature: "Structured conflict event feed", aegis: true, them: false },
      { feature: "Confidence / danger scoring per event", aegis: true, them: false },
      { feature: "Auditable open-source chain", aegis: true, them: false },
      { feature: "Free tier for analysts", aegis: true, them: "Education programme only" },
      { feature: "Open data license (CC-BY events)", aegis: true, them: false },
      { feature: "API for event data (JSON/GeoJSON)", aegis: true, them: "Imagery API only" },
      { feature: "Alert subscriptions by region/topic", aegis: true, them: false },
      { feature: "Sentinel-2 / NASA FIRMS overlays", aegis: true, them: false },
    ],
    faq: [
      {
        q: "Does Aegis Lens provide Planet-style daily imagery?",
        a: "No — Aegis Lens integrates freely available Sentinel-2 imagery (5-day revisit, 10 m resolution) and NASA FIRMS fire detection as map overlays. For daily 3–5 m coverage, Planet is the specialist. Aegis Lens is the event intelligence layer; Planet provides the imagery layer.",
      },
      {
        q: "Is Planet a competitor or a complement to Aegis Lens?",
        a: "Largely complementary. Analysts typically use Aegis Lens to identify and verify events via open-source reporting, then use Planet imagery to visually confirm damage or monitor recovery. The Aegis Lens event export includes coordinates and timestamps compatible with Planet's tasking API.",
      },
    ],
  },
];

export function getCompetitor(slug: string): Competitor | undefined {
  return COMPETITORS.find((c) => c.slug === slug);
}
