# Tech Stack — Canonical Reference

> One place that names every chosen technology, the reason it was chosen, and
> the alternatives rejected. **Every entry links to an ADR with the full why.**
>
> Rule: when a technology changes, update this page and write (or update) the
> ADR. Outdated stack docs are worse than no docs.

---

## Frontend

| Technology | Version / Variant | Why chosen | Alternatives rejected |
| --- | --- | --- | --- |
| **Next.js** | 15, App Router | RSC for SEO + ISR; strong Ukraine-locale support; Vercel deployment; React 19 ecosystem | Remix (less mature RSC), SvelteKit (smaller ecosystem for our AI-heavy UI) |
| **React** | 19 | Industry standard; concurrent features; Server Components | Vue 3 (smaller team familiarity) |
| **TypeScript** | strict mode, everywhere | Type safety across monorepo; catches data-shape errors early across the ingest→UI pipeline | JavaScript (no type safety at boundaries) |
| **Tailwind CSS** | v4 | Utility-first; consistent design tokens; excellent with shadcn | CSS Modules (too verbose for our component density) |
| **shadcn/ui** | latest | Accessible, unstyled-by-default components; copy-into-repo model (no lock-in) | Radix UI standalone, Chakra UI |
| **Framer Motion + GSAP** | — | Framer for component-level animations; GSAP for complex timeline/scroll sequences | CSS animations only (insufficient), react-spring |
| **deck.gl** | — | GPU-accelerated WebGL map overlays for event clusters and heatmaps at scale | Leaflet (SVG, not performant at our event volumes) |
| **Mapbox GL / MapLibre** | MapLibre as open-source fallback | Vector tiles, high performance; MapLibre enables self-hosted fallback if Mapbox pricing changes | Google Maps (pricing, no vector tile control), Leaflet |
| **TanStack Query** | v5 | Server-state management, caching, optimistic updates | SWR (less powerful), Redux async |
| **Zustand** | — | Lightweight client-state; no boilerplate | Redux (too heavy for our client-state needs), Jotai |
| **nuqs** | — | URL-search-param state — keeps map filters and view state shareable via URL | Custom URL handling |
| **React Hook Form + Zod** | — | Form validation colocated with the schema; Zod schemas are shared with backend | Formik (slower), Yup |

---

## Backend

| Technology | Why chosen | Alternatives rejected |
| --- | --- | --- |
| **Fastify (API gateway)** | Low-overhead HTTP; TypeScript-first; fast serialization; plugin model for auth/rate-limit | Express (slower), Envoy (complex for app-layer logic) |
| **NestJS** | Structured DI for app services; TypeScript; OpenAPI generation | Pure Fastify (less structure at scale), Hapi |
| **FastAPI (Python)** | AI/data services: native async; pydantic; ecosystem (HuggingFace, LangChain) | Flask (sync-only), Django (too heavy) |
| **Go (hot paths)** | Ingest worker, tile server: zero-GC pauses, native concurrency, small binary | Rust (higher dev cost), Node.js (GC pauses under load) |

---

## Streaming & orchestration

| Technology | Why chosen | Alternatives rejected |
| --- | --- | --- |
| **Apache Kafka (AWS MSK)** | Durable, replayable event backbone; decouples ingest from enrichment; exactly-once semantics | RabbitMQ (not replayable), Kinesis (less ecosystem), Pulsar |
| **Redpanda** | Dev/test local: Kafka-compatible, single binary, fast startup | Docker Compose Kafka (slower to spin up) |
| **Schema Registry** | Enforces Avro/Protobuf schema evolution; prevents breaking-change surprises | No schema enforcement (fragile) |
| **Debezium** | CDC from Postgres → Kafka; outbox pattern for event sourcing | Polling-based CDC (lag + load on DB) |
| **Temporal** | Reliable workflow orchestration; durable execution; retry/timeout built-in | Airflow (batch-oriented), Celery (no durability), custom queues |
| **Dagster** | Data pipeline orchestration: asset-based, testable, lineage tracking | Airflow (less ergonomic), Prefect |

---

## Data stores

| Technology | Why chosen | Alternatives rejected |
| --- | --- | --- |
| **PostgreSQL 16 + PostGIS + TimescaleDB** | Spatial queries (PostGIS); time-series partitioning (TimescaleDB); RLS for multi-tenancy; proven | MongoDB (no spatial/ACID), MySQL (weaker spatial), CockroachDB (operational complexity) |
| **Elasticsearch / OpenSearch** | Full-text search with multilingual analyzers; Ukrainian/Russian stemming; field boosting | Typesense (less mature multilingual), Meilisearch (no CJK/Cyrillic depth), Postgres FTS (scaling) |
| **Qdrant** | Vector search: Rust-native, fast, payload filtering, self-hostable on AWS | Pinecone (vendor lock-in, no self-host), pgvector (Postgres contention), Weaviate |
| **Redis** | Cache + pub/sub for real-time alert delivery; session state | Memcached (no pub/sub), DynamoDB (too heavy for cache) |
| **S3 + Parquet** | Cold archive: cheap, durable, columnar for replay and analytics | S3 + JSON (large, slow to query), GCS (vendor diversification cost) |
| **DuckDB / Trino** | Ad-hoc analytics over Parquet: DuckDB in-process for notebooks, Trino for large joins | Athena (cost at scale), Spark (operational overhead) |

