export function RadarLoader({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      {/* Base circle */}
      <div className="absolute inset-0 rounded-full border border-accent/20" />
      {/* Concentric rings */}
      <div className="absolute inset-2 rounded-full border border-accent/10" />
      <div className="absolute inset-4 rounded-full border border-accent/10" />
      {/* Rotating sweep */}
      <div
        className="absolute inset-0 rounded-full radar-sweep"
        style={{
          background: `conic-gradient(from 0deg, transparent 270deg, rgba(78,161,255,0.3) 360deg)`,
        }}
      />
      {/* Center dot */}
      <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
    </div>
  );
}
