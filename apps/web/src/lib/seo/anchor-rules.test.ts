import { describe, it, expect } from "vitest";
import {
  ruleDescriptive,
  ruleNoRawUrl,
  ruleVariety,
  rulePerPageVariety,
  ruleNaturalKeyword,
  ruleKeywordAlignment,
  ruleExternalContext,
  ruleImageAltAnchor,
  ruleIconAriaLabel,
  lintAnchors,
  hasErrors,
  type AnchorRecord,
} from "./anchor-rules";
import { lintCmsAnchors, varietyScore } from "./anchor-lint";
import { recommendAnchors } from "./anchor-recommender";
import { accessibleName, isNameless, iconLinkProps, iconLabel } from "./anchor-a11y";
import { auditTemplate, isFlagged } from "./anchor-audit";

function rec(p: Partial<AnchorRecord>): AnchorRecord {
  return {
    text: "",
    href: "/x",
    locale: "en",
    internal: true,
    ...p,
  };
}

describe("ruleDescriptive", () => {
  it("flags generic en anchors", () => {
    const v = ruleDescriptive([rec({ text: "click here", href: "/a" })]);
    expect(v).toHaveLength(1);
    expect(v[0].severity).toBe("error");
  });
  it("flags generic uk anchors translated, not transliterated", () => {
    const v = ruleDescriptive([rec({ text: "натисніть тут", locale: "uk" })]);
    expect(v).toHaveLength(1);
  });
  it("passes descriptive anchors", () => {
    expect(ruleDescriptive([rec({ text: "verify a conflict photo" })])).toHaveLength(0);
  });
});

describe("ruleNoRawUrl", () => {
  it("flags raw URL anchor text", () => {
    expect(ruleNoRawUrl([rec({ text: "https://example.com" })])).toHaveLength(1);
    expect(ruleNoRawUrl([rec({ text: "www.example.com" })])).toHaveLength(1);
  });
  it("ignores normal text", () => {
    expect(ruleNoRawUrl([rec({ text: "our methodology" })])).toHaveLength(0);
  });
});

describe("ruleVariety", () => {
  it("flags same anchor pointing to different targets", () => {
    const v = ruleVariety([
      rec({ text: "report", href: "/a" }),
      rec({ text: "report", href: "/b" }),
    ]);
    expect(v).toHaveLength(1);
  });
  it("allows same anchor to same target", () => {
    const v = ruleVariety([
      rec({ text: "report", href: "/a" }),
      rec({ text: "report", href: "/a" }),
    ]);
    expect(v).toHaveLength(0);
  });
});

describe("rulePerPageVariety", () => {
  it("flags excessive repetition", () => {
    const anchors = Array.from({ length: 5 }, () => rec({ text: "drones", href: "/d" }));
    expect(rulePerPageVariety(anchors, 4)).toHaveLength(1);
  });
});

describe("ruleNaturalKeyword", () => {
  it("flags stuffing (repeated token)", () => {
    const v = ruleNaturalKeyword([rec({ text: "drone drone drone strike" })]);
    expect(v.length).toBeGreaterThanOrEqual(1);
  });
  it("flags over-long anchors", () => {
    const long = Array.from({ length: 14 }, (_, i) => `w${i}`).join(" ");
    expect(ruleNaturalKeyword([rec({ text: long })]).length).toBeGreaterThanOrEqual(1);
  });
});

describe("ruleKeywordAlignment", () => {
  it("flags internal anchor with no keyword overlap", () => {
    const v = ruleKeywordAlignment([
      rec({ text: "see this", targetKeywords: ["air defense"] }),
    ]);
    expect(v).toHaveLength(1);
  });
  it("passes when anchor shares a keyword", () => {
    const v = ruleKeywordAlignment([
      rec({ text: "Ukraine air defense breakdown", targetKeywords: ["air defense"] }),
    ]);
    expect(v).toHaveLength(0);
  });
  it("aligns uk anchors against uk keywords (translated)", () => {
    const v = ruleKeywordAlignment([
      rec({
        text: "протиповітряна оборона України",
        locale: "uk",
        targetKeywords: ["протиповітряна оборона"],
      }),
    ]);
    expect(v).toHaveLength(0);
  });
});

