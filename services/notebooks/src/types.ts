export type CellType =
  | "markdown"  // rich prose, MDX
  | "query"     // filter DSL → live event results
  | "map"       // embedded map viewport
  | "chart"     // data-binding from a query cell
  | "ai"        // copilot scoped to notebook context
  | "code";     // sandboxed JS (WASM runtime, no network)

export interface BaseCell {
  id: string;
  type: CellType;
  order: number;
  /** ISO 8601 */
  updatedAt: string;
  /** Collapsed in the UI */
  collapsed?: boolean;
}

export interface MarkdownCell extends BaseCell {
  type: "markdown";
  content: string; // MDX-compatible markdown
}

export interface QueryCell extends BaseCell {
  type: "query";
  /** Filter DSL query string */
  query: string;
  filters: Record<string, unknown>;
  /** Max rows to return */
  limit: number;
  /** Last computed result snapshot (for reproducibility) */
  resultSnapshot?: unknown[];
  snapshotAt?: string;
}

export interface MapCell extends BaseCell {
  type: "map";
  /** Binds to a query cell's result */
  querySourceId?: string;
  center: [number, number]; // [lon, lat]
  zoom: number;
  activeLayers: string[];
  /** ISO 8601 window for the map */
  timeWindow?: { from: string; to: string };
}

export type ChartType = "bar" | "line" | "scatter" | "pie" | "heatmap";

export interface ChartCell extends BaseCell {
  type: "chart";
  querySourceId: string;
  chartType: ChartType;
  xField: string;
  yField: string;
  colorField?: string;
  title?: string;
}

export interface AiCell extends BaseCell {
  type: "ai";
  prompt: string;
  /** IDs of query cells to pass as context */
  contextQueryIds: string[];
  /** Last computed response */
  response?: string;
  responseAt?: string;
}

export interface CodeCell extends BaseCell {
  type: "code";
  language: "javascript" | "python";
  code: string;
  /** Last run output */
  output?: string;
  outputAt?: string;
}

export type NotebookCell =
  | MarkdownCell
  | QueryCell
  | MapCell
  | ChartCell
  | AiCell
  | CodeCell;

export type NotebookStatus = "draft" | "published" | "archived";

export interface NotebookVersion {
  version: number;
  cells: NotebookCell[];
  savedAt: string;
  savedBy: string;
  message?: string;
}

export interface NotebookComment {
  id: string;
  cellId?: string; // null = notebook-level comment
  authorId: string;
  content: string;
  mentionedUserIds: string[];
  createdAt: string;
  resolvedAt?: string;
}

export interface Notebook {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  authorId: string;
  orgId: string;
  status: NotebookStatus;
  cells: NotebookCell[];
  versions: NotebookVersion[];
  comments: NotebookComment[];
  /** If true, included in the public gallery */
  isPublic: boolean;
  /** SEO slug for public gallery */
  slug?: string;
  /** ISO 8601 */
  scheduledRunAt?: string;
  createdAt: string;
  updatedAt: string;
}
