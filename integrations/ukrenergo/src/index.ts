// @ua-map/ukrenergo — Ukrenergo + 24 oblenergo + Yasno/DTEK power-grid status.
// Feeds the existing integrations/power-outages fusion layer (no new map layer).

export * from "./types";

// Sources
export { UkrenergoClient, getUkrenergoDemoStatus } from "./ukrenergo-client";
export type { UkrenergoClientConfig, UkrenergoStatus } from "./ukrenergo-client";

export {
  OBLENERGO_PROVIDERS,
  getProvider,
  listRegionCodes,
  regionsByConsumerPortal,
} from "./oblenergo-registry";
export type { OblenergoProvider } from "./oblenergo-registry";

export { DtekYasnoClient, getYasnoDemoSchedules } from "./dtek-yasno-client";
export type { DtekYasnoClientConfig, YasnoGroupSchedule } from "./dtek-yasno-client";

// Pipeline
export {
  getAdapter,
  parseRecord,
  parseRecords,
} from "./provider-adapters";
export type { ProviderAdapter } from "./provider-adapters";

export {
  parseHHMM,
  minutesToHHMM,
  offWindowsToBlocks,
  parseYasnoGroups,
  parseHourGrid,
  parseProseSchedule,
  blockAt,
} from "./schedule-parser";

export { classifyOutage } from "./classify-outage";
export type { OutageClassification } from "./classify-outage";

export {
  estimateRestoration,
  DEFAULT_EMERGENCY_MEDIAN_HOURS,
} from "./eta";
export type { EtaOptions } from "./eta";

// Schema mapping → power-outages
export {
  scheduleToSignal,
  schedulesToSignals,
  groupIsOff,
  minutesUntilOn,
} from "./to-power-outages";

export {
  correlateRegion,
  correlateAll,
} from "./viirs-correlation";
export type {
  NightlightsVerdict,
  CorrelationVerdict,
  ViirsCorrelation,
  ReportedOutage,
} from "./viirs-correlation";

export {
  trafficDropToExtent,
  correlateRadar,
  correlateRadarAll,
} from "./radar-correlation";
export type { RadarSample, RadarCorrelation, RadarCorrelationOptions } from "./radar-correlation";

// Display
export { buildScheduleWidget, pick } from "./schedule-widget";
export type { ScheduleWidget, WidgetGroup, WidgetBlock } from "./schedule-widget";

export { buildMyArea, pickMyArea } from "./my-area";
export type { MyAreaView, PowerState } from "./my-area";

export {
  computeRegionStats,
  computeStatsByRegion,
  formatHours,
  getDemoHistory,
} from "./stats";
export type { OutageRecord, RegionOutageStats } from "./stats";
