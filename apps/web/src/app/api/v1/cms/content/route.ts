/**
 * GET /api/v1/cms/content  — list content documents (stub; returns empty list)
 * POST /api/v1/cms/content — create a new content document draft
 *
 * GET /api/v1/cms/content  — список документів контенту (заглушка)
 * POST /api/v1/cms/content — створює нову чернетку документа контенту
 */

import { type NextRequest, NextResponse } from "next/server";

import { CmsContentType } from "@/lib/cms/content-types";
import { CONTENT_TYPE_CONFIGS } from "@/lib/cms/content-types";
import { versionStore } from "@/lib/cms/versioning";
import { validateSeoFields } from "@/lib/cms/seo-fields";

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const typeParam = searchParams.get("type") as CmsContentType | null;

  if (typeParam && !Object.values(CmsContentType).includes(typeParam)) {
    return NextResponse.json(
      { error: `Unknown content type: ${typeParam}` },
      { status: 400 },
    );
  }

  // Stub: return available content types and their configs
  // Заглушка: повертає доступні типи контенту та їх конфігурації
  const types = typeParam
    ? { [typeParam]: CONTENT_TYPE_CONFIGS[typeParam] }
    : CONTENT_TYPE_CONFIGS;

  return NextResponse.json({ contentTypes: types, documents: [] });
}

// ── POST ──────────────────────────────────────────────────────────────────────

export interface CreateContentBody {
  contentType: CmsContentType;
  contentId: string;
  authorId: string;
  /** SEO fields to validate on creation. */
  seo?: {
    title?: string;
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
  };
  /** Content snapshot (opaque). */
  snapshot?: unknown;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    contentType,
    contentId,
    authorId,
    seo,
    snapshot,
  } = body as Partial<CreateContentBody>;

  if (!contentType || !contentId || !authorId) {
    return NextResponse.json(
      { error: "Missing required fields: contentType, contentId, authorId" },
      { status: 400 },
    );
  }

  if (!Object.values(CmsContentType).includes(contentType)) {
    return NextResponse.json(
      { error: `Unknown content type: ${contentType}` },
      { status: 400 },
    );
  }

  // Validate SEO fields if provided
  // Перевіряємо SEO-поля, якщо надані
  if (seo) {
    const seoErrors = validateSeoFields(seo);
    if (seoErrors.length > 0) {
      return NextResponse.json(
        { error: "SEO validation failed", details: seoErrors },
        { status: 422 },
      );
    }
  }

  // Create a draft version
  // Створюємо чернетку версії
  const version = versionStore.createDraft(contentId, authorId, snapshot ?? {});

  return NextResponse.json(
    {
      message: "Draft created",
      contentId,
      contentType,
      versionId: version.id,
      version: version.version,
      status: version.status,
    },
    { status: 201 },
  );
}
