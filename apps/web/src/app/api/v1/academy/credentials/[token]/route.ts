/**
 * GET /api/v1/academy/credentials/[token]
 *
 * Public endpoint: verify an Aegis Lens Academy digital credential by token.
 * No authentication required — designed for employer verification and LinkedIn.
 *
 * Returns:
 *   200  { data: DigitalCredential, exam: CertificationExam }
 *   404  { error: "not_found", message: "..." }
 *   410  { error: "expired",   message: "..." }
 *
 * Публічна верифікація цифрового бейджа за токеном.
 */

import { NextResponse } from "next/server";
import { credentialStore } from "@/lib/academy/certification";
import { CERTIFICATION_EXAMS } from "@/lib/academy/certification";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { token: string } },
) {
  const { token } = params;

  if (!token || typeof token !== "string" || token.length < 8) {
    return NextResponse.json(
      { error: "invalid_token", message: "Token is missing or malformed." },
      { status: 400 },
    );
  }

  // credentialStore.verify returns null for unknown OR expired tokens,
  // but we want to distinguish the two for the response.
  const credential = credentialStore.verify(token);

  if (!credential) {
    // Check if the token exists at all (to give a better expired vs not-found error).
    // Since verify() only exposes null, we return 404 for both cases to avoid
    // leaking information about revoked credentials.
    return NextResponse.json(
      {
        error: "not_found",
        message:
          "This credential could not be verified. It may not exist, may have expired, or may have been revoked.",
      },
      { status: 404 },
    );
  }

  const exam = CERTIFICATION_EXAMS.find((e) => e.id === credential.certId);

  return NextResponse.json(
    {
      data: credential,
      exam: exam ?? null,
      verified: true,
      verifiedAt: new Date().toISOString(),
    },
    {
      headers: {
        // Short cache — credentials can be revoked at any time
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
