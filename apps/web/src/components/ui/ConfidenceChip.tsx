export function ConfidenceChip({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color = pct >= 80 ? "green" : pct >= 50 ? "yellow" : "red";
  const label = pct >= 80 ? "HIGH" : pct >= 50 ? "MED" : "LOW";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px]
        ${
          color === "green"
            ? "border-green-500/20 bg-green-500/10 text-green-400"
            : color === "yellow"
              ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
              : "border-red-500/20 bg-red-500/10 text-red-400"
        }`}
      title={`Confidence: ${pct}%`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: "currentColor" }}
        aria-hidden="true"
      />
      {label} {pct}%
    </span>
  );
}
