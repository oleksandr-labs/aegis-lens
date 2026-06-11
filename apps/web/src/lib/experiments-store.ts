import "server-only";
import { ExperimentRegistry } from "@ua-map/experiments";

export const experimentRegistry = new ExperimentRegistry();

// Seed a demo experiment
experimentRegistry.create({
  name: "Copilot prompt length",
  description: "Test whether shorter copilot response summaries (≤120 chars) improve engagement vs full paragraphs.",
  type: "ab",
  variants: [
    { key: "control",  name: "Full paragraph",  weight: 50, isControl: true },
    { key: "short",    name: "≤120 char summary", weight: 50, payload: { maxLength: 120 } },
  ],
  eligibility: { tiers: ["pro", "enterprise"] },
  hypothesis: {
    metric: "copilot_followup_rate",
    direction: "increase",
    minimumDetectableEffect: 0.05,
    guardrails: ["session_duration", "error_rate"],
  },
});
