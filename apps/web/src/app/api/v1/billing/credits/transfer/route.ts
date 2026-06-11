'use server';

/**
 * POST /api/v1/billing/credits/transfer
 *
 * Transfer credits from the authenticated user to another user in the same org.
 *
 * Request body:
 *   { toUserId: string; amount: number; note?: string }
 *
 * Response 200:
 *   { transfer: CreditTransfer }
 *
 * Переказ кредитів між користувачами однієї організації.
 */

import { NextRequest, NextResponse } from "next/server";
import { creditTransferStore, TRANSFER_MIN } from "../../../../../lib/billing/credits-transfer";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { toUserId, amount, note } = body as {
    toUserId?: unknown;
    amount?: unknown;
    note?: unknown;
  };

  if (typeof toUserId !== "string" || !toUserId.trim()) {
    return NextResponse.json({ error: "toUserId is required." }, { status: 400 });
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount < TRANSFER_MIN) {
    return NextResponse.json(
      { error: `amount must be a number ≥ ${TRANSFER_MIN}.` },
      { status: 400 },
    );
  }

  // TODO: resolve real userId from session / JWT
  // Отримати реальний userId з сесії або JWT
  const fromUserId = req.headers.get("x-user-id") ?? "anonymous";
  if (fromUserId === "anonymous") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const transfer = creditTransferStore.transfer(
      fromUserId,
      toUserId,
      parsedAmount,
      typeof note === "string" ? note : "",
    );
    return NextResponse.json({ transfer }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Transfer failed.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
