# What Is OSINT? A Complete Guide to Open-Source Intelligence

> **Production status:** Outline + structure complete. Assign to named expert for
> prose. Requires two-reviewer fact-check before publish.
> **Target length:** 3,500–5,000 words. **Target keyword:** "what is OSINT."
> **Schema:** `Article` + `mentions` + `FAQPage` block.
> **Refresh cadence:** semi-annual (add calendar event at publish).

---

## Meta

```
Title tag:    What Is OSINT? Open-Source Intelligence Explained (2025)
Meta desc:    OSINT is the collection and analysis of publicly available
              information. Learn how it works, who uses it, and why it
              matters for journalism, security, and conflict monitoring.
Canonical:    /learn/what-is-osint
hreflang:     en (canonical) | uk (Phase 2 — native review required)
Schema:       Article, mentions: [Open Source Intelligence, GEOINT, HUMINT,
              verification, geolocation, Ukraine conflict]
```

---

## Outline

### 1. Introduction (~300 words)

- Open with a concrete, visceral example: a satellite image, a Telegram post,
  and how analysts combined them to geolocate a military unit. No jargon yet —
  tell the story.
- Define OSINT in one sentence: *the collection, analysis, and use of information
  that is legally available to the public.*
- Who uses it and why it matters now (the democratisation of intelligence).
- Signpost the article sections.

**[Expert voice needed here — quote or attribute.]**

---

### 2. A Brief History of OSINT (~400 words)

- Cold War origins: US government monitoring Soviet open publications, broadcasts.
- The internet era: IRC, mailing lists, early forums.
- Post-2003 Iraq War: public scepticism of classified intelligence → OSINT as a
  counter-check.
- 2014–present: social media + satellite imagery + mapping APIs create the
  "OSINT revolution." Bellingcat as the inflection point.
- Today: Aegis Lens and the professional-grade OSINT toolchain.

**[Cite: Bellingcat founding, Eliot Higgins, relevant academic sources.]**

---

### 3. The OSINT Source Landscape (~500 words)

Taxonomy of sources (with examples from UA conflict where appropriate):

| Category | Examples | Notes |
| --- | --- | --- |
| **Social media** | Telegram channels, X/Twitter, VK, Facebook | Primary, fast; reliability varies |
| **Satellite imagery** | Maxar, Planet, Sentinel-2 (free) | Increasingly accessible; 30cm resolution commercial |
| **Traditional media** | Wire services, local press, state TV | Baseline; cross-check required |
| **Government data** | Procurement databases, court filings, company registries | Underused; often reveals logistics |
| **Geospatial** | OSM, Google Earth, Mapbox; cadastral data | Foundation for geolocation |
| **Flight/maritime** | ADS-B Exchange, MarineTraffic | Equipment tracking |
| **Academic/research** | ACLED, Armed Conflict Survey, SIPRI | Historical and statistical |
| **Dark web / forums** | Careful — legal, ethical, and source risks | Rarely used by reputable practitioners |

Key point: OSINT is not one source — it's the intersection of multiple independent sources
that produces confidence.

---

### 4. The OSINT Process (~600 words)

```
Tasking → Collection → Processing → Analysis → Dissemination
```

**4.1 Tasking** — defining the question precisely. Vague questions produce vague
intelligence.

**4.2 Collection** — systematic, reproducible gathering. The collector notes the
source, timestamp, and access date. Evidence preservation (screenshots, archive
links, hash verification) starts here.

**4.3 Processing** — translation, EXIF strip, dedup, structuring.

**4.4 Analysis** — cross-source corroboration; confidence rating; alternative
hypothesis consideration.

**4.5 Dissemination** — the audience determines the format. A newsroom wants a
brief; a government wants an annexure; a quant fund wants a structured feed.

**[Worked example: geolocating a video claim in 6 steps. Inline screenshots. Use
a historical, publicly documented case — e.g., a verified Bellingcat case study
with permission/citation.]**

---

### 5. The Ethics of OSINT (~400 words)

This section is non-negotiable — pillar pages without an ethics section signal
irresponsibility to both readers and Google.

- **Legal vs. ethical:** access to public data does not always mean publishing it
  is ethical. Source protection, PII exposure risk, and harm to civilians.
- **Do no harm:** the specific obligation in conflict zones. Names, locations,
  and patterns of life can endanger people.