---

## AI / Models

| Technology | Role | Why chosen |
| --- | --- | --- |
| **Anthropic Claude** (primary LLM) | Briefing generation, copilot, summarization | Grounding + citation adherence; safety-first design; audit trail |
| **OpenAI GPT-4o** (secondary) | Fallback / specific tasks | Capability complement; provider redundancy |
| **vLLM (self-hosted)** | Open-weights inference (NLLB, classification models) | Cost at volume; data-residency control for sensitive content |
| **Whisper** | Audio transcription (press briefings, Telegram voice) | Best open-source ASR; multilingual |
| **YOLOv8 / RT-DETR** | Object detection in images/video (vehicles, infrastructure, weapon systems) | State-of-art real-time detection; fine-tuneable |
| **PaddleOCR** | Text extraction from images (signs, documents, maps in Cyrillic/Latin) | Best Cyrillic OCR; open-source |
| **NLLB** | Low-resource language translation (UA ↔ EN, RU ↔ EN, minority languages) | Meta open-weights; covers Ukrainian + conflict-area language pairs |
| **Langfuse** | LLM observability: trace, evaluate, cost | Open-source; self-hostable; Anthropic SDK integration |

---

## Infrastructure

| Technology | Why chosen | Alternatives rejected |
| --- | --- | --- |
| **AWS (eu-central-1 primary, us-east-1 secondary)** | Mature; EU data residency (GDPR); broad service coverage; compliance certifications | GCP (smaller compliance footprint for EU gov), Azure (weaker ML ecosystem) |
| **Cloudflare** | CDN + DDoS mitigation + WAF + DNS + Workers (edge logic); critical for conflict-platform uptime | Fastly (less DDoS depth), AWS CloudFront (weaker WAF) |
| **Vercel** | Next.js hosting: ISR/RSC native; zero-config; edge network | Self-hosted Next.js on EKS (operational overhead outweighs cost savings at this stage) |
| **EKS (Kubernetes)** | Container orchestration; Helm for services; Karpenter for node autoscaling | ECS (less portable), GKE (vendor diversification cost) |
| **Terraform** | Infrastructure as code; all AWS + Cloudflare resources version-controlled | Pulumi (less ecosystem), CDK (AWS-only lock-in) |
| **Argo CD** | GitOps CD: declarative, auditable, automated rollbacks | Flux (less UI), Jenkins (not GitOps) |
| **Helm** | Kubernetes package manager | Kustomize (no templating), raw manifests (no parameterization) |
| **Cilium** | eBPF-based CNI: network policy, observability, mTLS | Calico (less observability), Istio (too heavy) |

---

## Observability

| Technology | Role |
| --- | --- |
| **OpenTelemetry** | Vendor-neutral tracing/metrics/logs instrumentation |
| **Tempo / Honeycomb** | Distributed tracing (Tempo self-hosted; Honeycomb for developer UX on complex queries) |
| **Loki / OpenSearch** | Log aggregation (Loki for k8s logs; OpenSearch for long-retention structured logs) |
| **Prometheus + Grafana** | Metrics + dashboards; alert rules → PagerDuty |
| **Langfuse** | LLM trace, eval, cost (AI-specific observability) |

---

## Developer tooling & quality

| Technology | Role |
| --- | --- |
| **pnpm + Turbo** | Fast monorepo package management and build caching |
| **Biome / oxlint** | Fast linting + formatting (replaces ESLint + Prettier for TS/JS) |
| **Vitest** | Unit + integration tests; fast, native ESM |
| **Playwright** | E2E tests; browser automation for critical flows |
| **Storybook** | Component development in isolation |
| **axe-core** | Automated accessibility testing integrated into CI |
| **gitleaks** | Secrets scanning in git history + pre-commit |
| **Snyk + Semgrep** | Dependency vulnerability scanning (Snyk) + SAST (Semgrep) |

---

## i18n

| Technology | Role |
| --- | --- |
| **next-intl** | Next.js 15 App Router i18n; locale routing; typed messages |
| **NLLB (self-hosted)** | Machine translation for content pipeline (not UI strings) |
| **DeepL** | High-quality translation for editorial/marketing content |
| **CLDR** | Unicode locale data for number/date/plural formatting |

---

## ADR cross-references

> _Link each entry above to its ADR as ADRs are written. Format: [ADR-NNNN](../adr/NNNN-title.md)._

| Decision | ADR |
| --- | --- |
| Use Kafka as event backbone | [ADR-0001](../adr/0001-record-architecture-decisions.md) _(ADR TBD — see TODO)_ |
| PostgreSQL + PostGIS as primary data store | _(ADR TBD)_ |
| Anthropic Claude as primary LLM | _(ADR TBD)_ |
| AWS eu-central-1 primary for EU data residency | _(ADR TBD)_ |
| MapLibre as open-source Mapbox fallback | _(ADR TBD)_ |
