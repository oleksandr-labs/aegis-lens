/**
 * Webcam privacy client — registry management + ingestion coordination.
 *
 * Wraps privacyGate + frameSampler into a unified ingestion interface.
 * All cameras must pass the privacy gate before any frame is sampled.
 */

import type { WebcamConfig, FrameSamplingConfig } from "./types";
import { DEFAULT_FRAME_SAMPLING_CONFIG } from "./types";
import { checkWebcamEligibility, filterEligibleCameras, privacyGateSummary } from "./privacyGate";
import { sampleFrame, sampleFrames } from "./frameSampler";

export { checkWebcamEligibility, filterEligibleCameras, privacyGateSummary };
export { sampleFrame, sampleFrames };

export class WebcamIngestionClient {
  constructor(
    private readonly cameras: WebcamConfig[],
    private readonly samplingConfig: FrameSamplingConfig = DEFAULT_FRAME_SAMPLING_CONFIG,
  ) {}

  getEligibleCameras(): WebcamConfig[] {
    return filterEligibleCameras(this.cameras).map(({ cam }) => cam);
  }

  getSummary() {
    return privacyGateSummary(this.cameras);
  }

  async *ingest() {
    const eligible = this.getEligibleCameras();
    yield* sampleFrames(eligible, this.samplingConfig);
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    const summary = this.getSummary();
    return {
      healthy: summary.eligible > 0,
      message: `${summary.eligible}/${summary.total} cameras eligible; ${summary.blocked} blocked`,
    };
  }
}
