/**
 * GET  /api/cases/:id/notes — list notes in a case
 * POST /api/cases/:id/notes — add a note
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { caseStore, caseNoteStore, type CaseNote } from "@/lib/cases-store";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`cases:notes:list:${ip}`, 120, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  if (!caseStore.has(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const notes = (caseNoteStore.get(id) ?? []).filter((n) => !n.deletedAt);
  notes.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return NextResponse.json(
    { data: notes, meta: { count: notes.length } },
    { headers: { "Cache-Control": "no-store", ...rateLimitHeaders(rl) } },
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`cases:notes:create:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const kase = caseStore.get(id);
  if (!kase) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (kase.status === "locked") {
    return NextResponse.json({ error: "case_locked" }, { status: 409 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const input = body as Partial<CaseNote>;

  if (!input.content || typeof input.content !== "string" || input.content.trim().length === 0) {
    return NextResponse.json({ error: "validation", message: "content is required" }, { status: 422 });
  }

  const now = new Date().toISOString();
  const note: CaseNote = {
    noteId: `note_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
    caseId: id,
    authorId: "anonymous",
    content: input.content.trim().slice(0, 50_000),
    replyToEventId: typeof input.replyToEventId === "string" ? input.replyToEventId : undefined,
    replyToNoteId: typeof input.replyToNoteId === "string" ? input.replyToNoteId : undefined,
    createdAt: now,
    updatedAt: now,
  };

  const existing = caseNoteStore.get(id) ?? [];
  caseNoteStore.set(id, [...existing, note]);

  // Update case updatedAt
  caseStore.set(id, { ...kase, updatedAt: now });

  return NextResponse.json({ data: note }, { status: 201 });
}
