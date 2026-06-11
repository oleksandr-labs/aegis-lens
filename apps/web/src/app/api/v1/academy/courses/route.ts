/**
 * GET /api/v1/academy/courses
 *
 * Returns the Aegis Lens Academy course catalog.
 *
 * Query parameters:
 *   ?level=beginner|intermediate|advanced|expert  — filter by difficulty level
 *   ?free=true                                    — return only free courses
 *   ?format=self-paced|cohort-based|...           — filter by format
 *
 * Повертає каталог курсів Академії з опціональною фільтрацією.
 */

import { NextResponse } from "next/server";
import {
  COURSE_CATALOG,
  type CourseLevel,
  type CourseFormat,
} from "@/lib/academy/course-catalog";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const levelParam = url.searchParams.get("level") as CourseLevel | null;
  const freeParam = url.searchParams.get("free");
  const formatParam = url.searchParams.get("format") as CourseFormat | null;

  const validLevels: CourseLevel[] = [
    "beginner",
    "intermediate",
    "advanced",
    "expert",
  ];
  const validFormats: CourseFormat[] = [
    "self-paced",
    "cohort-based",
    "corporate-private",
    "bootcamp",
  ];

  // Validate level param
  if (levelParam && !validLevels.includes(levelParam)) {
    return NextResponse.json(
      {
        error: "invalid_param",
        message: `level must be one of: ${validLevels.join(", ")}`,
      },
      { status: 400 },
    );
  }

  // Validate format param
  if (formatParam && !validFormats.includes(formatParam)) {
    return NextResponse.json(
      {
        error: "invalid_param",
        message: `format must be one of: ${validFormats.join(", ")}`,
      },
      { status: 400 },
    );
  }

  let courses = COURSE_CATALOG;

  if (levelParam) {
    courses = courses.filter((c) => c.level === levelParam);
  }

  if (formatParam) {
    courses = courses.filter((c) => c.format === formatParam);
  }

  if (freeParam === "true") {
    courses = courses.filter((c) => c.isFree);
  }

  return NextResponse.json(
    {
      data: courses,
      total: courses.length,
      filters: {
        level: levelParam ?? null,
        free: freeParam === "true" ? true : null,
        format: formatParam ?? null,
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
