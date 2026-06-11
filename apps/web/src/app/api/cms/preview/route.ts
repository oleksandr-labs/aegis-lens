/**
 * GET /api/cms/preview
 * Activates Next.js Draft Mode for a given content type + slug after validating
 * the shared CMS preview secret.
 *
 * GET /api/cms/preview
 * Вмикає Draft Mode Next.js для заданого типу контенту і slug після перевірки
 * спільного секрету превью CMS.
 */

import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";

import { validatePreviewRequest, PREVIEW_CONFIG } from "@/lib/cms/preview";

export async function GET(request: NextRequest): Promise<NextResponse | never> {
  const { searchParams } = request.nextUrl;

  const token = searchParams.get(PREVIEW_CONFIG.secretParam);
  const contentType = searchParams.get(PREVIEW_CONFIG.typeParam);
  const slug = searchParams.get(PREVIEW_CONFIG.slugParam);

  if (!validatePreviewRequest(token)) {
    return NextResponse.json({ error: "Invalid preview token" }, { status: 401 });
  }

  if (!contentType || !slug) {
    return NextResponse.json(
      { error: "Missing type or slug query params" },
      { status: 400 },
    );
  }

  // Enable Next.js Draft Mode so the page renders unpublished content.
  // Вмикаємо Draft Mode Next.js для рендеру неопублікованого контенту.
  (await draftMode()).enable();

  // Redirect to the content's preview page.
  // Перенаправляємо на сторінку превью контенту.
  const previewPath = `/${contentType}/${slug}`;
  redirect(previewPath);
}
