// Compact verification badge for use in event lists and cards.

type BadgeConfig = {
  dot: string;
  label: string;
  confidence_color: string;
};

const STATE_CONFIG: Record<string, BadgeConfig> = {
  corroborated: {
    dot: "bg-green-500",
    label: "Verified",
    confidence_color: "text-green-400",
  },
  unverified: {
    dot: "bg-gray-400",
    label: "Unverified",
    confidence_color: "text-text-muted",
  },
  disputed: {
    dot: "bg-yellow-500",
    label: "Disputed",
    confidence_color: "text-yellow-400",
  },
  retracted: {
    dot: "bg-red-500",
    label: "Retracted",
    confidence_color: "text-red-400",
  },
};

export function EventVerificationBadge({
  state,
  confidence,
}: {
  state: string;
  confidence: number;
}) {
  const config = STATE_CONFIG[state] ?? {
    dot: "bg-gray-400",
    label: state,
    confidence_color: "text-text-muted",
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span className="text-[10px] text-text-secondary">{config.label}</span>
      <span className={`font-mono text-[10px] ${config.confidence_color}`}>
        {Math.round(confidence * 100)}%
      </span>
    </span>
  );
}
