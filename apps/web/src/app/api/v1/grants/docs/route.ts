'use server';

/**
 * POST /api/v1/grants/docs
 *
 * Register a grant verification document upload.
 * The client uploads the file to object storage first (e.g. S3 presigned URL),
 * then calls this endpoint with the resulting fileRef.
 *
 * Request body:
 *   {
 *     type: GrantDocType;
 *     fileRef: string;        // CDN URL or storage key
 *     mimeType?: string;
 *     originalName?: string;
 *   }
 *
 * Response 201:
 *   { document: GrantDocument }
 *
 * Реєстрація завантаженого документа для верифікації гранту.
 */

import { NextRequest, NextResponse } from "next/server";
import { grantDocStore } from "../../../../lib/billing/grant-doc-upload";
import type { GrantDocType } from "../../../../lib/billing/grant-doc-upload";

const VALID_DOC_TYPES: GrantDocType[] = [
  "press-card",
  "org-registration",
  "student-id",
  "github-profile",
  "tax-exemption",
  "other",
];

export async function POST(req: NextRequest): Promise<NextResponse> {
  // TODO: resolve real userId from session / JWT
  // Отримати реальний userId з сесії або JWT
  const userId = req.headers.get("x-user-id") ?? "anonymous";
  if (userId === "anonymous") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { type, fileRef, mimeType, originalName } = body as {
    type?: unknown;
    fileRef?: unknown;
    mimeType?: unknown;
    originalName?: unknown;
  };

  if (typeof type !== "string" || !VALID_DOC_TYPES.includes(type as GrantDocType)) {
    return NextResponse.json(
      {
        error: `type must be one of: ${VALID_DOC_TYPES.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  if (typeof fileRef !== "string" || !fileRef.trim()) {
    return NextResponse.json(
      { error: "fileRef is required and must be a non-empty string." },
      { status: 400 },
    );
  }

  try {
    const document = grantDocStore.uploadDoc(
      userId,
      type as GrantDocType,
      fileRef,
      {
        mimeType: typeof mimeType === "string" ? mimeType : undefined,
        originalName: typeof originalName === "string" ? originalName : undefined,
      },
    );
    return NextResponse.json({ document }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload registration failed.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
