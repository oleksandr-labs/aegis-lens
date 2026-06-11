# TODO — Tech Stack (Canonical)

## Goal
One place that names every chosen technology + reason + alternatives.

## Progress
- 1 / 1 done

## Stack

### Frontend
- Next.js 15 (App Router) · React 19 · TypeScript · Tailwind · shadcn/ui · Framer Motion · GSAP · deck.gl · Mapbox GL (MapLibre fallback) · TanStack Query · Zustand · nuqs · React Hook Form · Zod

### Backend
- API gateway: Envoy / custom Fastify
- App services: Node.js (NestJS) for app logic; Python (FastAPI) for AI / data; Go for hot paths (ingest, tiles)
- Streaming: Kafka (Redpanda dev) · Schema Registry · Debezium
- Orchestration: Temporal · Dagster (data)

### Data
- PostgreSQL 16 + PostGIS + TimescaleDB
- Elasticsearch / OpenSearch
- Qdrant (vector)
- Redis (cache + pub/sub)
- S3 + Parquet cold archive · DuckDB / Trino

### AI
- Anthropic Claude (primary) · OpenAI (secondary) · self-hosted vLLM (open-weights)
- Whisper · YOLOv8 / RT-DETR · PaddleOCR · NLLB

### Infra
- AWS (eu-central + us-east) · Cloudflare (CDN/WAF/DNS) · Vercel (FE) · EKS · Terraform · Argo CD · Helm · Cilium · cert-manager

### Observability
- OpenTelemetry · Tempo / Honeycomb · Loki / OpenSearch · Prometheus · Grafana · Langfuse

### Dev / Quality
- pnpm · Turbo · Biome / oxlint · Vitest / Playwright · Storybook · axe-core · gitleaks · Snyk · Semgrep

## Tasks
- [x] Canonical tech-stack reference with "Why chosen" + "Alternatives rejected" per technology → [docs/architecture/tech-stack.md](../../docs/architecture/tech-stack.md)

## i18n
- next-intl · NLLB self-host · DeepL · CLDR

### Примітки
Every entry should link to an ADR with the why.

### Done notes (2026-05-30)
Full table at [docs/architecture/tech-stack.md](../../docs/architecture/tech-stack.md):
Frontend / Backend / Streaming+Orchestration / Data stores / AI models / Infra /
Observability / Dev tooling / i18n — each row has "Why chosen" and
"Alternatives rejected". ADR cross-reference table at the bottom (to be filled
as ADRs are written).
