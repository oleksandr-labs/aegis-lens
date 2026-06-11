"use client";

import { useState, useMemo } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type SortDir = "asc" | "desc" | null;

export type Column<T> = {
  key: keyof T;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

export type DataTableProps<T extends { id: string }> = {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  stickyHeader?: boolean;
};

// ── Sort icon ─────────────────────────────────────────────────────────────────

function SortIcon({ dir }: { dir: SortDir }) {
  return (
    <span className="ml-1 text-text-muted select-none" aria-hidden="true">
      {dir === "asc" ? "↑" : dir === "desc" ? "↓" : "⇅"}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DataTable<T extends { id: string }>({
  columns,
  data,
  pageSize = 20,
  onRowClick,
  emptyState,
  stickyHeader = false,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(0);

  // ── Sort ──────────────────────────────────────────────────────────────────

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      const cmp = av < bv ? -1 : 1;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  // ── Pagination ────────────────────────────────────────────────────────────

  const totalPages = Math.ceil(sorted.length / pageSize);
  const pageStart = page * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, sorted.length);
  const pageRows = sorted.slice(pageStart, pageEnd);

  function handleSort(col: Column<T>) {
    if (!col.sortable) return;
    if (sortKey !== col.key) {
      setSortKey(col.key);
      setSortDir("asc");
      setPage(0);
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else if (sortDir === "desc") {
      setSortKey(null);
      setSortDir(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const theadClass = [
    "border-b border-border-subtle bg-bg-elevated",
    stickyHeader ? "sticky top-0 z-10" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="overflow-hidden rounded border border-border-subtle">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={theadClass}>
            <tr>
              {columns.map((col) => {
                const isActive = sortKey === col.key;
                return (
                  <th
                    key={col.key as string}
                    style={col.width ? { width: col.width } : undefined}
                    className={[
                      "px-4 py-3 text-left font-medium text-text-muted text-xs uppercase tracking-wider",
                      col.sortable
                        ? "cursor-pointer select-none hover:text-text-primary transition-colors"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleSort(col)}
                    aria-sort={
                      isActive && sortDir === "asc"
                        ? "ascending"
                        : isActive && sortDir === "desc"
                          ? "descending"
                          : undefined
                    }
                  >
                    {col.header}
                    {col.sortable && (
                      <SortIcon dir={isActive ? sortDir : null} />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-border-subtle">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  {emptyState ?? (
                    <div className="flex items-center justify-center py-12 text-sm text-text-muted">
                      No data
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={[
                    "hover:bg-bg-elevated transition-colors",
                    onRowClick ? "cursor-pointer" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {columns.map((col) => (
                    <td key={col.key as string} className="px-4 py-3 text-text-primary">
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sorted.length > pageSize && (
        <div className="flex items-center justify-between border-t border-border-subtle bg-bg-surface px-4 py-2.5">
          <span className="text-xs text-text-muted">
            Showing {pageStart + 1}–{pageEnd} of {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-border-subtle px-3 py-1 text-xs text-text-secondary hover:bg-bg-elevated disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-border-subtle px-3 py-1 text-xs text-text-secondary hover:bg-bg-elevated disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
