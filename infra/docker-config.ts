/**
 * Docker Multi-Arch Config — image build configuration per service.
 *
 * All images are built for linux/amd64 (AWS Graviton-ready: linux/arm64).
 * Images are published to ECR; tag strategy is {service}:{sha}-{arch}.
 *
 * Конфігурація Docker-образів для мультиархітектурних збірок (amd64 + arm64).
 */

// ── Platform targets ──────────────────────────────────────────────────────────

/**
 * Build platforms for all service images.
 * arm64 enables Graviton instance families (cost savings ~20%).
 *
 * Цільові платформи для збірки. arm64 — підтримка Graviton (економія ~20%).
 */
export const DOCKER_PLATFORMS = ["linux/amd64", "linux/arm64"] as const;
export type DockerPlatform = (typeof DOCKER_PLATFORMS)[number];

// ── Services ──────────────────────────────────────────────────────────────────

/**
 * All containerised services in the monorepo.
 *
 * Всі контейнеризовані сервіси монорепо.
 */
export const DOCKER_SERVICES = [
  "web",
  "ingest",
  "normalize",
  "enrich",
  "verify",
  "alerts",
  "aoi",
  "travel-risk",
] as const;
export type DockerService = (typeof DOCKER_SERVICES)[number];

// ── DockerImageConfig ─────────────────────────────────────────────────────────

export interface DockerImageConfig {
  service: DockerService;
  /** Dockerfile path relative to monorepo root */
  dockerfilePath: string;
  /** Build context relative to monorepo root */
  buildContext: string;
  platforms: readonly DockerPlatform[];
  /** ECR repository name */
  ecrRepo: string;
  /** Target stage in multi-stage Dockerfile */
  targetStage: "development" | "production" | "test";
  /** Base image for production stage */
  baseImage: string;
  /** Exposed port (container-internal) */
  port: number;
}

// ── DOCKER_IMAGE_CONFIGS ──────────────────────────────────────────────────────

export const DOCKER_IMAGE_CONFIGS: Record<DockerService, DockerImageConfig> = {
  web: {
    service: "web",
    dockerfilePath: "apps/web/Dockerfile",
    buildContext: ".",
    platforms: DOCKER_PLATFORMS,
    ecrRepo: "aegis-lens/web",
    targetStage: "production",
    baseImage: "node:20-alpine",
    port: 3000,
  },
  ingest: {
    service: "ingest",
    dockerfilePath: "services/ingest/Dockerfile",
    buildContext: "services/ingest",
    platforms: DOCKER_PLATFORMS,
    ecrRepo: "aegis-lens/ingest",
    targetStage: "production",
    baseImage: "python:3.12-slim",
    port: 8000,
  },
  normalize: {
    service: "normalize",
    dockerfilePath: "services/normalize/Dockerfile",
    buildContext: "services/normalize",
    platforms: DOCKER_PLATFORMS,
    ecrRepo: "aegis-lens/normalize",
    targetStage: "production",
    baseImage: "python:3.12-slim",
    port: 8001,
  },
  enrich: {
    service: "enrich",
    dockerfilePath: "services/enrich/Dockerfile",
    buildContext: "services/enrich",
    platforms: DOCKER_PLATFORMS,
    ecrRepo: "aegis-lens/enrich",
    targetStage: "production",
    baseImage: "python:3.12-slim",
    port: 8002,
  },
  verify: {
    service: "verify",
    dockerfilePath: "services/verify/Dockerfile",
    buildContext: "services/verify",
    platforms: DOCKER_PLATFORMS,
    ecrRepo: "aegis-lens/verify",
    targetStage: "production",
    baseImage: "python:3.12-slim",
    port: 8003,
  },
  alerts: {
    service: "alerts",
    dockerfilePath: "services/alerts/Dockerfile",
    buildContext: "services/alerts",
    platforms: DOCKER_PLATFORMS,
    ecrRepo: "aegis-lens/alerts",
    targetStage: "production",
    baseImage: "node:20-alpine",
    port: 8004,
  },
  aoi: {
    service: "aoi",
    dockerfilePath: "services/aoi/Dockerfile",
    buildContext: "services/aoi",
    platforms: DOCKER_PLATFORMS,
    ecrRepo: "aegis-lens/aoi",
    targetStage: "production",
    baseImage: "python:3.12-slim",
    port: 8005,
  },
  "travel-risk": {
    service: "travel-risk",
    dockerfilePath: "services/travel-risk/Dockerfile",
    buildContext: "services/travel-risk",
    platforms: DOCKER_PLATFORMS,
    ecrRepo: "aegis-lens/travel-risk",
    targetStage: "production",
    baseImage: "python:3.12-slim",
    port: 8006,
  },
};
