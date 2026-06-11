import { describe, expect, it } from "vitest";
import { absoluteUrl, urls } from "@aegis/url-builder";
import { buildMetadata } from "../../seo";
import { SITE } from "../../site";

/**
 * Canonical correctness CI test (TODO/seo/TODO_url_seo.md).
 *
 * Exercises the shared `buildMetadata` builder and the underlying `absoluteUrl`
 * to guarantee canonical invariants:
 *  - canonical is absolute, on the configured site origin
 *  - canonical reflects the REQUESTING locale (self-referential canonical)
 *  - canonical has no trailing slash (except root) and is lowercase-safe
 *  - canonical appears in the hreflang alternates set (self-reference)
 */
describe("canonical correctness", () => {
  it("canonical is absolute and on the site origin", () => {
    const meta = buildMetadata({
      locale: "en",
      title: "t",
      description: "d",
      pathFor: (lc) => urls.topic(lc, "sanctions"),
    });
    const canonical = String(meta.alternates?.canonical);
    expect(canonical.startsWith(SITE.url)).toBe(true);
    expect(canonical).toBe(`${SITE.url}/topics/sanctions`);
  });

  it("canonical is self-referential per locale (uk request → uk canonical)", () => {
    const meta = buildMetadata({
      locale: "uk",
      title: "t",
      description: "d",
      pathFor: (lc) => urls.topic(lc, "sanctions"),
    });
    expect(String(meta.alternates?.canonical)).toBe(`${SITE.url}/uk/topics/sanctions`);
  });

  it("canonical has no trailing slash for non-root paths", () => {
    const canonical = absoluteUrl(SITE.url, "/topics/sanctions");
    expect(canonical.endsWith("/")).toBe(false);
  });

  it("canonical is present in the hreflang language alternates", () => {
    const meta = buildMetadata({
      locale: "uk",
      title: "t",
      description: "d",
      pathFor: (lc) => urls.topic(lc, "sanctions"),
    });
    const canonical = String(meta.alternates?.canonical);
    const langs = Object.values(meta.alternates?.languages ?? {}).map(String);
    expect(langs).toContain(canonical);
  });

  it("noindex pages still emit a canonical", () => {
    const meta = buildMetadata({
      locale: "en",
      title: "t",
      description: "d",
      noindex: true,
      pathFor: (lc) => urls.topic(lc, "sanctions"),
    });
    expect(meta.alternates?.canonical).toBeTruthy();
    expect(meta.robots).toMatchObject({ index: false });
  });
});
