/**
 * RFC 8058 one-click unsubscribe endpoint.
 *
 * GET  /api/email/unsubscribe?token=... — human-visible confirmation page
 * POST /api/email/unsubscribe           — machine one-click (Gmail / Yahoo MUA)
 *
 * RFC 8058 requires BOTH endpoints:
 *   - GET: shown to the user when they click the unsubscribe link
 *   - POST: called directly by the mail client for one-click unsubscribe
 *     (body: application/x-www-form-urlencoded with List-Unsubscribe=One-Click)
 *
 * Gmail enforces the POST path from 2024 onwards for bulk senders.
 *
 * RFC 8058: GET — сторінка підтвердження, POST — автоматична відписка
 * одним кліком (Gmail / Yahoo).
 */

import { NextResponse } from "next/server";
import {
  verifyUnsubscribeToken,
  UNSUBSCRIBE_LISTS,
} from "@/lib/email/unsubscribe";
import { suppressionList } from "@/lib/email/suppression-list";

export const dynamic = "force-dynamic";

// ── POST — machine one-click (RFC 8058 §3) ───────────────────────────────────

/**
 * Called by Gmail / Yahoo mail client directly (no user interaction).
 *
 * Accepts:
 *   Content-Type: application/x-www-form-urlencoded
 *   Body: List-Unsubscribe=One-Click&token=<token>
 *
 * Also accepts JSON body for API callers:
 *   { "token": "<token>" }
 */
export async function POST(req: Request): Promise<Response> {
  let token: string | null = null;

  const contentType = req.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      token = params.get("token");
    } else {
      const body = await req.json().catch(() => ({}));
      token = typeof body?.token === "string" ? body.token : null;
    }
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json(
      { error: "missing_token", message: "token is required" },
      { status: 400 },
    );
  }

  const parsed = verifyUnsubscribeToken(token);
  if (!parsed) {
    return NextResponse.json(
      { error: "invalid_token", message: "Token is invalid or expired." },
      { status: 400 },
    );
  }

  // Add to suppression list
  suppressionList.add({
    email: parsed.email,
    reason: "unsubscribe",
    suppressedAt: new Date().toISOString(),
    source: `rfc8058_post:${parsed.list}`,
  });

  return NextResponse.json(
    {
      success: true,
      email: parsed.email,
      list: parsed.list,
      message: `Successfully unsubscribed ${parsed.email} from ${parsed.list}.`,
    },
    { status: 200 },
  );
}

// ── GET — human-visible confirmation page ─────────────────────────────────────

/**
 * Shown when the user clicks the unsubscribe link in an email client
 * that doesn't support RFC 8058 one-click (or when they click manually).
 *
 * Returns an HTML confirmation page.
 * On ?confirmed=1, processes the unsubscribe and shows a success message.
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const confirmed = url.searchParams.get("confirmed") === "1";

  if (!token) {
    return new Response(renderPage("Error", errorHtml("Missing token.")), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const parsed = verifyUnsubscribeToken(token);
  if (!parsed) {
    return new Response(
      renderPage("Unsubscribe Error", errorHtml("This unsubscribe link is invalid or has expired.")),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  // If confirmed=1, process the unsubscribe
  if (confirmed) {
    suppressionList.add({
      email: parsed.email,
      reason: "unsubscribe",
      suppressedAt: new Date().toISOString(),
      source: `web_confirmed:${parsed.list}`,
    });

    return new Response(
      renderPage(
        "Unsubscribed",
        successHtml(parsed.email, parsed.list),
      ),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  // Show confirmation form
  const listLabel = UNSUBSCRIBE_LISTS.includes(parsed.list)
    ? parsed.list
    : "mailing list";

  return new Response(
    renderPage(
      "Confirm Unsubscribe",
      confirmHtml(parsed.email, listLabel, token),
    ),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

// ── HTML helpers ──────────────────────────────────────────────────────────────

function renderPage(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(title)} — Aegis Lens</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 0; display: flex; min-height: 100vh; align-items: center; justify-content: center; }
    .card { background: #1e293b; border-radius: 12px; padding: 2.5rem; max-width: 440px; width: 100%; margin: 1rem; box-shadow: 0 4px 24px rgba(0,0,0,0.4); }
    h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 1rem; }
    p { color: #94a3b8; line-height: 1.6; margin: 0 0 1.25rem; }
    .email { font-weight: 600; color: #e2e8f0; }
    .list-name { font-weight: 600; color: #60a5fa; }
    button, .btn { display: inline-block; padding: 0.65rem 1.5rem; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; border: none; text-decoration: none; transition: opacity 0.15s; }
    .btn-danger { background: #dc2626; color: #fff; }
    .btn-ghost { background: transparent; color: #94a3b8; border: 1px solid #334155; }
    .btn-danger:hover, .btn-ghost:hover { opacity: 0.85; }
    .actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .success { color: #4ade80; }
    .error { color: #f87171; }
    .logo { font-size: 0.875rem; color: #475569; margin-top: 2rem; }
  </style>
</head>
<body>
  <div class="card">
    ${body}
    <p class="logo">Aegis Lens — aegislens.com</p>
  </div>
</body>
</html>`;
}

function confirmHtml(email: string, list: string, token: string): string {
  const actionUrl = `/api/email/unsubscribe?token=${encodeURIComponent(token)}&confirmed=1`;
  return `
    <h1>Confirm Unsubscribe</h1>
    <p>You are about to unsubscribe <span class="email">${escHtml(email)}</span> from the <span class="list-name">${escHtml(list)}</span> mailing list.</p>
    <p>You will no longer receive emails from this list. Transactional emails (receipts, password resets) are not affected.</p>
    <div class="actions">
      <a href="${escHtml(actionUrl)}" class="btn btn-danger">Yes, unsubscribe me</a>
      <a href="https://aegislens.com" class="btn btn-ghost">Cancel</a>
    </div>`;
}

function successHtml(email: string, list: string): string {
  return `
    <h1 class="success">Unsubscribed</h1>
    <p><span class="email">${escHtml(email)}</span> has been removed from <span class="list-name">${escHtml(list)}</span>.</p>
    <p>It may take up to 48 hours for all queued emails to stop. Transactional emails are unaffected.</p>
    <p>Changed your mind? <a href="https://aegislens.com/settings/notifications" style="color:#60a5fa;">Manage preferences</a></p>`;
}

function errorHtml(message: string): string {
  return `
    <h1 class="error">Error</h1>
    <p>${escHtml(message)}</p>
    <p>Need help? <a href="mailto:support@aegislens.com" style="color:#60a5fa;">support@aegislens.com</a></p>`;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
