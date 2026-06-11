export type {
  OutageSignalSource,
  OutageCause,
  OutageStatus,
  OutageSignal,
  OutageEvent,
  OutageLayer,
} from "./types";

export { fuseSignals } from "./fusion";
export { getScheduledBlackoutSignals } from "./schedule-adapter";

export {
  OBLENERGO_REGISTRY,
  normaliseUtilityRecords,
  getUtilitySignals,
} from "./utility-adapter";
export type { UtilityFeedRecord } from "./utility-adapter";

export {
  DEFAULT_NIGHTLIGHTS_CONFIG,
  buildBaseline,
  detectAnomaly,
  detectNightlightOutages,
} from "./viirs-nightlights";
export type {
  RadianceSample,
  RadianceBaseline,
  NightlightsConfig,
  NightlightsAnomaly,
} from "./viirs-nightlights";

export {
  FORECAST_DISCLAIMER,
  forecastFromSchedule,
  forecastFromRecurrence,
} from "./forecast";
export type { OutageForecast, ScheduledForecastWindow } from "./forecast";
