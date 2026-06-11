import "server-only";
import { randomUUID } from "crypto";
import type { Notebook, NotebookCell, NotebookComment, NotebookStatus } from "@ua-map/notebooks";

const store = new Map<string, Notebook>();

// Demo notebook seed
const now = new Date().toISOString();

const demoNotebook: Notebook = {
  id: "nb-001",
  title: "Kharkiv Oblast — Weekly Situation Analysis",
  description: "Automated weekly situation report for Kharkiv oblast combining event data, power outage signals, and AI summary.",
  tags: ["kharkiv", "weekly", "situation-report", "analyst"],
  authorId: "user-system",
  orgId: "org-public",
  status: "published",
  isPublic: true,
  slug: "kharkiv-weekly-analysis",
  cells: [
    {
      id: "cell-1",
      type: "markdown",
      order: 1,
      content: "# Kharkiv Oblast — Weekly Situation\n\nThis notebook provides a reproducible weekly situation analysis for Kharkiv oblast. It combines verified event data, power outage signals, and AI-generated summaries.",
      updatedAt: now,
    },
    {
      id: "cell-2",
      type: "query",
      order: 2,
      query: "kharkiv events last 7 days",
      filters: { regions: ["UA-63"], hours: 168, minConfidence: 0.6 },
      limit: 100,
      updatedAt: now,
    },
    {
      id: "cell-3",
      type: "map",
      order: 3,
      querySourceId: "cell-2",
      center: [36.23, 49.99],
      zoom: 9,
      activeLayers: ["military_action", "power_outages", "civilian_alerts"],
      updatedAt: now,
    },
    {
      id: "cell-4",
      type: "chart",
      order: 4,
      querySourceId: "cell-2",
      chartType: "bar",
      xField: "date",
      yField: "count",
      colorField: "class",
      title: "Events by day and class",
      updatedAt: now,
    },
    {
      id: "cell-5",
      type: "ai",
      order: 5,
      prompt: "Summarize the key security developments in Kharkiv oblast over the last 7 days. Highlight any changes in patterns and provide an outlook.",
      contextQueryIds: ["cell-2"],
      updatedAt: now,
    },
  ],
  versions: [
    {
      version: 1,
      cells: [],
      savedAt: now,
      savedBy: "user-system",
      message: "Initial version",
    },
  ],
  comments: [],
  createdAt: now,
  updatedAt: now,
};

store.set(demoNotebook.id, demoNotebook);

export type NotebookCreate = Pick<Notebook, "title" | "description" | "tags" | "authorId" | "orgId" | "isPublic">;
export type NotebookUpdate = Partial<Pick<Notebook, "title" | "description" | "tags" | "status" | "isPublic" | "slug" | "scheduledRunAt">>;

export function listNotebooks(opts?: { orgId?: string; authorId?: string; isPublic?: boolean; tag?: string; status?: NotebookStatus }): Notebook[] {
  let items = Array.from(store.values());
  if (opts?.orgId) items = items.filter((n) => n.orgId === opts.orgId || n.isPublic);
  if (opts?.authorId) items = items.filter((n) => n.authorId === opts.authorId);
  if (opts?.isPublic != null) items = items.filter((n) => n.isPublic === opts.isPublic);
  if (opts?.tag) items = items.filter((n) => n.tags.includes(opts.tag!));
  if (opts?.status) items = items.filter((n) => n.status === opts.status);
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getNotebook(id: string): Notebook | undefined {
  return store.get(id);
}

export function getNotebookBySlug(slug: string): Notebook | undefined {
  return Array.from(store.values()).find((n) => n.slug === slug);
}

export function createNotebook(data: NotebookCreate): Notebook {
  const id = randomUUID();
  const ts = new Date().toISOString();
  const nb: Notebook = {
    id,
    title: data.title,
    description: data.description,
    tags: data.tags ?? [],
    authorId: data.authorId,
    orgId: data.orgId,
    status: "draft",
    cells: [],
    versions: [],
    comments: [],
    isPublic: data.isPublic ?? false,
    createdAt: ts,
    updatedAt: ts,
  };
  store.set(id, nb);
  return nb;
}

export function updateNotebook(id: string, data: NotebookUpdate): Notebook | null {
  const existing = store.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
  store.set(id, updated);
  return updated;
}

export function deleteNotebook(id: string): boolean {
  return store.delete(id);
}

export function upsertCell(notebookId: string, cell: NotebookCell): Notebook | null {
  const nb = store.get(notebookId);
  if (!nb) return null;
  const cells = nb.cells.filter((c) => c.id !== cell.id);
  cells.push({ ...cell, updatedAt: new Date().toISOString() });
  cells.sort((a, b) => a.order - b.order);
  const updated = { ...nb, cells, updatedAt: new Date().toISOString() };
  store.set(notebookId, updated);
  return updated;
}

export function deleteCell(notebookId: string, cellId: string): Notebook | null {
  const nb = store.get(notebookId);
  if (!nb) return null;
  const updated = { ...nb, cells: nb.cells.filter((c) => c.id !== cellId), updatedAt: new Date().toISOString() };
  store.set(notebookId, updated);
  return updated;
}

export function addComment(notebookId: string, data: Omit<NotebookComment, "id" | "createdAt">): NotebookComment | null {
  const nb = store.get(notebookId);
  if (!nb) return null;
  const comment: NotebookComment = { id: randomUUID(), ...data, createdAt: new Date().toISOString() };
  const updated = { ...nb, comments: [...nb.comments, comment], updatedAt: new Date().toISOString() };
  store.set(notebookId, updated);
  return comment;
}

export function saveVersion(notebookId: string, message: string, authorId: string): Notebook | null {
  const nb = store.get(notebookId);
  if (!nb) return null;
  const version = {
    version: (nb.versions[nb.versions.length - 1]?.version ?? 0) + 1,
    cells: nb.cells,
    savedAt: new Date().toISOString(),
    savedBy: authorId,
    message,
  };
  const updated = { ...nb, versions: [...nb.versions, version], updatedAt: new Date().toISOString() };
  store.set(notebookId, updated);
  return updated;
}
