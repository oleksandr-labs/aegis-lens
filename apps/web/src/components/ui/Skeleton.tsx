// Base skeleton block — uses skeleton-shimmer from globals.css.

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`rounded skeleton-shimmer ${className ?? ""}`} />
  );
}

// ── Preset skeletons ─────────────────────────────────────────────────────────

/** N lines of varying widths simulating a block of text. */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  // Widths cycle through a pattern so rows look natural.
  const widths = ["w-full", "w-5/6", "w-4/5", "w-3/4", "w-2/3", "w-1/2"];
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${widths[i % widths.length]}`}
        />
      ))}
    </div>
  );
}

/** Card: header + 3 text lines + footer button placeholder. */
export function SkeletonCard() {
  return (
    <div className="rounded border border-border-subtle bg-bg-surface p-5 flex flex-col gap-4">
      {/* Header */}
      <Skeleton className="h-5 w-2/5" />
      {/* Body text */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-4/6" />
      </div>
      {/* Footer button */}
      <Skeleton className="h-8 w-28 mt-1" />
    </div>
  );
}

/** Event row: status dot + summary text + meta tag. */
export function SkeletonEventRow() {
  return (
    <div className="flex items-center gap-3 py-2">
      {/* Status dot */}
      <Skeleton className="h-2 w-2 shrink-0 rounded-full" />
      {/* Summary */}
      <Skeleton className="h-3.5 flex-1" />
      {/* Meta */}
      <Skeleton className="h-3.5 w-20 shrink-0" />
    </div>
  );
}

/** KPI block: big number + small label. */
export function SkeletonKPI() {
  return (
    <div className="flex flex-col items-start gap-2">
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}
