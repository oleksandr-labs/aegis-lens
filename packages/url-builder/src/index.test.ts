import { describe, expect, it } from "vitest";
import { slugify, localePath, urls, absoluteUrl, hreflangs } from "./index";

describe("slugify", () => {
  it("lowercases and kebab-cases ASCII", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
  });

  it("transliterates Cyrillic by default", () => {
    expect(slugify("Харків")).toBe("kharkiv");
    expect(slugify("Київ")).toBe("kyiv");
  });

  it("collapses repeated separators", () => {
    expect(slugify("foo --- bar///baz")).toBe("foo-bar-baz");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugify("  -foo-  ")).toBe("foo");
  });

  it("enforces max length and cuts at word boundary", () => {
    const long = "this is a fairly long phrase that should be cut at a word boundary";
    const out = slugify(long, { maxLength: 30 });
    expect(out.length).toBeLessThanOrEqual(30);
    expect(out.endsWith("-")).toBe(false);
  });

  it("keeps unicode when transliterate=false", () => {
    expect(slugify("Харків", { transliterate: false })).toBe("харків");
  });
});

describe("localePath", () => {
  it("omits prefix for default locale (en)", () => {
    expect(localePath("en", "/map")).toBe("/map");
    expect(localePath("en", "map")).toBe("/map");
  });

  it("prefixes non-default locales", () => {
    expect(localePath("uk", "/map")).toBe("/uk/map");
    expect(localePath("de", "/about")).toBe("/de/about");
  });
});

describe("urls.* builders", () => {
  it("produces canonical home for default + non-default locales", () => {
    expect(urls.home("en")).toBe("/");
    expect(urls.home("uk")).toBe("/uk/");
  });

  it("builds region paths with lowercase ISO2", () => {
    expect(urls.region("en", "UA")).toBe("/regions/ua");
    expect(urls.region("uk", "UA", "kharkiv")).toBe("/uk/regions/ua/kharkiv");
  });

  it("builds equipment, conflict, entity slugs", () => {
    expect(urls.equipment("en", "shahed-136")).toBe("/equipment/shahed-136");
    expect(urls.conflict("uk", "russia-ukraine")).toBe("/uk/conflicts/russia-ukraine");
    expect(urls.entity("en", "iskander-m")).toBe("/entities/iskander-m");
  });

  it("supports companies × industry × city programmatic combination", () => {
    expect(urls.companies("en", "cybersecurity", "london")).toBe(
      "/companies/cybersecurity/london",
    );
    expect(urls.companies("en")).toBe("/companies");
  });
});

describe("absoluteUrl", () => {
  it("strips trailing slash from base and prepends leading slash to path", () => {
    expect(absoluteUrl("https://example.com/", "regions/ua")).toBe(
      "https://example.com/regions/ua",
    );
  });
});

describe("hreflangs", () => {
  it("includes every locale + x-default pointing to EN", () => {
    const out = hreflangs("https://example.com", (lc) => urls.region(lc, "ua"));
    const map = Object.fromEntries(out.map((e) => [e.hreflang, e.href]));
    expect(map.en).toBe("https://example.com/regions/ua");
    expect(map.uk).toBe("https://example.com/uk/regions/ua");
    expect(map["x-default"]).toBe("https://example.com/regions/ua");
  });
});
