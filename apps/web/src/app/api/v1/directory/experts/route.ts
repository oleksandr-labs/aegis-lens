/**
 * GET /api/v1/directory/experts
 * Returns the public expert profiles list with domain configuration metadata.
 * Повертає список публічних профілів експертів з метаданими конфігурації доменів.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getPublicExperts,
  EXPERT_VERIFICATION_PROCESS_EN,
  EXPERT_VERIFICATION_PROCESS_UK,
  EXPERT_BOOKING_NOTE_EN,
  EXPERT_BOOKING_NOTE_UK,
  EXPERT_PRIVACY_NOTE_EN,
  EXPERT_PRIVACY_NOTE_UK,
  EXPERT_FEATURED_NOTE_EN,
  EXPERT_FEATURED_NOTE_UK,
  EXPERT_EEAT_NOTE_EN,
  EXPERT_EEAT_NOTE_UK,
  EXPERT_PROGRAMMATIC_NOTE_EN,
  EXPERT_PROGRAMMATIC_NOTE_UK,
  EXPERT_INTEGRITY_NOTE_EN,
  EXPERT_INTEGRITY_NOTE_UK,
} from "../../../../../lib/directory/experts";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  const data = getPublicExperts();

  return NextResponse.json(
    {
      object: "list",
      count: data.length,
      data,
      config: {
        verificationProcess: {
          en: EXPERT_VERIFICATION_PROCESS_EN,
          uk: EXPERT_VERIFICATION_PROCESS_UK,
        },
        bookingNote: {
          en: EXPERT_BOOKING_NOTE_EN,
          uk: EXPERT_BOOKING_NOTE_UK,
        },
        privacyNote: {
          en: EXPERT_PRIVACY_NOTE_EN,
          uk: EXPERT_PRIVACY_NOTE_UK,
        },
        featuredNote: {
          en: EXPERT_FEATURED_NOTE_EN,
          uk: EXPERT_FEATURED_NOTE_UK,
        },
        eeatNote: {
          en: EXPERT_EEAT_NOTE_EN,
          uk: EXPERT_EEAT_NOTE_UK,
        },
        programmaticNote: {
          en: EXPERT_PROGRAMMATIC_NOTE_EN,
          uk: EXPERT_PROGRAMMATIC_NOTE_UK,
        },
        integrityNote: {
          en: EXPERT_INTEGRITY_NOTE_EN,
          uk: EXPERT_INTEGRITY_NOTE_UK,
        },
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
        "Aegis-API-Version": "v1",
      },
    },
  );
}
