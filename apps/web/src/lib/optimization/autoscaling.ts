/**
 * Compute autoscaling configuration for Aegis Lens microservices.
 *
 * Each service has independent scaling parameters tuned to its workload:
 *   - web:         bursty read traffic, scale fast
 *   - ingest-svc:  queue-depth driven, scale on backlog
 *   - vision-svc:  GPU-bound, slow scale-down to amortise start cost
 *   - nlp-svc:     CPU-bound, moderate scaling
 *   - tiles-svc:   Cache-hit dominant, conservative scaling
 *   - search-svc:  Memory-intensive, scale on memory pressure
 *
 * generateHpaManifest() produces a Kubernetes HorizontalPodAutoscaler YAML
 * string that can be applied directly: `kubectl apply -f -`.
 */

export interface ServiceScalingConfig {
  service: string;
  minReplicas: number;
  maxReplicas: number;
  /** CPU utilisation target (0–100). */
  cpuTargetPercent: number;
  /** Memory usage target in MiB. */
  memoryTargetMb: number;
  /** Optional: name of a custom metric (e.g., Kafka consumer lag). */
  customMetric?: string;
  /** Seconds to wait before scaling down (avoids flapping). */
  scaleDownDelaySeconds: number;
}

export const SERVICE_SCALING_CONFIGS: ServiceScalingConfig[] = [
  {
    service: "web",
    minReplicas: 2,
    maxReplicas: 20,
    cpuTargetPercent: 70,
    memoryTargetMb: 512,
    scaleDownDelaySeconds: 120,
  },
  {
    service: "ingest-svc",
    minReplicas: 2,
    maxReplicas: 12,
    cpuTargetPercent: 75,
    memoryTargetMb: 1024,
    customMetric: "kafka_consumer_lag_ingest_raw",
    scaleDownDelaySeconds: 180,
  },
  {
    service: "vision-svc",
    minReplicas: 1,
    maxReplicas: 8,
    cpuTargetPercent: 80,
    memoryTargetMb: 4096,
    customMetric: "kafka_consumer_lag_ai_inference_requests",
    scaleDownDelaySeconds: 600, // GPU pods are expensive to restart
  },
  {
    service: "nlp-svc",
    minReplicas: 1,
    maxReplicas: 8,
    cpuTargetPercent: 75,
    memoryTargetMb: 2048,
    customMetric: "kafka_consumer_lag_ai_inference_requests",
    scaleDownDelaySeconds: 300,
  },
  {
    service: "tiles-svc",
    minReplicas: 2,
    maxReplicas: 10,
    cpuTargetPercent: 65,
    memoryTargetMb: 768,
    scaleDownDelaySeconds: 240,
  },
  {
    service: "search-svc",
    minReplicas: 2,
    maxReplicas: 12,
    cpuTargetPercent: 70,
    memoryTargetMb: 2048,
    scaleDownDelaySeconds: 180,
  },
];

export interface ScalingDecision {
  service: string;
  action: "scale_up" | "scale_down" | "no_change";
  targetReplicas: number;
  reason: string;
}

/**
 * Compute a scaling decision for a service given current metrics.
 *
 * Logic:
 *  1. If CPU or memory exceeds target → scale up by 25% (min +1 replica)
 *  2. If both are below 50% of target → scale down by 1 replica
 *  3. Otherwise → no change
 *
 * Respects minReplicas and maxReplicas bounds.
 *
 * @param config  - Service scaling configuration
 * @param metrics - Current resource utilisation
 */
export function computeScalingDecision(
  config: ServiceScalingConfig,
  metrics: {
    cpuPercent: number;
    memoryMb: number;
    currentReplicas: number;
    queueDepth?: number;
  }
): ScalingDecision {
  const { cpuPercent, memoryMb, currentReplicas, queueDepth } = metrics;

  const cpuHigh = cpuPercent > config.cpuTargetPercent;
  const memHigh = memoryMb > config.memoryTargetMb;
  const queueHigh =
    queueDepth !== undefined && config.customMetric !== undefined && queueDepth > 1000;

  if (cpuHigh || memHigh || queueHigh) {
    const bump = Math.max(1, Math.ceil(currentReplicas * 0.25));
    const target = Math.min(config.maxReplicas, currentReplicas + bump);
    const reasons: string[] = [];
    if (cpuHigh) reasons.push(`CPU ${cpuPercent}% > target ${config.cpuTargetPercent}%`);
    if (memHigh) reasons.push(`memory ${memoryMb} MB > target ${config.memoryTargetMb} MB`);
    if (queueHigh) reasons.push(`queue depth ${queueDepth}`);

    return {
      service: config.service,
      action: target > currentReplicas ? "scale_up" : "no_change",
      targetReplicas: target,
      reason: reasons.join("; "),
    };
  }

  const cpuLow = cpuPercent < config.cpuTargetPercent * 0.5;
  const memLow = memoryMb < config.memoryTargetMb * 0.5;

  if (cpuLow && memLow) {
    const target = Math.max(config.minReplicas, currentReplicas - 1);
    return {
      service: config.service,
      action: target < currentReplicas ? "scale_down" : "no_change",
      targetReplicas: target,
      reason: `CPU ${cpuPercent}% and memory ${memoryMb} MB both below 50% of targets`,
    };
  }

  return {
    service: config.service,
    action: "no_change",
    targetReplicas: currentReplicas,
    reason: "Metrics within acceptable range",
  };
}

/**
 * Generate a Kubernetes HorizontalPodAutoscaler YAML manifest for a service.
 *
 * Includes CPU, memory, and optional custom metric targets.
 * The generated YAML is for Kubernetes ≥ 1.23 (autoscaling/v2 API).
 */
export function generateHpaManifest(config: ServiceScalingConfig): string {
  const metricsBlock: string[] = [
    `  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: ${config.cpuTargetPercent}`,
    `  - type: Resource
    resource:
      name: memory
      target:
        type: AverageValue
        averageValue: ${config.memoryTargetMb}Mi`,
  ];

  if (config.customMetric) {
    metricsBlock.push(
      `  - type: External
    external:
      metric:
        name: ${config.customMetric}
      target:
        type: AverageValue
        averageValue: "500"`
    );
  }

  const stabilizationBlock = `  behavior:
  scaleDown:
    stabilizationWindowSeconds: ${config.scaleDownDelaySeconds}
    policies:
    - type: Pods
      value: 1
      periodSeconds: 60
  scaleUp:
    stabilizationWindowSeconds: 30
    policies:
    - type: Percent
      value: 25
      periodSeconds: 60`;

  return `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${config.service}-hpa
  namespace: aegis-lens
  labels:
    app: ${config.service}
    managed-by: autoscaling-config
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${config.service}
  minReplicas: ${config.minReplicas}
  maxReplicas: ${config.maxReplicas}
  metrics:
${metricsBlock.join("\n")}
${stabilizationBlock}
`;
}
