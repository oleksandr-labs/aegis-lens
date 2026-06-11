export type {
  NetBlocksIncidentStatus,
  NetBlocksIncidentType,
  NetBlocksIncident,
  NetBlocksApiResponse,
} from "./types";

export { NetBlocksClient } from "./client";
export { NetBlocksAdapter } from "./adapter";
export type { NormalisedOutageEvent } from "./adapter";

export { RipeAtlasClient } from "./ripe-atlas";
export type { AtlasProbeSnapshot, RipeAtlasConfig } from "./ripe-atlas";

export {
  OPERATOR_NAMES,
  getOperatorStatus,
  operatorStatusToIncidents,
} from "./operator-status";
export type {
  OperatorSlug,
  OperatorServiceState,
  OperatorStatusRecord,
} from "./operator-status";

export {
  DEFAULT_BGP_CONFIG,
  DEMO_BGP_OBSERVATIONS,
  classifyBgpAnomaly,
  bgpAnomaliesToIncidents,
} from "./bgp-anomaly";
export type {
  BgpAnomalyKind,
  BgpObservation,
  BgpAnomalyResult,
  BgpAnomalyConfig,
} from "./bgp-anomaly";

export {
  getSubmarineCableStatus,
  cableStatusToIncidents,
} from "./submarine-cables";
export type { CableStatus, CableStatusRecord } from "./submarine-cables";

export { computeSeverityIndex } from "./severity-index";
export type { RegionSeverity, RegionResolver } from "./severity-index";

export {
  DEFAULT_CORRELATION_CONFIG,
  correlateCommsWithPower,
} from "./power-correlation";
export type {
  PowerOutageRef,
  CommsPowerCorrelation,
  CorrelationConfig,
} from "./power-correlation";
