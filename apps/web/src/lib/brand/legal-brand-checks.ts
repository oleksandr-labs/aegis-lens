/**
 * Legal and compliance checks for the Aegis Lens brand.
 * Run before any public brand launch or major territory expansion.
 */

export interface BrandLegalCheck {
  checkType:
    | "trademark"
    | "domain"
    | "pronounceability"
    | "political-neutrality"
    | "weapons-similarity";
  status: "passed" | "failed" | "pending" | "not-run";
  notes_en: string;
}

export const BRAND_LEGAL_CHECKS: BrandLegalCheck[] = [
  {
    checkType: "trademark",
    status: "pending",
    notes_en:
      "Trademark search for 'Aegis Lens' in Class 42 (software/SaaS) and Class 38 (communications) not yet filed. Priority markets: EU, UK, US. Assign to legal counsel before public launch.",
  },
  {
    checkType: "domain",
    status: "pending",
    notes_en:
      "aegislens.io and aegislens.com are deferred — check availability and register before domain is squatted. aegis.lens (new gTLD) also available as of last check. Partial: working domain is configured separately.",
  },
  {
    checkType: "pronounceability",
    status: "passed",
    notes_en:
      "Tested across EN, UK (Ukrainian), RU, PL, DE speakers. 'Aegis' (EE-jis) is familiar in EN; minor coaching needed for UK/PL/DE speakers. 'Lens' is universally clear. No offensive phonetic matches found in any tested language.",
  },
  {
    checkType: "political-neutrality",
    status: "passed",
    notes_en:
      "Brand name and visual identity carry no partisan, national, or political connotation. 'Aegis' (Greek shield) is a civilian-security metaphor. Reviewed by editorial team 2024-Q1.",
  },
  {
    checkType: "weapons-similarity",
    status: "passed",
    notes_en:
      "Note: 'Aegis' is also the name of the US Navy Aegis Combat System. However, 'Aegis Lens' as a combined mark is distinct, operates in a civilian OSINT/SaaS context, and the shield metaphor has broad civilian security usage (e.g. Aegis Identity). Legal counsel confirmed acceptable for civilian platform use. Avoid defence-contractor visual aesthetics that could blur this distinction.",
  },
];
