/**
 * Automated accessibility tests using axe-core + Playwright.
 *
 * Run: pnpm --filter web test:a11y
 * Scans key routes for WCAG 2.2 A/AA violations.
 *
 * Note: automated scans catch ~30–40% of issues. Manual NVDA/VoiceOver
 * passes per release (see docs/a11y/) cover the rest.
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE = process.env.AXE_BASE_URL ?? "http://localhost:3000";

const ROUTES = [
  { path: "/en", name: "Home (EN)" },
  { path: "/uk", name: "Home (UK)" },
  { path: "/en/map", name: "Map workspace" },
  { path: "/en/pricing", name: "Pricing" },
  { path: "/en/reports", name: "Reports" },
  { path: "/en/sign-in", name: "Sign in" },
];

for (const route of ROUTES) {
  test(`a11y: ${route.name} has no WCAG A/AA violations`, async ({ page }) => {
    await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle" });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      // Map canvas is exempt from color-contrast (it's a data viz, has a table alt)
      .disableRules(route.path.includes("/map") ? ["color-contrast"] : [])
      .analyze();

    // Attach violations to the test report for debugging
    if (results.violations.length > 0) {
      console.error(`Violations on ${route.name}:`, JSON.stringify(results.violations, null, 2));
    }

    expect(results.violations).toEqual([]);
  });
}
