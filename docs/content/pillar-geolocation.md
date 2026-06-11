# Geolocation OSINT Guide: From a Single Photo to a Coordinate

> **Production status:** Outline + schema complete. Author to write prose and
> source 5 worked examples from public, documented cases.
> **Target length:** 3,500–5,000 words.
> **Target keyword:** "geolocation OSINT," "how to geolocate a photo."
> **Schema:** `HowTo` + `Article`. Lead gen: downloadable cheat sheet.

---

## Meta

```
Title tag:    Geolocation OSINT: How to Find Where a Photo Was Taken (2025)
Meta desc:    Learn the complete geolocation process — from visual cue extraction
              to confirmed coordinates — with worked examples from conflict zones.
Canonical:    /learn/geolocation-osint-guide
hreflang:     en + uk (simultaneous launch — native UK reviewer required)
Schema:       HowTo, Article
Lead gen:     Downloadable geolocation cheat sheet (1-page PDF)
```

---

## Outline

### 1. Introduction (~200 words)

- Geolocation is the process of determining the precise geographic location where
  a photo or video was captured using only the visual and contextual information
  in the media itself.
- Why it matters: geolocating military equipment, civilian incidents, and
  infrastructure damage is central to conflict verification. A coordinate is
  falsifiable — a vague claim isn't.
- What this guide teaches: a repeatable four-phase framework.

---

### 2. The Four-Phase Framework (`HowTo` schema)

```json
{
  "@type": "HowTo",
  "name": "How to Geolocate a Photo Using OSINT",
  "step": [
    {
      "name": "Phase 1: Cue Extraction",
      "text": "Systematically catalogue every visual element that constrains location: terrain type, vegetation, infrastructure (road markings, guard rail patterns, power line configurations), architecture (building style, roof type, window patterns), signage (partial text, logo shapes), weather, and any cultural artefacts."
    },
    {
      "name": "Phase 2: Candidate Generation",
      "text": "Use the extracted cues to form a hypothesis about the region. Tools: Google Earth terrain, OpenStreetMap (search for road patterns and infrastructure), Mapillary (street-level crowdsourced imagery), Wikimapia (local labels). Narrow from country → region → city → neighbourhood."
    },
    {
      "name": "Phase 3: Cross-Reference and Confirmation",
      "text": "Once a candidate location is identified, verify by: (a) comparing the scene with satellite imagery at the same angle using Google Earth 3D or Sentinel Hub; (b) checking historical satellite imagery for the claimed event date; (c) using SunCalc to verify shadow angles at the claimed time; (d) finding a second, independent image or video of the same location from a different source."
    },
    {
      "name": "Phase 4: Confidence Assessment",
      "text": "Assign a confidence level: Confirmed (≥2 independent corroborating sources, shadow/sun verified), High Confidence (strong visual match, 1 corroborating source), Probable (good visual match, no second source), Unresolved (insufficient evidence). Document every step taken and every source used."
    }
  ]
}
```

---

### 3. Cue Extraction in Depth (~600 words)

**[Author: expand each cue type with examples specific to the Ukraine conflict
geography where possible (UA has distinctive architectural, road, and vegetation
patterns).]**

#### 3.1 Terrain and vegetation
- Flat vs. rolling vs. hilly topography.
- Tree species (birch, pine, poplar, oak — each implies a climate zone and
  eliminates large regions).
- Crop patterns and field colours in satellite imagery (Ukraine is the "bread
  basket of Europe" — distinctive agricultural patterns).

#### 3.2 Infrastructure
- Road surface colour and marking conventions differ by country (lane marking
  width, median barrier type, guardrail colour).
- Power line height and configuration.
- Railway gauge and infrastructure.

#### 3.3 Architecture
- Roof styles, building materials, window types. Soviet-era "Khrushchevka"
  apartment blocks are instantly identifiable.
- Signage typefaces and logo fragments (Cyrillic vs. Latin; specific brands
  with narrow distribution).

#### 3.4 Orientation cues
- Shadow length and direction relative to the image frame.
- Vegetation state (leafless = winter or early spring in temperate zone).

---

### 4. Worked Examples (5 cases)

**[Author: select 5 publicly documented, already-published geolocation cases from
Bellingcat, Conflict Intelligence Team, or similar reputable sources. Each must:]**
- Be fully public with a citable URL.
- Demonstrate a distinct technique (one per example).
- Include the outcome (confirmed coordinate or "unresolvable").

Suggested structure per example:
```
Case: [Title]
Source: [Publication, date, URL]
Claim: [What was claimed]
Method: [Which phase/technique]
Outcome: [Coordinate or confidence level]
Key lesson: [One takeaway]
```

---

### 5. Tools Reference

| Tool | Phase | Notes |
| --- | --- | --- |
| Google Earth Pro | 2, 3 | Historical imagery; 3D view |
| Sentinel Hub Playground | 3 | Free satellite; good for large scenes |
| Mapillary | 2 | Crowdsourced street-level |
| Wikimapia | 2 | Local community labels |
| SunCalc | 3 | Shadow/sun verification |
| OSM Overpass Turbo | 2 | Query specific infrastructure patterns |
| Aerialod / QGIS | 3 | Elevation and 3D cross-reference |
| Aegis Lens geolocation workspace | 2, 3 | [Internal link to product page] |

---

### 6. Downloadable Cheat Sheet

One-page PDF: the 4-phase framework with the cue-extraction checklist, tool
links, and confidence rating scale. Gated email capture.

**[Link internally to the photo verification pillar `/learn/how-to-verify-a-photo`
for the broader verification context.]**

---

### 7. Community Challenges & Bounties

Aegis Lens runs periodic geolocation challenges tied to this content:
- A new public case is posted; analysts submit their proposed coordinate with
  methodology.
- Verified solutions earn contributor badges (see [OSINT analyst persona](../audiences/personas.md#p3--osint-analysts)).
- Link from this pillar → challenges page → community engagement loop.

---

## Review workflow

Two-reviewer fact-check (methodology + editorial). UK translation at launch (not
Phase 2 — this content is particularly relevant to Ukrainian analysts).
Semi-annual refresh.
