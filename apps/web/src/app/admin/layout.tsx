import type { Metadata } from "next";

/**
 * Admin layout — root-level (NOT under [locale]), single-locale (EN only).
 *
 * Always `noindex`. Internal back-office surface.
 */
export const metadata: Metadata = {
  title: "Admin · Aegis Lens",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base">
      <header className="border-b border-border-subtle bg-bg-elevated">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4">
          <div className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
            Admin · back-office
          </div>
          <a href="/" className="text-xs text-text-muted hover:text-text-primary">
            ← Back to site
          </a>
        </div>
      </header>
      <main className="w-full">{children}</main>
    </div>
  );
}
