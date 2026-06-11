/**
 * POST /api/v1/grants/apply — submit a grant program application
 *
 * Accepts: { program, applicantEmail, organization?, verificationUrl? }
 * Returns: { application, message_en, message_uk }
 *
 * POST /api/v1/grants/apply — подача заявки на грантову програму
 */

import { NextRequest, NextResponse } from "next/server";
import { grantStore, GRANT_PROGRAMS } from "../../../../../lib/billing/grants";
import type { GrantProgram } from "../../../../../lib/billing/types";
import type { GrantApplication } from "../../../../../lib/billing/types";

export const dynamic = "force-dynamic";

const VALID_PROGRAMS: GrantProgram[] = [
  "journalist",
  "ngo",
  "ua-resident",
  "academic",
  "student",
];

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", error_uk: "Невалідне тіло запиту" },
      { status: 400 },
    );
  }

  const { program, applicantEmail, organization, verificationUrl } = body as {
    program?: string;
    applicantEmail?: string;
    organization?: string;
    verificationUrl?: string;
  };

  // ── Validate fields ──────────────────────────────────────────────────────────

  if (!program || !VALID_PROGRAMS.includes(program as GrantProgram)) {
    return NextResponse.json(
      {
        error: `Invalid program. Must be one of: ${VALID_PROGRAMS.join(", ")}`,
        error_uk: `Невалідна програма. Допустимі значення: ${VALID_PROGRAMS.join(", ")}`,
      },
      { status: 422 },
    );
  }

  if (!applicantEmail || !applicantEmail.includes("@")) {
    return NextResponse.json(
      {
        error: "A valid applicantEmail is required.",
        error_uk: "Необхідна валідна email-адреса заявника.",
      },
      { status: 422 },
    );
  }

  const grantProgram = program as GrantProgram;
  const programConfig = GRANT_PROGRAMS[grantProgram];

  // Require verificationUrl for programs that need document verification
  if (programConfig.requiresVerification && !verificationUrl && !organization) {
    return NextResponse.json(
      {
        error:
          `Program "${grantProgram}" requires verification. ` +
          "Please provide verificationUrl (link to credentials) or organization.",
        error_uk:
          `Програма "${grantProgram}" потребує верифікації. ` +
          "Вкажіть verificationUrl (посилання на документи) або organization.",
      },
      { status: 422 },
    );
  }

  // ── Submit application ───────────────────────────────────────────────────────

  const application: GrantApplication = {
    applicantEmail: applicantEmail.toLowerCase().trim(),
    program: grantProgram,
    organization: organization?.trim(),
    verificationUrl: verificationUrl?.trim(),
    status: "pending",
    appliedAt: new Date().toISOString(),
  };

  try {
    grantStore.apply(application);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Duplicate application
    if (msg.includes("already exists")) {
      return NextResponse.json(
        {
          error: "An application for this program already exists for this email.",
          error_uk: "Заявка на цю програму для цього email вже існує.",
        },
        { status: 409 },
      );
    }
    throw err;
  }

  return NextResponse.json(
    {
      application,
      programDetails: {
        label_en: programConfig.label_en,
        label_uk: programConfig.label_uk,
        grantedTierId: programConfig.grantedTierId,
        discountPct: programConfig.discountPct,
        requiresVerification: programConfig.requiresVerification,
      },
      message_en:
        "Your application has been received. " +
        (programConfig.requiresVerification
          ? "Our team will review your credentials within 5 business days."
          : "You will be notified by email once your application is processed."),
      message_uk:
        "Вашу заявку отримано. " +
        (programConfig.requiresVerification
          ? "Наша команда перевірить ваші документи протягом 5 робочих днів."
          : "Ви отримаєте сповіщення на email після опрацювання заявки."),
    },
    { status: 201 },
  );
}
