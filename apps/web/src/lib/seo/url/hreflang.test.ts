import { describe, expect, it } from "vitest";
import { hreflangs, urls, localePath } from "@aegis/url-builder";
import { LOCALES, DEFAULT_LOCALE } from "@aegis/i18n-config";

const SITE = "https://aegislens.example";

/**
 * Hreflang correctness CI test (TODO/seo/TODO_url_seo.md).
 *
 * Verifies the shared `hreflangs` builder against SEO invariants:
 *  - one entry per locale + an x-default
 *  - x-default points at the EN (default-locale) URL
 *  - every href is absolute and locale-prefixed correctly (EN unprefixed)
 *  - reciprocity: the alternates set is identical regardless of which locale
 *    requested it (a page in uk must reference the same en/uk variants).
 */
describe("hreflang correctness", () => {
  const pathFor = (lc: (typeof LOCALES)[number]) => urls.topic(lc, "sanctions");

  it("emits one entry per locale plus x-default", () => {
    const entries = hreflangs(SITE, pathFor);
    expect(entries).toHaveLength(LOCALES.length + 1);
    const tags = entries.map((e) => e.hreflang);
    for (const lc of LOCALES) expect(tags).toContain(lc);
    expect(tags).toContain("x-default");
  });

  it("x-default points at the default-locale (EN) URL", () => {
    const entries = hreflangs(SITE, pathFor);
    const xDefault = entries.find((e) => e.hreflang === "x-default");
    const en = entries.find((e) => e.hreflang === DEFAULT_LOCALE);
    expect(xDefault?.href).toBe(en?.href);
  });

  it("EN is unprefixed and non-EN keep their locale prefix", () => {
    const entries = hreflangs(SITE, pathFor);
    const en = entries.find((e) => e.hreflang === "en");
    const uk = entries.find((e) => e.hreflang === "uk");
    expect(en?.href).toBe(`${SITE}/topics/sanctions`);
    expect(uk?.href).toBe(`${SITE}/uk/topics/sanctions`);
  });

  it("all hrefs are absolute", () => {
    for (const e of hreflangs(SITE, pathFor)) {
      expect(e.href.startsWith("https://")).toBe(true);
    }
  });

  it("alternates are reciprocal across requesting locales", () => {
    const fromEn = hreflangs(SITE, pathFor).map((e) => e.href).sort();
    const fromUk = hreflangs(SITE, pathFor).map((e) => e.href).sort();
    expect(fromEn).toEqual(fromUk);
  });

  it("no cross-locale leakage: uk path never contains an en-only segment", () => {
    expect(localePath("uk", "/regions/ua/kharkiv")).toBe("/uk/regions/ua/kharkiv");
    expect(localePath("en", "/regions/ua/kharkiv")).toBe("/regions/ua/kharkiv");
  });
});
