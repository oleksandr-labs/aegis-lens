export type {
  ExperimentStatus,
  ExperimentType,
  ExperimentVariant,
  Eligibility,
  Hypothesis,
  Experiment,
  AssignmentContext,
  AssignmentResult,
} from "./types";

export { assign, assignAll } from "./assignment";
export { ExperimentRegistry } from "./registry";
export type { ExperimentCreate, ExperimentUpdate } from "./registry";

export {
  testProportions,
  testMeans,
  runSequentialTest,
  calculateSampleSize,
  evaluateGuardrails,
  runMultivariateTests,
} from "./statistics";
export type {
  MetricType,
  VariantObservation,
  StatTestResult,
  GuardrailResult,
  GuardrailCheck,
  SampleSizeParams,
  SampleSizeResult,
} from "./statistics";
