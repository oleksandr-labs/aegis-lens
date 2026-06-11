# How to Verify a Photo or Video: A Complete OSINT Guide

> **Production status:** Outline + structure + schema complete. Assign to expert
> for prose and worked example. Two-reviewer fact-check required before publish.
> **Target length:** 3,000–4,500 words.
> **Target keyword:** "how to verify a photo," "verify video OSINT."
> **Schema:** `HowTo` + `Article`. Lead-generation hook: downloadable checklist PDF.

---

## Meta

```
Title tag:    How to Verify a Photo or Video: OSINT Verification Guide (2025)
Meta desc:    Step-by-step: reverse image search, EXIF data, shadow analysis,
              vegetation, OSM cross-reference, and deepfake detection. Used by
              journalists and conflict analysts worldwide.
Canonical:    /learn/how-to-verify-a-photo
hreflang:     en (canonical) | uk (Phase 2)
Schema:       HowTo, Article
Lead gen:     Downloadable PDF checklist (gated behind email)
```

---

## Outline

### 1. Introduction (~250 words)

- Why photo/video verification matters: in the Ukraine conflict, mis-attributed
  imagery has been used to spread panic and disinformation. The same footage has
  appeared in different contexts years apart.
- Who should read this: journalists, OSINT analysts, fact-checkers, anyone sharing
  conflict imagery.
- What this guide covers: a repeatable, step-by-step process a practitioner can
  follow in under 30 minutes for most images.

---

### 2. The Verification Mindset: Chain of Custody (~200 words)

- Think like a forensic examiner, not a journalist in a hurry.
- Preserve evidence first: archive the original URL (archive.org / archive.ph),
  take a screenshot with timestamp, record the URL and access date.
- "If in doubt, leave it out" — the cost of wrong verification is higher than the
  cost of not publishing.

---

### 3. Step-by-Step Verification Process (`HowTo` schema)

```json
{
  "@type": "HowTo",
  "name": "How to Verify a Photo or Video",
  "step": [
    { "name": "Step 1: Preserve the original", "text": "Archive the source URL and take a timestamped screenshot before anything else." },
    { "name": "Step 2: Reverse image search", "text": "Run the image through Google Images, TinEye, Yandex Images, and Bing Visual Search. Look for the earliest appearance date." },
    { "name": "Step 3: Extract and check metadata (EXIF)", "text": "Use ExifTool or Jeffrey's Exif Viewer. Check: capture timestamp, GPS coordinates (if present), camera model, software. Note: social platforms strip EXIF — absence ≠ fabrication." },
    { "name": "Step 4: Geolocate using visual cues", "text": "Identify landmarks, road markings, signage, vegetation, and architecture. Cross-reference with Google Street View, Mapillary, and OpenStreetMap." },
    { "name": "Step 5: Verify sun and shadow", "text": "Use SunCalc.org with the claimed date, time, and location. Shadow angles must match the sun's position." },
    { "name": "Step 6: Vegetation and seasonal check", "text": "Leaf state (bare / budding / full / autumn) must be consistent with the claimed date and location's climate." },
    { "name": "Step 7: Cross-reference the scene", "text": "Find the location in satellite imagery (Sentinel Hub, Google Earth historical) at the claimed date. Buildings, damage, and landscape must match." },
    { "name": "Step 8: Deepfake / AI-generation check", "text": "For video: check for unnatural blinking, hair movement, lighting inconsistencies. Tools: Deepware Scanner, Microsoft Video Authenticator, Hive Moderation." },
    { "name": "Step 9: Cross-source corroboration", "text": "Find at least one independent source confirming the same event from a different angle or medium before considering it verified." },
    { "name": "Step 10: Assign confidence and document", "text": "Rate confidence: Verified / Unverified / False. Document every step taken, every tool used, every source consulted." }
  ]
}
```

**Each step gets 150–250 words of prose + a tool recommendation + a screenshot
(from a public, previously-verified case).**

---

### 4. Worked Example: End-to-End (~500 words)

**[Author: choose a publicly documented, already-verified historical case (e.g.,
a Bellingcat or DFRLab investigation that is fully public). Walk through the exact
steps applied to that image/video. Do NOT use unverified or proprietary examples.]**

Structure:
- The claim and source
- Step 1–5 applied (with screenshots)
- What was found
- Confidence assessment

---

### 5. Free Tools Reference

| Tool | What it checks | Link |
| --- | --- | --- |
| Google Reverse Image Search | Earliest appearances | images.google.com |
| TinEye | Oldest indexed copy | tineye.com |
| Yandex Images | Best for Cyrillic/Eastern European images | yandex.com/images |
| InVID / WeVerify | Video keyframe extraction + reverse search | invid-project.eu |
| ExifTool (CLI) | Full metadata extraction | exiftool.org |
| Jeffrey's Exif Viewer | Browser-based EXIF | exifdata.com |
| SunCalc | Sun/shadow angle verification | suncalc.org |
| Sentinel Hub Playground | Satellite imagery | sentinel-hub.com |
| Google Earth Pro | Historical satellite + 3D | earth.google.com |
| Deepware Scanner | Deepfake video detection | deepware.ai |

Each tool name links to an internal tool page (generates internal links).

---

### 6. Common Mistakes (and How to Avoid Them)

- **Stopping at one reverse image search.** Yandex finds things Google misses
  and vice versa — run both.
- **Trusting EXIF GPS blindly.** GPS can be spoofed or injected post-capture.
  Corroborate with visual cues.
- **Ignoring the original source.** A re-uploaded file loses EXIF. Trace to the
  earliest upload.
- **Confirming bias.** If you expect the image is real, you'll find reasons it
  is. Actively try to disprove it.

---

### 7. Downloadable Checklist (Lead generation)

A one-page PDF version of the 10-step process above. Gated behind email capture
(free download, no credit card). Used by over `[X]` journalists and analysts.

**[Design team: PDF at brand standard. Include the URL of this page as the
source reference on the PDF for attribution.]]**

---

## Review workflow

Same as OSINT pillar — two reviewers (methodology + editorial/legal), SEO check,
semi-annual refresh. UK translation Phase 2.
