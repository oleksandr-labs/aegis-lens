import { NextResponse } from "next/server";
import { getCurrentUser, randomHex } from "@/lib/account";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return NextResponse.json(
    { ok: true, keys: user.apiKeys },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  // Accept either JSON or form-encoded (Next 15 form action posts).
  let label = "untitled";
  let methodOverride: string | null = null;
  let bodyId: string | null = null;

  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const j = (await req.json().catch(() => ({}))) as {
      label?: string;
      id?: string;
      _method?: string;
    };
    label = (j.label ?? "untitled").toString().slice(0, 64);
    methodOverride = j._method ?? null;
    bodyId = j.id ?? null;
  } else {
    const f = await req.formData().catch(() => null);
    if (f) {
      label = ((f.get("label") as string) ?? "untitled").toString().slice(0, 64);
      methodOverride = (f.get("_method") as string) ?? null;
      bodyId = (f.get("id") as string) ?? null;
    }
  }

  // Allow form-action posts to act as DELETE via `_method=DELETE`.
  if (methodOverride?.toUpperCase() === "DELETE") {
    return handleDelete(bodyId);
  }

  const key = `ak_live_${randomHex(16)}`;
  const newKey = {
    id: `key_${randomHex(8)}`,
    label,
    prefix: key.slice(0, 16),
    createdAt: new Date().toISOString(),
  };

  // Stub: not persisted. On a form post, redirect back so the user sees the list.
  if (!ct.includes("application/json")) {
    return NextResponse.redirect(new URL("/account/api-keys", req.url), { status: 303 });
  }

  return NextResponse.json(
    { ok: true, key, record: newKey },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const j = (await req.json().catch(() => ({}))) as { id?: string };
  return handleDelete(j.id ?? null, req);
}

function handleDelete(id: string | null, req?: Request) {
  if (!id) {
    return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });
  }
  // Stub: not persisted. Redirect on form posts.
  if (req && !(req.headers.get("content-type") ?? "").includes("application/json")) {
    return NextResponse.redirect(new URL("/account/api-keys", req.url), { status: 303 });
  }
  return NextResponse.json(
    { ok: true, id },
    { headers: { "Cache-Control": "no-store" } },
  );
}