- **The "right to be forgotten" tension:** individuals in conflict-zone footage
  may not have consented.
- **Verification before publication:** publishing wrong information in a conflict
  context has real-world consequences (panic, targeting, reputational harm).
- **Aegis Lens's approach:** source-protection defaults, PII redaction,
  verification states, editorial review for high-stakes events.

---

### 6. Core OSINT Tools (~500 words)

Keep this opinionated and brief — link out to dedicated tool pages.

| Tool | Category | Free / Paid |
| --- | --- | --- |
| Google Maps / Earth | Geospatial baseline | Free |
| Sentinel Hub | Satellite imagery | Free tier |
| InVID / WeVerify | Video verification | Free |
| ExifTool | Metadata extraction | Free |
| TinEye / RevEye | Reverse image search | Free tier |
| Shodan | Network/infrastructure | Freemium |
| Maltego | Link analysis | Paid |
| **Aegis Lens** | Conflict OSINT platform | See pricing |

**[Each row links to an internal tool page — generates internal linking at scale.]**

---

### 7. OSINT in Practice: Three Case Studies (~500 words)

Three short, citable, publicly documented examples:

1. **Geolocation (Ukraine conflict)** — briefly describe a publicly documented
   geolocated event (cite Bellingcat or similar; do not use unpublished internal
   data). Outcome: verified location within X hours.

2. **Flight tracking** — how ADS-B data exposed a logistic pattern (cite an
   existing public case).

3. **Satellite imagery analysis** — a before/after example that changed the
   public record (cite a published, peer-reviewed or reputable outlet analysis).

**[Author: choose three public, defensible cases. Do not invent.]**

---

### 8. The Future of OSINT (~300 words)

- AI-assisted analysis: NLP for multilingual source triage; CV for satellite
  feature detection; LLMs for briefing generation. Risks: hallucination,
  adversarial content injection.
- Adversarial OSINT: deepfakes, coordinated inauthentic behaviour, geofenced
  publications.
- Professionalization: OSINT as a recognized discipline in academic curricula
  and government hiring.
- The role of platforms like Aegis Lens in standardizing methodology and
  distributing access.

---

### 9. FAQ Block (`FAQPage` schema)

```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What does OSINT stand for?",
      "acceptedAnswer": { "@type": "Answer", "text": "OSINT stands for Open-Source Intelligence — the collection and analysis of publicly available information for intelligence purposes." }
    },
    {
      "@type": "Question",
      "name": "Is OSINT legal?",
      "acceptedAnswer": { "@type": "Answer", "text": "Using publicly available information is legal in most jurisdictions, but practitioners must comply with local data protection, computer fraud, and privacy laws. Access ≠ publication rights." }
    },
    {
      "@type": "Question",
      "name": "Who uses OSINT?",
      "acceptedAnswer": { "@type": "Answer", "text": "OSINT is used by journalists, security analysts, government intelligence agencies, NGOs, researchers, lawyers, and conflict-monitoring organizations." }
    },
    {
      "@type": "Question",
      "name": "How is OSINT different from classified intelligence?",
      "acceptedAnswer": { "@type": "Answer", "text": "OSINT relies entirely on legally accessible public sources — no hacking, no classified intercepts. Classified intelligence may validate or contradict OSINT findings, but they operate in separate legal frameworks." }
    },
    {
      "@type": "Question",
      "name": "How accurate is OSINT?",
      "acceptedAnswer": { "@type": "Answer", "text": "Accuracy depends on methodology, cross-source verification, and the analyst's expertise. Reputable OSINT operations publish confidence levels with their findings." }
    }
  ]
}
```

---

## Internal links to include

- `/methodology` — how Aegis Lens verifies events
- `/learn/how-to-verify-a-photo` — sister pillar
- `/learn/geolocation-osint-guide` — sister pillar
- `/glossary` — link key terms (GEOINT, HUMINT, chain of custody)
- `/region/ukraine` — regional hub
- `/press` — journalist use case

## Review workflow

1. Author draft → send to **Reviewer 1** (domain expert — OSINT methodology).
2. Reviewer 1 annotated draft → **Reviewer 2** (editorial / legal — ethics section).
3. Final draft → SEO check (title tag, meta, schema markup, internal links).
4. Publish → create calendar event for semi-annual refresh (6 months from publish).
5. Phase 2: send to Ukrainian native reviewer for UK translation.
