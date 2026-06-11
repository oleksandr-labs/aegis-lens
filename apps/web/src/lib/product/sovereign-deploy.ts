/**
 * Sovereign Deploy — on-premises and private-cloud deployment options.
 *
 * Phase 3 feature for government and classified-network customers who
 * cannot use the shared SaaS infrastructure.
 *
 * Суверенне розгортання: air-gapped, private-cloud, hybrid для держ. клієнтів.
 */

'use server';

// ── Modes ─────────────────────────────────────────────────────────────────────

export const SOVEREIGN_MODES = ['air-gapped', 'private-cloud', 'hybrid'] as const;
export type SovereignMode = typeof SOVEREIGN_MODES[number];

// ── Config ────────────────────────────────────────────────────────────────────

export interface SovereignDeployConfig {
  mode: SovereignMode;
  /** Container registry — Реєстр контейнерів */
  containerRegistry: string;
  /** Kubernetes namespace — Namespace Kubernetes */
  k8sNamespace: string;
  /** Whether telemetry is allowed to leave the perimeter — Чи дозволена телеметрія */
  telemetryEnabled: boolean;
  /** Whether AI models are served on-prem — Чи AI моделі локальні */
  localAiModels: boolean;
  /** Update policy — Політика оновлень */
  updatePolicy: 'manual' | 'air-gap-bundle' | 'auto';
  /** Data residency country codes — Коди країн зберігання даних */
  dataResidencyCountries: string[];
  /** Minimum hardware spec — Мін. вимоги до заліза */
  minHardware: {
    cpuCores: number;
    ramGb: number;
    storageGb: number;
    gpuOptional: boolean;
  };
  /** Required tier — Необхідний tier */
  requiredTier: string;
}

// ── Builder ───────────────────────────────────────────────────────────────────

/**
 * Build a sovereign deployment spec with sensible defaults for the given mode.
 *
 * Будує специфікацію суверенного розгортання з дефолтами для заданого режиму.
 */
export function buildSovereignSpec(mode: SovereignMode): SovereignDeployConfig {
  const defaults: SovereignDeployConfig = {
    mode,
    containerRegistry: 'registry.aegislens.com/sovereign',
    k8sNamespace: 'aegis-sovereign',
    telemetryEnabled: false,
    localAiModels: mode === 'air-gapped',
    updatePolicy: mode === 'air-gapped' ? 'air-gap-bundle' : 'manual',
    dataResidencyCountries: ['UA'],
    minHardware: {
      cpuCores: 32,
      ramGb: 128,
      storageGb: 2_000,
      gpuOptional: true,
    },
    requiredTier: 'enterprise',
  };

  if (mode === 'hybrid') {
    defaults.telemetryEnabled = true;
    defaults.updatePolicy = 'auto';
  }

  return defaults;
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export const SOVEREIGN_NOTE_EN =
  'Sovereign deployments ship as a signed OCI artifact bundle. ' +
  'Air-gapped installs receive quarterly security bundles via physical media.';

export const SOVEREIGN_NOTE_UK =
  'Суверенні розгортання постачаються як підписаний OCI artifact bundle. ' +
  'Air-gapped інсталяції отримують квартальні пакети безпеки на фізичних носіях.';