describe("ruleExternalContext", () => {
  it("flags bare external link", () => {
    const v = ruleExternalContext([
      rec({ text: "ISW", href: "https://isw.org", internal: false, context: "ISW" }),
    ]);
    expect(v).toHaveLength(1);
  });
  it("passes contextualized external link", () => {
    const v = ruleExternalContext([
      rec({
        text: "ISW",
        href: "https://isw.org",
        internal: false,
        context: "Per the daily assessment from ISW, the front shifted.",
      }),
    ]);
    expect(v).toHaveLength(0);
  });
});

describe("ruleImageAltAnchor", () => {
  it("flags image link with empty alt", () => {
    const v = ruleImageAltAnchor([rec({ isImageLink: true, imageAlt: "" })]);
    expect(v).toHaveLength(1);
    expect(v[0].severity).toBe("error");
  });
  it("passes image link with alt", () => {
    expect(ruleImageAltAnchor([rec({ isImageLink: true, imageAlt: "Kherson bridge" })])).toHaveLength(0);
  });
});

describe("ruleIconAriaLabel", () => {
  it("flags icon link without aria-label", () => {
    expect(ruleIconAriaLabel([rec({ isIconOnly: true })])).toHaveLength(1);
  });
  it("passes icon link with aria-label", () => {
    expect(ruleIconAriaLabel([rec({ isIconOnly: true, ariaLabel: "Search" })])).toHaveLength(0);
  });
});

describe("lintAnchors + hasErrors", () => {
  it("aggregates all rules and detects errors", () => {
    const violations = lintAnchors([
      rec({ text: "click here", href: "/a" }),
      rec({ isImageLink: true, imageAlt: "" }),
    ]);
    expect(hasErrors(violations)).toBe(true);
  });
});

describe("anchor-lint CMS report", () => {
  it("computes variety score", () => {
    expect(varietyScore([rec({ text: "a" }), rec({ text: "a" })])).toBe(0.5);
    expect(varietyScore([rec({ text: "a" }), rec({ text: "b" })])).toBe(1);
  });
  it("flags low variety below floor", () => {
    const anchors = [rec({ text: "drones", href: "/d" }), rec({ text: "drones", href: "/d" })];
    const report = lintCmsAnchors(anchors, { minVariety: 0.6 });
    expect(report.violations.some((v) => v.rule === "min-variety")).toBe(true);
  });
});

describe("anchor-recommender", () => {
  it("suggests descriptive title + keyword variants, excluding used", () => {
    const out = recommendAnchors(
      { title: "Ukraine Air Defense: A Deep Dive", keywords: ["air defense"], locale: "en" },
      ["air defense"],
    );
    const texts = out.map((s) => s.text.toLowerCase());
    expect(texts).not.toContain("air defense"); // already used → excluded
    expect(texts.some((t) => t.includes("air defense"))).toBe(true);
  });
  it("produces uk variants translated, not transliterated", () => {
    const out = recommendAnchors(
      { title: "Протиповітряна оборона України", keywords: ["протиповітряна оборона"], locale: "uk" },
    );
    expect(out.length).toBeGreaterThan(0);
    // No latin transliteration leaking into uk suggestions.
    expect(out.every((s) => /[Ѐ-ӿ]/.test(s.text))).toBe(true);
  });
});

describe("anchor-a11y", () => {
  it("resolves accessible name by precedence", () => {
    expect(accessibleName({ ariaLabel: "Menu", text: "x" })).toBe("Menu");
    expect(accessibleName({ text: "Read report" })).toBe("Read report");
    expect(accessibleName({ imageAlt: "Chart" })).toBe("Chart");
    expect(isNameless({})).toBe(true);
  });
  it("builds icon props and localized labels", () => {
    expect(iconLinkProps("Search")["aria-label"]).toBe("Search");
    expect(() => iconLinkProps("  ")).toThrow();
    expect(iconLabel("rss", "uk")).toBe("Підписатися через RSS");
    expect(iconLabel("rss", "en")).toBe("Subscribe via RSS");
  });
});

describe("anchor-audit", () => {
  it("flags a templated page with low variety", () => {
    const page = Array.from({ length: 6 }, () => rec({ text: "drones", href: "/d" }));
    const audit = auditTemplate("region-hub", [page]);
    expect(audit.template).toBe("region-hub");
    expect(audit.topAnchors[0].text).toBe("drones");
    expect(isFlagged(audit)).toBe(true);
  });
});
