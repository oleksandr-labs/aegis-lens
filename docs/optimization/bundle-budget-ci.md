# Bundle Budget CI Integration

Automated bundle size enforcement runs as a post-build step in GitHub Actions.

## Files

| File | Purpose |
|------|---------|
| `apps/web/src/lib/optimization/bundle-budget.ts` | Budget definitions + `checkBundleBudget()` |
| `.github/scripts/check-bundle-budget.js` | Node.js CI runner script |

## Budgets

| Asset | Warning | Hard Limit |
|-------|---------|-----------|
| `initial-js` | 200 KB | 250 KB |
| `map-chunk` | 350 KB | 400 KB |
| `total-css` | 40 KB | 50 KB |
| `largest-image` | 150 KB | 200 KB |

## Adding to ci.yml

Add this step **after** the `next build` step in `.github/workflows/ci.yml`:

```yaml
- name: Check bundle budgets
  working-directory: apps/web
  run: node ../../.github/scripts/check-bundle-budget.js
  env:
    NEXT_BUILD_DIR: .next
```

The script exits with code 1 if any hard limit is exceeded (fails the CI job).
It logs warnings for budgets in the warning zone but does not fail.

## Environment Overrides

```bash
NEXT_BUILD_DIR=apps/web/.next   # path to Next.js output directory
BUDGET_CONFIG='[{"name":"initial-js","maxKb":300,"warningKb":250}]'  # JSON override
```

## Measurement Method

The script reads:
- `.next/build-manifest.json` — chunks for `/_app` page (initial JS)
- `.next/static/chunks/*.js` — files containing "map" in the name (map chunk)
- `.next/static/css/*.css` — all CSS files (total CSS)
- `public/**/*.{jpg,png,webp,avif,gif}` — largest image asset

For more accurate measurements, integrate `@next/bundle-analyzer` and pass
`BUNDLE_CONFIG` with measurements from its JSON output.
