"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ENTITIES_DATA,
  ENTITY_TYPE_LABEL,
  COUNTRY_NAME,
  type EntityType,
} from "@/lib/entities-data";

const ALL_ENTITY_TYPES = [
  ...new Set(ENTITIES_DATA.map((e) => e.type)),
].sort() as EntityType[];

export function EntityRegistryClient() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<EntityType | "">("");

  const filteredEntities = useMemo(() => {
    return ENTITIES_DATA.filter((e) => {
      if (filterType && e.type !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.aliases.some((a) => a.toLowerCase().includes(q)) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [search, filterType]);

  return (
    <div className="mb-12">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Entity Registry</h2>
        <span className="font-mono text-xs text-text-muted">
          {filteredEntities.length} / {ENTITIES_DATA.length} entities
        </span>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={(ev) => setSearch(ev.target.value)}
          placeholder="Search entities, aliases, tags…"
          className="w-full rounded border border-border-subtle bg-bg-surface px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          aria-label="Search entities"
        />
      </div>

      {/* Type filter chips */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
          Type:
        </span>
        <button
          type="button"
          onClick={() => setFilterType("")}
          className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
            !filterType
              ? "border-accent bg-accent/10 text-accent"
              : "border-border-subtle text-text-muted hover:border-text-muted"
          }`}
        >
          All
        </button>
        {ALL_ENTITY_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilterType(filterType === type ? "" : type)}
            className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              filterType === type
                ? "border-accent bg-accent/10 text-accent"
                : "border-border-subtle text-text-muted hover:border-text-muted"
            }`}
          >
            {ENTITY_TYPE_LABEL[type]}
          </button>
        ))}
      </div>

      {/* Entity cards */}
      {filteredEntities.length === 0 ? (
        <p className="rounded border border-border-subtle bg-bg-surface p-6 text-sm text-text-muted">
          No entities match the selected filters.
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {filteredEntities.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/en/entities/${e.slug}`}
                className="flex h-full flex-col rounded border border-border-subtle bg-bg-surface px-4 py-3 hover:bg-bg-elevated transition-colors"
              >
                {/* Name + country */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-text-primary">
                    {e.name}
                  </span>
                  <span className="shrink-0 rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                    {COUNTRY_NAME[e.country] ?? e.country.toUpperCase()}
                  </span>
                </div>

                {/* Type badge */}
                <div className="mt-1 font-mono text-[10px] uppercase text-text-muted">
                  {ENTITY_TYPE_LABEL[e.type]}
                </div>

                {/* Description */}
                <p className="mt-2 text-xs text-text-secondary line-clamp-2">
                  {e.description}
                </p>

                {/* Event count + aliases */}
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] text-text-muted">
                  <span>{e.eventCount.toLocaleString()} events</span>
                  {e.aliases.length > 0 && (
                    <span className="truncate max-w-[220px]">
                      aka: {e.aliases.slice(0, 2).join(", ")}
                      {e.aliases.length > 2 && " …"}
                    </span>
                  )}
                  {!e.active && (
                    <span className="text-red-400">Inactive</span>
                  )}
                </div>

                {/* Tags */}
                {e.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {e.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-[8px] text-text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
