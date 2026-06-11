export function SeverityBar({
  severity,
  max = 5,
}: {
  severity: number;
  max?: number;
}) {
  return (
    <div
      className="flex items-center gap-1"
      role="meter"
      aria-label={`Severity ${severity} of ${max}`}
      aria-valuenow={severity}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 w-4 rounded-sm ${i < severity ? "bg-accent" : "bg-border-subtle"}`}
          aria-hidden="true"
        />
      ))}
      <span className="ml-1 font-mono text-[10px] text-text-muted">
        {severity}/{max}
      </span>
    </div>
  );
}
