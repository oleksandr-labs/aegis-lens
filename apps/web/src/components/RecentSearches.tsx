"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const RECENT_KEY = "aegis_recent_searches";

export function RecentSearches() {
  const [terms, setTerms] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
      setTerms(stored);
    } catch {
      setTerms([]);
    }
  }, []);

  function handleClear() {
    localStorage.removeItem(RECENT_KEY);
    setTerms([]);
  }

  if (terms.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Your recent searches
        </h3>
        <button
          onClick={handleClear}
          className="text-[10px] text-text-muted hover:text-text-secondary"
        >
          Clear history
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {terms.map((term) => (
          <Link
            key={term}
            href={`/search?q=${encodeURIComponent(term)}`}
            className="rounded-full border border-border-default bg-bg-surface px-3 py-1 text-xs text-text-secondary hover:border-accent hover:text-text-primary"
          >
            {term}
          </Link>
        ))}
      </div>
    </div>
  );
}
