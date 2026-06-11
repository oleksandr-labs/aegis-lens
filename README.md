# Aegis Lens

> Working name. AI-native OSINT intelligence platform — Ukraine first, global next.

This repo is the implementation skeleton; the full architecture lives in [TODO/](TODO/) (600+ TODO docs covering product, SEO, AI, infra, legal, ops).

## Status

**Sprint 0 — full skeleton.** Monorepo + Next.js 15 (App Router) + locale routing (EN/UK) + landing + auth scaffold + map workspace placeholder + first programmatic template + SEO infra.

## Stack

- **Frontend:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind
- **i18n:** locale segment `[locale]`, EN default, UK scaffolded
- **Tooling:** pnpm + Turbo monorepo
- **Map (skeleton):** Mapbox GL JS (token via env)

See [TODO/architecture/TODO_tech_stack.md](TODO/architecture/TODO_tech_stack.md) for the full intended stack.

## Layout

```
apps/
  web/                  Next.js app (landing + workspace + programmatic)
packages/
  types/                Event schema + shared types
  url-builder/          SEO-friendly slug + URL builder
  i18n-config/          Locale list + fallback chain
TODO/                   Architecture & planning docs (kept)
```

## Quickstart

```bash
pnpm install
cp .env.example .env.local        # add Mapbox token if you have one
pnpm dev                          # http://localhost:3000
```

## Conventions

- Branches: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, …)
- See [TODO/dev_bootstrap/](TODO/dev_bootstrap/) for full conventions

## Next milestones

1. Lock final brand + register domain → see [TODO/pre_dev_setup/](TODO/pre_dev_setup/)
2. Real auth (WorkOS or Clerk) → [TODO/pages/TODO_auth.md](TODO/pages/TODO_auth.md)
3. First real data source ingestion (Telegram or alerts.in.ua) → [TODO/integrations/](TODO/integrations/)
4. AI copilot v0 → [TODO/ai/TODO_copilot.md](TODO/ai/TODO_copilot.md)

## License

Proprietary (TBD per [TODO/pre_dev_setup/TODO_open_source_strategy.md](TODO/pre_dev_setup/TODO_open_source_strategy.md)).
