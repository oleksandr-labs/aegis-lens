#!/usr/bin/env node
/**
 * CI post-build bundle budget checker.
 *
 * Reads Next.js build output from .next/build-manifest.json and
 * the optional .next/build-stats.json (emitted by next-bundle-analyzer).
 * Reports warnings and exits with code 1 if any hard budget is exceeded.
 *
 * Usage (in ci.yml after `next build`):
 *   node .github/scripts/check-bundle-budget.js
 *
 * Environment variables:
 *   NEXT_BUILD_DIR  — path to .next output dir (default: .next)
 *   BUDGET_CONFIG   — JSON array overriding default budgets (optional)
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Budget definitions (mirrors apps/web/src/lib/optimization/bundle-budget.ts)
// ---------------------------------------------------------------------------
const DEFAULT_BUDGETS = [
  { name: "initial-js", maxKb: 250, warningKb: 200 },
  { name: "map-chunk", maxKb: 400, warningKb: 350 },
  { name: "total-css", maxKb: 50, warningKb: 40 },
  { name: "largest-image", maxKb: 200, warningKb: 150 },
];

const BUDGETS = process.env.BUDGET_CONFIG
  ? JSON.parse(process.env.BUDGET_CONFIG)
  : DEFAULT_BUDGETS;

const BUILD_DIR = process.env.NEXT_BUILD_DIR || path.join(process.cwd(), ".next");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function bytesToKb(bytes) {
  return bytes / 1024;
}

function checkBudget(name, actualKb) {
  const target = BUDGETS.find((b) => b.name === name);
  if (!target) return "ok";
  if (actualKb > target.maxKb) return "exceeded";
  if (actualKb > target.warningKb) return "warning";
  return "ok";
}

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Collect measured asset sizes from the Next.js build output
// ---------------------------------------------------------------------------
function collectMeasurements() {
  const measurements = {};

  // --- Initial JS: sum of chunks in pages/_app ---
  const buildManifest = readJsonSafe(path.join(BUILD_DIR, "build-manifest.json"));
  if (buildManifest) {
    const appChunks = buildManifest.pages?.["/_app"] ?? [];
    let initialJsBytes = 0;
    for (const chunkPath of appChunks) {
      const full = path.join(BUILD_DIR, chunkPath.replace(/^\/?_next\//, ""));
      try {
        initialJsBytes += fs.statSync(full).size;
      } catch {
        // chunk might not exist on disk (CDN path) — skip
      }
    }
    measurements["initial-js"] = bytesToKb(initialJsBytes);
  }

  // --- Map chunk: look for chunks whose name contains "map" ---
  const chunksDir = path.join(BUILD_DIR, "static", "chunks");
  if (fs.existsSync(chunksDir)) {
    let mapChunkBytes = 0;
    let largestImageKb = 0;

    for (const file of fs.readdirSync(chunksDir)) {
      const full = path.join(chunksDir, file);
      const stat = fs.statSync(full);
      if (file.match(/map/i) && file.endsWith(".js")) {
        mapChunkBytes += stat.size;
      }
    }
    measurements["map-chunk"] = bytesToKb(mapChunkBytes);

    // --- Largest image in public/ ---
    const publicDir = path.join(process.cwd(), "public");
    if (fs.existsSync(publicDir)) {
      const imgExts = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];
      function walkImages(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walkImages(full);
          } else if (imgExts.includes(path.extname(entry.name).toLowerCase())) {
            const kb = bytesToKb(fs.statSync(full).size);
            if (kb > largestImageKb) largestImageKb = kb;
          }
        }
      }
      try {
        walkImages(publicDir);
      } catch {
        // non-fatal
      }
      measurements["largest-image"] = largestImageKb;
    }
  }

  // --- Total CSS ---
  const cssDir = path.join(BUILD_DIR, "static", "css");
  if (fs.existsSync(cssDir)) {
    let totalCssBytes = 0;
    for (const file of fs.readdirSync(cssDir)) {
      if (file.endsWith(".css")) {
        totalCssBytes += fs.statSync(path.join(cssDir, file)).size;
      }
    }
    measurements["total-css"] = bytesToKb(totalCssBytes);
  }

  return measurements;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  console.log("Bundle budget check — Aegis Lens / Ukrainian MAP\n");

  const measurements = collectMeasurements();

  if (Object.keys(measurements).length === 0) {
    console.warn(
      "WARNING: No build output found at " +
        BUILD_DIR +
        ". Skipping budget check (ensure `next build` ran first)."
    );
    process.exit(0);
  }

  let hasExceeded = false;

  for (const budget of BUDGETS) {
    const actualKb = measurements[budget.name];
    if (actualKb === undefined) {
      console.log(`  [SKIP] ${budget.name} — no measurement available`);
      continue;
    }

    const status = checkBudget(budget.name, actualKb);
    const actual = actualKb.toFixed(1);

    if (status === "exceeded") {
      console.error(
        `  [FAIL] ${budget.name}: ${actual} KB > limit ${budget.maxKb} KB`
      );
      hasExceeded = true;
    } else if (status === "warning") {
      console.warn(
        `  [WARN] ${budget.name}: ${actual} KB (warning at ${budget.warningKb} KB, limit ${budget.maxKb} KB)`
      );
    } else {
      console.log(
        `  [ OK ] ${budget.name}: ${actual} KB (limit ${budget.maxKb} KB)`
      );
    }
  }

  console.log("");

  if (hasExceeded) {
    console.error("One or more bundle budgets exceeded. Fix before merging.");
    process.exit(1);
  } else {
    console.log("All bundle budgets OK.");
    process.exit(0);
  }
}

main();
