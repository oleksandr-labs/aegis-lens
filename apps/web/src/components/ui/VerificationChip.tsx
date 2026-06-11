type VerificationState = "corroborated" | "unverified" | "disputed" | "retracted";

type ChipConfig = {
  label: string;
  icon: string;
  color: "green" | "yellow" | "red" | "muted";
};

const CONFIG: Record<VerificationState, ChipConfig> = {
  corroborated: { label: "Corroborated", icon: "✓", color: "green" },
  unverified:   { label: "Unverified",   icon: "?", color: "muted" },
  disputed:     { label: "Disputed",     icon: "⚠", color: "yellow" },
  retracted:    { label: "Retracted",    icon: "✕", color: "red" },
};

export function VerificationChip({ state }: { state: string }) {
  const config: ChipConfig = CONFIG[state as VerificationState] ?? {
    label: state,
    icon: "?",
    color: "muted",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px]
        ${
          config.color === "green"
            ? "border-green-500/20 bg-green-500/10 text-green-400"
            : config.color === "yellow"
              ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
              : config.color === "red"
                ? "border-red-500/20 bg-red-500/10 text-red-400"
                : "border-border-subtle bg-bg-elevated text-text-muted"
        }`}
    >
      <span aria-hidden="true">{config.icon}</span> {config.label}
    </span>
  );
}
