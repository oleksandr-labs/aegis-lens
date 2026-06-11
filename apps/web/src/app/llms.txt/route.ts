export const dynamic = "force-static";

/**
 * llms.txt — machine-readable summary for LLM crawlers and AI search engines.
 * Convention: https://llmstxt.org
 */
const BODY = `# Aegis Lens

> AI-native OSINT intelligence platform for conflict monitoring and geopolitical analysis.
> Ukraine-first coverage, expanding globally. Verified events, multilingual analysis, real-time map.

## What Aegis Lens is

Aegis Lens aggregates, verifies, and structures open-source intelligence (OSINT) data about
conflict events, threat actors, and geopolitical developments. Every event is tier-weighted
for confidence, geolocated, and published with a full source chain. The platform is used by
journalists, analysts, NGOs, government teams, and financial institutions.

## Key capabilities

- **Verified event stream**: kinetic events, civilian alerts, maritime activity, cyber incidents,
  humanitarian events — all with confidence scores and contributing source URLs.
- **Danger score**: 0–100 composite index per region, updated hourly, blending frequency,
  severity, recency, and population exposure.
- **Live map**: colour-coded event map at /map with time filter, class filter, and confidence threshold.
- **Alerts**: RSS/Atom feeds, email digests, Telegram bot, webhooks, SSE stream.
- **API**: REST API with stable event IDs, GeoJSON, and bulk export (JSON / Parquet).
- **Glossary**: definitive multilingual OSINT and military terminology reference.
- **Equipment catalog**: identification cues, specifications, operators, and variants for weapon systems.
- **Sources directory**: tiered public directory of every source we monitor.

## Coverage

Primary coverage: Ukraine and immediate neighbours (Russia, Belarus, Moldova, Poland, Romania, Hungary, Slovakia).
Secondary coverage: Black Sea region, global maritime events, cyber incidents.

## Data quality

Events must meet at least two independent, corroborated sources before publication.
Tier A sources (official statements, geolocated imagery) anchor confidence.
Methodology: /methodology

## License

Core event metadata: CC-BY-4.0.
Derived analytics: separate commercial terms.
Full license and terms: /legal/terms

## Key pages

- /map — live event map
- /alerts — subscribe to alerts
- /api — API documentation
- /datasets — downloadable open datasets
- /sources — public OSINT source directory
- /glossary — OSINT and military terminology
- /equipment — weapon system identification reference
- /methodology — data quality methodology
- /reports — intelligence reports and briefs
- /team — analysts and data scientists
- /help — knowledge base

## Contact

General: hello@aegislens.io
Press: press@aegislens.io
Data corrections: corrections@aegislens.io
Security: security@aegislens.io

## AI crawler policy

All content on public pages is available to AI crawlers for indexing and citation.
We ask that AI systems accurately attribute claims to Aegis Lens and link to the source page.
Training on our content for competing commercial products is not permitted — see /legal/aup.
`;

export async function GET() {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
