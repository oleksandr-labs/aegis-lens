"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { urls } from "@aegis/url-builder";
import type { GlossaryTerm } from "@/lib/glossary-data";
import { groupByLetter } from "@/lib/glossary-data";

const CATEGORY_LABELS: Record<GlossaryTerm["category"] | "all", string> = {
  all: "All",
  technical: "Technical",
  military: "Military",
  geopolitical: "Geopolitical",
  osint: "OSINT",
  legal: "Legal",
};

const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function GlossarySearch({
  terms,
  locale,
}: {
  terms: GlossaryTerm[];
  locale: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GlossaryTerm["category"] | "all">("all");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = terms;
    if (category !== "all") {
      result = result.filter((t) => t.category === category);
    }
    if (activeLetter) {
      result = result.filter((t) => t.term[0].toUpperCase() === activeLetter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q) ||
          t.abbreviation?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [terms, query, category, activeLetter]);

  const grouped = useMemo(() => groupByLetter(filtered), [filtered]);
  const letters = [...grouped.keys()].sort();

  // Letters that have at least one term in the full set for this category
  const availableLetters = useMemo(() => {
    let base = terms;
    if (category !== "all") base = base.filter((t) => t.category === category);
    const s = new Set(base.map((t) => t.term[0].toUpperCase()));
    return s;
  }, [terms, category]);

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setActiveLetter(null);
  }

  const hasActiveFilter = query || category !== "all" || activeLetter;

  return (
    <div className="space-y-6">
      {/* Search + term count */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search terms…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveLetter(null);
          }}
          className="w-full rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none sm:max-w-xs"
        />
        <p className="font-mono text-xs text-text-muted">
          {filtered.length} {filtered.length === 1 ? "term" : "terms"}
        </p>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_LABELS) as (GlossaryTerm["category"] | "all")[]).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setActiveLetter(null);
            }}
            className={`rounded border px-3 py-1 font-mono text-xs transition-colors ${
              category === cat
                ? "border-accent bg-accent text-bg-base"
                : "border-border-subtle text-text-secondary hover:border-accent hover:text-accent"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            className="ml-2 font-mono text-xs text-text-muted underline-offset-2 hover:text-accent hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Alphabet tabs */}
      <div className="flex flex-wrap gap-1">
        {ALL_LETTERS.map((letter) => {
          const available = availableLetters.has(letter);
          const active = activeLetter === letter;
          return (
            <button
              key={letter}
              disabled={!available}
              onClick={() => setActiveLetter(active ? null : letter)}
              className={`h-7 w-7 rounded font-mono text-xs transition-colors ${
                !available
                  ? "cursor-not-allowed text-text-muted opacity-30"
                  : active
                    ? "bg-accent text-bg-base"
                    : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded border border-border-subtle bg-bg-surface p-8 text-center">
          <p className="text-sm text-text-muted">No terms match your filters.</p>
          <button
            onClick={clearFilters}
            className="mt-3 font-mono text-xs text-accent underline-offset-2 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {letters.map((letter) => {
            const bucket = grouped.get(letter) ?? [];
            return (
              <div key={letter}>
                <div className="sticky top-0 z-10 -mx-1 mb-3 flex items-center gap-3 bg-bg-base px-1 py-1">
                  <span className="font-mono text-2xl font-bold text-accent">{letter}</span>
                  <span className="h-px flex-1 bg-border-subtle" />
                </div>
                <ul className="divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
                  {bucket.map((term) => (
                    <li key={term.slug}>
                      <Link
                        href={urls.glossary(locale, term.slug)}
                        className="block px-4 py-3 hover:bg-bg-elevated"
                      >
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-semibold text-text-primary">{term.term}</span>
                          {term.abbreviation && term.abbreviation !== term.term && (
                            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                              {term.abbreviation}
                            </span>
                          )}
                          <span className="ml-auto rounded border border-border-subtle px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                            {term.category}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                          {term.definition}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
