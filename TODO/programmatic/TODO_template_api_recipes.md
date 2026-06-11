# Template — API Recipes / Cookbook

## URLs
- `/cookbook` index ✓ Sprint 2.13
- `/cookbook/<recipe-slug>` ✓ Sprint 2.13 (6 seed recipes: fetch-recent-events, paginate-events, filter-by-class, subscribe-to-rss, build-region-dashboard, score-and-threshold)
- `/cookbook/<language>/<use-case>` — deferred (language-keyed variant)

## Progress
- 4 / 4 done

## Content
- [x] Per-recipe: goal + code + walkthrough ✓ Sprint 2.13 (goal + numbered steps + 1–3 language snippets)
- [x] Languages: TS / Python / Go ✓ Sprint 2.13 (TypeScript + Python + cURL across recipes; Go added where idiomatic)
- [x] Schema.org `HowTo` ✓ Sprint 2.13 (per recipe + per step) + BreadcrumbList
- [x] Per-recipe runnable in Postman / Bruno ✓ Sprint 2.24 (`/api/cookbook/<slug>/postman.json` — single-request Postman v2.1 collection per recipe, parsed from the first curl snippet; "Run this recipe" download block on each recipe page; Bruno + Insomnia accept the same JSON)
