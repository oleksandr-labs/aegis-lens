import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/account", label: "Account" },
  { href: "/account/api-keys", label: "API Keys" },
  { href: "/account/usage", label: "Usage" },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="md:w-48 md:shrink-0">
          <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Account
          </div>
          <nav className="mt-2 flex flex-row gap-1 overflow-x-auto md:flex-col md:gap-0.5">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-surface hover:text-text-primary"
              >
                {n.label}
              </Link>
            ))}
            <form action="/api/account/logout" method="post" className="mt-2">
              <button
                type="submit"
                className="w-full rounded px-3 py-1.5 text-left text-sm text-text-muted hover:bg-bg-surface hover:text-text-primary"
              >
                Sign out
              </button>
            </form>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
