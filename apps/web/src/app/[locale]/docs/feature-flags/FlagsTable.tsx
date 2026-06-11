"use client";

import { DataTable, type Column } from "@/components/ui/DataTable";
import { FLAG_DEFINITIONS, type Flag } from "@/lib/feature-flags";

const AUDIENCE_COLOR: Record<Flag["audience"], string> = {
  all: "text-emerald-400 border-emerald-400/40",
  beta: "text-[#4ea1ff] border-[#4ea1ff]/40",
  enterprise: "text-amber-400 border-amber-400/40",
  "team+": "text-purple-400 border-purple-400/40",
  "analyst+": "text-rose-400 border-rose-400/40",
};

type FlagRow = Flag & { id: string };

const COLUMNS: Column<FlagRow>[] = [
  {
    key: "id",
    header: "Flag ID",
    width: "220px",
    sortable: true,
    render: (val) => (
      <code className="rounded bg-bg-base px-1.5 py-0.5 font-mono text-xs text-text-primary">
        {val as string}
      </code>
    ),
  },
  {
    key: "label",
    header: "Label",
    sortable: true,
  },
  {
    key: "description",
    header: "Description",
  },
  {
    key: "defaultEnabled",
    header: "Default",
    width: "90px",
    sortable: true,
    render: (val) =>
      val ? (
        <span className="rounded border border-emerald-400/40 px-1.5 py-0.5 font-mono text-[10px] uppercase text-emerald-400">
          on
        </span>
      ) : (
        <span className="rounded border border-border-subtle px-1.5 py-0.5 font-mono text-[10px] uppercase text-text-muted">
          off
        </span>
      ),
  },
  {
    key: "audience",
    header: "Audience",
    width: "110px",
    sortable: true,
    render: (val) => {
      const audience = val as Flag["audience"];
      return (
        <span
          className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${AUDIENCE_COLOR[audience]}`}
        >
          {audience}
        </span>
      );
    },
  },
];

export function FlagsTable() {
  const data: FlagRow[] = FLAG_DEFINITIONS as FlagRow[];
  return (
    <DataTable
      columns={COLUMNS}
      data={data}
      pageSize={20}
      stickyHeader
    />
  );
}
