// Source provenance chain component.
// Renders a vertical "reshared by" chain showing how an event propagated
// across platforms.

// ── Types ─────────────────────────────────────────────────────────────────────

export type SourceChainItem = {
  source: string;
  platform: "telegram" | "twitter" | "youtube" | "news" | "official" | "satellite";
  firstSeen: string; // ISO string
  archiveUrl?: string;
  shares?: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const PLATFORM_ICON: Record<SourceChainItem["platform"], string> = {
  telegram:  "📡",
  twitter:   "🐦",
  youtube:   "📺",
  news:      "📰",
  official:  "🏛",
  satellite: "🛰",
};

const PLATFORM_LABEL: Record<SourceChainItem["platform"], string> = {
  telegram:  "Telegram",
  twitter:   "Twitter/X",
  youtube:   "YouTube",
  news:      "News article",
  official:  "Official statement",
  satellite: "Satellite imagery",
};

function timeAgoShort(isoStr: string): string {
  const diffMs = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem === 0 ? `${hrs}h ago` : `${hrs}h ${rem}m ago`;
}

// ── Sample chain (hardcoded for seed events) ──────────────────────────────────

export const SAMPLE_CHAIN: SourceChainItem[] = [
  {
    source: "@UkraineNow",
    platform: "telegram",
    firstSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    archiveUrl: "https://archive.org",
    shares: 1240,
  },
  {
    source: "@KyivIndependent",
    platform: "twitter",
    firstSeen: new Date(Date.now() - 1.75 * 60 * 60 * 1000).toISOString(),
    archiveUrl: "https://archive.org",
    shares: 880,
  },
  {
    source: "kyivindependent.com",
    platform: "news",
    firstSeen: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    archiveUrl: "https://archive.org",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function SourceChain({ items = SAMPLE_CHAIN }: { items?: SourceChainItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-xs text-text-muted">No source chain data available.</p>
    );
  }

  return (
    <ol className="space-y-0">
      {items.map((item, i) => (
        <li key={i}>
          {/* Chain node */}
          <div className="flex items-start gap-3">
            {/* Connector column */}
            <div className="flex flex-col items-center">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated text-sm">
                {PLATFORM_ICON[item.platform]}
              </div>
              {i < items.length - 1 && (
                <div className="my-1 w-px flex-1 bg-border-subtle" style={{ minHeight: "28px" }} />
              )}
            </div>

            {/* Content */}
            <div className="pb-4 min-w-0 flex-1">
              {/* Source identifier */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-text-primary">
                  {PLATFORM_LABEL[item.platform]}
                </span>
                <span className="font-mono text-[11px] text-accent">
                  {item.source}
                </span>
                <span className="font-mono text-[10px] text-text-muted">
                  first seen {timeAgoShort(item.firstSeen)}
                </span>
              </div>

              {/* Meta row */}
              <div className="mt-1 flex flex-wrap items-center gap-3">
                {item.archiveUrl && (
                  <a
                    href={item.archiveUrl}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="font-mono text-[10px] text-accent hover:underline"
                  >
                    [archive.org]
                  </a>
                )}
                {item.shares !== undefined && (
                  <span className="font-mono text-[10px] text-text-muted">
                    {item.shares.toLocaleString()} shares
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Connector label between nodes */}
          {i < items.length - 1 && (
            <div className="ml-3.5 -mt-3 mb-1 pl-[1.125rem] font-mono text-[10px] text-text-muted">
              ↓ reshared by
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
