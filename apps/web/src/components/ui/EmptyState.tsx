import Link from "next/link";

type EmptyStateProps = {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
};

export function EmptyState({ icon = "◌", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded border border-border-subtle bg-bg-surface p-12 text-center">
      <span className="mb-4 text-4xl leading-none text-text-muted" aria-hidden="true">
        {icon}
      </span>
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="mt-2 max-w-xs text-sm text-text-secondary">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center rounded border border-border-default px-4 py-2 text-sm text-text-primary hover:bg-bg-elevated"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex items-center rounded border border-border-default px-4 py-2 text-sm text-text-primary hover:bg-bg-elevated"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Preset empty states ──────────────────────────────────────────────────────

export const NoEventsEmpty = () => (
  <EmptyState
    icon="◌"
    title="No events match your filters"
    description="Try adjusting the time window or clearing filters."
    action={{ label: "Clear filters", href: "/map" }}
  />
);

export const NoAlertsEmpty = () => (
  <EmptyState
    icon="🔔"
    title="No alert rules"
    description="Create your first alert to get notified of events that matter."
    action={{ label: "Create alert", href: "/alerts" }}
  />
);

export const NoCasesEmpty = () => (
  <EmptyState
    icon="📁"
    title="No case files"
    description="Start a case file to organize your OSINT investigation."
  />
);

export const OfflineEmpty = () => (
  <EmptyState
    icon="⚡"
    title="You're offline"
    description="Check your connection. Last data shown is cached."
  />
);

export const ErrorEmpty = ({ message }: { message?: string }) => (
  <EmptyState
    icon="⚠"
    title="Something went wrong"
    description={message ?? "Please try again or contact support."}
    action={{ label: "Try again", onClick: () => window.location.reload() }}
  />
);
