# Aegis Lens — Master Editorial Policy

**Version:** 1.0  
**Status:** Active — review annually or after any major conflict launch  
**Owner:** Editorial Board  
**Last reviewed:** 2026-06-10  
**Translation needed:** UK (Ukrainian) version pending

---

## 1. Verification Standards

All content published on Aegis Lens must meet the following verification thresholds before becoming visible to users:

- **Tier 1 sources** (institutionally verified, canonical): A single T1 source is sufficient to publish an event, subject to the harm-reduction test (§7).
- **Tier 2 sources** (reliable with corroboration): Minimum two independent T2 sources, or one T2 + one T1.
- **Tier 3 sources** (supplementary signal): Minimum three independent sources including at least one T1 or two T2. T3-only claims are never published as confirmed events.

Verification must occur before publication, not after. Pre-publication corrections do not count against the outlet's reliability record; post-publication errors require a Corrections entry (§9).

**Escalated verification** applies to: civilian casualty figures, attribution of attacks on civilian infrastructure, claims of chemical or biological weapon use, and any event classified as a potential war crime or crime against humanity. These require T1 + independent OSINT corroboration and editorial board review.

---

## 2. Source Credibility Tiers

Aegis Lens operates a three-tier source framework, documented in full in `apps/web/src/lib/sources-data.ts` and per-conflict source configs.

| Tier | Description | Confidence | Corroboration |
|------|-------------|------------|---------------|
| T1   | Institutionally verified, consistently accurate, canonical | High | Not required (harm test applies) |
| T2   | Generally reliable; track record established | Medium | 1 T1 or 2 T2 required |
| T3   | Supplementary signal; early detection only | Low | Multi-source mandatory |

Source tier ratings are conflict-specific. A source rated T1 for one conflict may be T2 for another where its coverage is less established. Per-conflict source configs define these overrides explicitly.

**Source bias tracking:** Where a source has a documented editorial or political orientation, this is noted in the source metadata and reflected in the balanced-source requirements. No single actor's narrative is presented as primary truth.

---

## 3. Toponymy Policy

Place names are politically contested in every active conflict zone. Aegis Lens follows these principles:

1. **Default to the internationally recognised or most inclusive neutral form.** For EU and UN purposes, UN OCHA and national mapping standards take precedence.
2. **Conflict-zone name choices are documented.** Each conflict config includes a `ConflictToponymMap` listing preferred forms, alternatives, and rationale.
3. **State-preferred names in contested territories** are used only where they are the internationally recognised standard or where the alternative imposes a political position.
4. **Raw source strings are preserved in metadata** so researchers and journalists can audit name-form decisions.
5. **Normalisation at ingestion.** Alternative spellings from source material are normalised to the preferred form at the platform layer; the original is stored.

Examples: Kyiv (not Kiev); West Bank (not Judea and Samaria editorially); Donbas (not Donbass); Timbuktu in EN (not Tombouctou).

---

## 4. Casualty Reporting

Casualty figures are among the most politically sensitive and methodologically contested data points in conflict reporting. Aegis Lens policy:

- **Always attribute figures** to the specific source with date and methodology note.
- **Never aggregate conflicting figures** into a single headline number without disclosure that sources diverge.
- **IPC Phase classifications** are used for famine and food-insecurity severity — no speculative famine declarations outside IPC process.
- **Civilian vs combatant distinctions** are preserved where source data provides them; conflation is noted where it occurs in source material.
- **Escalated verification** (§1) applies to all mass-casualty event claims.
- **Under-reporting acknowledgement:** Where access restrictions limit verification (Sudan, Myanmar, Yemen), an explicit caveat is shown alongside casualty data.

---

## 5. AI-Generated Content Disclaimers

Aegis Lens uses AI/ML systems for event classification, entity extraction, map annotation, and trend detection. Policy:

- **No AI-generated factual claims** about events, casualties, or attribution are published without human editorial review.
- **AI-assisted summaries** are labelled as such and include a link to the underlying verified source events.
- **Confidence scores** for AI classifications are exposed in the data layer and available to API subscribers.
- **Model limitations disclosure:** The platform publishes a standing notice that AI classification may contain errors and that users should consult primary sources for critical decisions.

---

## 6. Conflicts of Interest

Editorial staff and external advisors must disclose:

- Any financial, familial, or political relationship with a party to a covered conflict.
- Any prior employment by a government, military, or intelligence service of a party to a conflict covered in a phase within the last five years.
- Any advisory, board, or consulting role with an NGO, advocacy organisation, or media outlet that takes editorial positions on covered conflicts.

Disclosures are reviewed by the editorial board chair. Conflicts of interest do not automatically preclude participation; recusal from specific decisions is the standard remedy.

---

## 7. Harm-Reduction Framework

Before publishing sensitive material, the editorial team applies the following test:

1. **Public interest:** Does publication serve a genuine public interest (accountability, humanitarian awareness, security transparency)?
2. **Proportionality:** Is the public-interest benefit proportionate to the potential harm to identifiable individuals or groups?
3. **Necessity:** Is publication necessary to serve the public interest, or can the same interest be served with less harmful material?
4. **Mitigation:** Have available harm-reduction measures been applied (pixelation, name suppression, coordinate generalisation, time delay)?

If all four tests are passed, publication may proceed. If any test fails, the editorial board must review before publication. A harm-reduction log is maintained for all escalated decisions.

**Absolute prohibitions** (no harm-reduction test overrides):
- Real-time precision locations of civilian shelters or evacuation routes.
- Faces or identifying information of minors in conflict settings.
- Information that could directly enable military targeting of civilian infrastructure.
- Survivor identification in sexual violence reporting.

---

## 8. Corrections Policy

When an error is identified in published content:

1. The error is corrected as quickly as technically possible.
2. A Corrections notice is appended to the affected content, visible to all users, stating: what was wrong, what the correct information is, and when the correction was made.
3. Corrections are logged in the editorial corrections register.
4. Corrections that affect event confidence scores trigger a downstream re-evaluation of dependent events.
5. Systematic errors (affecting a class of events) are escalated to the editorial board and disclosed publicly.

Source-based errors (where the platform correctly reported what a source said, but the source was wrong) are handled as source-reliability updates, not platform corrections, unless the platform added its own confirmation.

---

## 9. Takedown Policy

Aegis Lens will consider takedown requests on the following grounds:

- **Safety risk:** Publication creates an ongoing, specific safety risk to an identifiable individual or group. Assessed case by case; editorial board + legal review.
- **Legal order:** A lawful court order in a jurisdiction with rule-of-law standards requiring takedown. Reviewed by counsel; complied with where legally binding.
- **Factual error:** The content is materially false. Handled as a Correction (§8) unless the complete removal of the content is necessary to prevent harm.

Takedown requests on grounds of political inconvenience, reputational preference, or commercial pressure are declined. All takedown requests and decisions are logged.

---

## 10. Ethics Board

The Aegis Lens Ethics Board provides oversight on:

- All new conflict launches (Phase 3 and above require formal sign-off).
- High-risk event type classification changes.
- Editorial policy amendments.
- Complaints from the public or subject communities.
- Annual policy review.

The Ethics Board comprises external members with expertise in international humanitarian law, journalism ethics, OSINT methodology, and regional conflict analysis. Membership, terms of reference, and meeting records are published on the platform's transparency page.

**Contact:** ethics@aegislens.com  

---

*This document is the master editorial policy for all Aegis Lens conflict coverage. Per-conflict editorial policies in `apps/web/src/lib/conflicts/` extend but do not override these principles.*
