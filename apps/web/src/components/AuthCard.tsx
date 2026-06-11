import Link from "next/link";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="font-mono text-sm font-semibold tracking-tight text-accent"
          >
            AEGIS LENS
          </Link>
          <h1 className="mt-3 text-xl font-semibold text-text-primary">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          )}
        </div>
        <div className="rounded border border-border-subtle bg-bg-surface p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
