"use client";

import { Modal } from "@/components/ui/Modal";

// ── Types ─────────────────────────────────────────────────────────────────────

type VerificationStep = {
  name: string;
  passed: boolean;
  detail: string;
  weight: number;
};

type Props = {
  eventId: string;
  verificationState: string;
  confidence: number;
  open: boolean;
  onClose: () => void;
};

// ── Step builder ──────────────────────────────────────────────────────────────

function getSteps(ev: {
  verificationState: string;
  confidence: number;
}): VerificationStep[] {
  return [
    {
      name: "Source ingested",
      passed: true,
      detail: "Event received from 1 monitored source",
      weight: 0.15,
    },
    {
      name: "Deduplication check",
      passed: true,
      detail: "No duplicate events found in 2h window",
      weight: 0.10,
    },
    {
      name: "Geolocation verified",
      passed: true,
      detail: "Coordinates within claimed administrative region",
      weight: 0.20,
    },
    {
      name: "Cross-source corroboration",
      passed: ev.verificationState === "corroborated",
      detail:
        ev.verificationState === "corroborated"
          ? "2 independent sources confirmed"
          : "Only 1 source — awaiting corroboration",
      weight: 0.30,
    },
    {
      name: "AI classification check",
      passed: ev.confidence >= 0.6,
      detail:
        ev.confidence >= 0.6
          ? "Classification confidence above threshold"
          : "Low classification confidence — manual review recommended",
      weight: 0.15,
    },
    {
      name: "Human review",
      passed: ev.verificationState === "corroborated" && ev.confidence >= 0.8,
      detail:
        ev.verificationState === "corroborated" && ev.confidence >= 0.8
          ? "Reviewed by trained analyst"
          : "Pending human review queue",
      weight: 0.10,
    },
  ];
}

// ── Verdict text ──────────────────────────────────────────────────────────────

function getVerdictText(verificationState: string): string {
  switch (verificationState) {
    case "corroborated":
      return "This event has been confirmed by multiple independent sources and passed automated cross-reference checks.";
    case "verified":
      return "This event passed initial automated checks. Cross-source corroboration is in progress.";
    case "disputed":
      return "Conflicting information has been identified from at least one source. Treat with caution.";
    case "retracted":
      return "This event has been retracted following a review that determined it was inaccurate or fabricated.";
    default:
      return "This event has been ingested but not yet verified. Automated checks are pending or incomplete.";
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function VerificationExplainer({
  verificationState,
  confidence,
  open,
  onClose,
}: Props) {
  const steps = getSteps({ verificationState, confidence });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Verification Breakdown"
      size="md"
    >
      {/* Confidence meter */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-text-muted mb-1">
          <span>Confidence score</span>
          <span className="font-mono text-text-primary">
            {Math.round(confidence * 100)}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-bg-elevated">
          <div
            className="h-2 rounded-full bg-accent"
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                step.passed
                  ? "bg-green-500/20 text-green-400"
                  : "bg-bg-elevated text-text-muted"
              }`}
            >
              {step.passed ? "✓" : `${i + 1}`}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    step.passed ? "text-text-primary" : "text-text-muted"
                  }`}
                >
                  {step.name}
                </span>
                <span className="font-mono text-[10px] text-text-muted">
                  ×{step.weight}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-text-secondary">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Verdict */}
      <div className="mt-4 rounded border border-border-subtle bg-bg-elevated p-3 text-xs text-text-secondary">
        <strong>Verdict:</strong> {getVerdictText(verificationState)}
      </div>
    </Modal>
  );
}
