type SourcePillProps = {
  name: string;
  url?: string;
  archiveUrl?: string;
  tier?: 1 | 2 | 3;
};

const TIER_COLOR: Record<1 | 2 | 3, string> = {
  1: "text-green-400",
  2: "text-yellow-400",
  3: "text-text-muted",
};

export function SourcePill({ name, url, archiveUrl, tier }: SourcePillProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-border-subtle bg-bg-elevated px-2 py-0.5 text-[11px]">
      {tier && (
        <span
          className={`font-mono text-[9px] ${TIER_COLOR[tier]}`}
          title={`Source tier ${tier}`}
        >
          T{tier}
        </span>
      )}

      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-secondary hover:text-accent hover:underline"
        >
          {name}
        </a>
      ) : (
        <span className="text-text-secondary">{name}</span>
      )}

      {archiveUrl && (
        <a
          href={archiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-muted hover:text-accent"
          title="Archive snapshot"
          aria-label={`Archive snapshot of ${name}`}
        >
          📎
        </a>
      )}
    </span>
  );
}
