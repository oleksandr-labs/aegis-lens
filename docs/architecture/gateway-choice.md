# Architecture Decision Record — API Gateway Choice

**Status:** Accepted  
**Date:** 2026-06-10  
**Deciders:** Platform team  

---

## Context

Aegis Lens needs a single ingress point that handles auth, rate limiting, routing,
billing metering, and request tracing. Four options were evaluated.

---

## Options Evaluated

### 1. Envoy Proxy
- **Strengths:** Battle-tested at hyperscale; native gRPC + HTTP/2; xDS dynamic
  config; excellent Kubernetes integration (Istio, Envoy Gateway); rich
  observability (stats, tracing, access logs) via built-in filters.
- **Weaknesses:** Steep config complexity (YAML/xDS); C++ core = harder to hack;
  heavyweight for a monolith-stage product; no plugin marketplace.
- **Verdict:** Best fit for Stage 2 (microservices on K8s). Premature now.

### 2. Kong Gateway
- **Strengths:** Large plugin ecosystem (400+); declarative config (deck);
  GUI (Kong Manager); hybrid cloud mode; mature rate-limiting + auth plugins.
- **Weaknesses:** Lua plugin layer adds latency; OSS vs. Enterprise feature split;
  Postgres dependency for clustering; overkill for current traffic volumes.
- **Verdict:** Good if an off-the-shelf plugin marketplace is valued; otherwise
  the operational overhead isn't justified at this stage.

### 3. Tyk Gateway
- **Strengths:** Written in Go (low memory, fast); built-in GraphQL support;
  API management dashboard; open source with self-hosted option.
- **Weaknesses:** Smaller ecosystem than Kong; Redis hard dependency;
  less community support than Envoy/Kong; less Next.js-native.
- **Verdict:** Viable alternative to Kong; no decisive advantage over Fastify
  at the monolith stage.

### 4. Custom Fastify Gateway (selected for Stage 1)
- **Strengths:** Zero new infra dependency — runs inside the existing Next.js
  monorepo process model; full TypeScript type safety end-to-end; direct access
  to in-process auth/rate-limit/metering modules; fastest iteration speed;
  existing `apps/web/src/lib/` modules (jwt.ts, rate-limit.ts, telemetry.ts)
  already implement the core contracts.
- **Weaknesses:** Not as battle-tested as Envoy for high-throughput gRPC;
  must re-implement some features that Kong/Envoy give for free; single point of
  scaling (tied to the Next.js server process).
- **Verdict:** Correct choice for Stage 1. The custom gateway IS the Next.js
  API middleware stack — adding Envoy in front of it would add a redundant hop
  with no benefit until the services are truly split.

---

## Decision

**Stage 1 (now — monolith):** Custom Fastify-style gateway implemented as
Next.js middleware + `apps/web/src/lib/` modules.

**Stage 2 (microservices):** Migrate to Envoy Gateway (Kubernetes-native xDS
control plane). The typed TS interfaces defined in Stage 1 become the contract
that Envoy's ext-authz / rate-limit services implement.

---

## Migration Path (Stage 1 → 2)

1. Extract `jwt.ts`, `rate-limit.ts`, `ip-allowlist.ts`, `bot-defense.ts` into
   standalone gRPC ext-authz service.
2. Deploy Envoy Gateway in front of the Next.js server.
3. Move rate-limit state from Redis (direct) to Envoy's rate-limit service.
4. Retire the in-process middleware once Envoy handles all edge concerns.

---

## Consequences

- Immediate velocity: new gateway features ship as TypeScript modules, no YAML.
- Tech debt accepted: must migrate to Envoy when services split (expected
  Stage 2, target Q3 2026).
- Monitoring: Envoy's Prometheus metrics not available in Stage 1; rely on
  OpenTelemetry (`telemetry.ts`) + custom `/api/admin/metrics` endpoint.
