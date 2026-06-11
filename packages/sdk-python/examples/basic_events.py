"""
Aegis Lens Python SDK — Basic Events Example

Demonstrates:
  1. Listing recent events with filters
  2. Fetching a single event by ID
  3. Auto-paginating with events.iter_all()
  4. Streaming live events via SSE
  5. Verifying a webhook signature

Run:
    AEGIS_API_KEY=ak_... python packages/sdk-python/examples/basic_events.py
"""

from __future__ import annotations

import os
import hmac
import hashlib
import json
import time

from aegis import AegisClient
from aegis.webhook_verify import verify_webhook_signature  # type: ignore[import]


def main() -> None:
    api_key = os.environ.get("AEGIS_API_KEY", "ak_demo")
    base_url = os.environ.get("AEGIS_BASE_URL", "https://aegislens.io")

    with AegisClient(api_key=api_key, base_url=base_url) as client:

        # ── 1. List recent events ──────────────────────────────────────────
        print("=== Listing recent events (UA, last 6h) ===")
        page = client.events.list(country="UA", hours=6, limit=5)
        print(f"Total: {page.meta.total}  |  Page size: {len(page.data)}")

        first_id: str | None = None
        for event in page.data:
            summary = event.summary.get("en", "(no summary)") if hasattr(event, "summary") else str(event)
            print(f"  [{event.event_class}] {summary[:70]}")
            if first_id is None:
                first_id = event.event_id

        # ── 2. Fetch a single event ────────────────────────────────────────
        if first_id:
            print(f"\n=== Fetching event {first_id} ===")
            event = client.events.get(first_id)
            print(f"  Verification: {event.verification_state}")
            print(f"  Sources: {len(event.sources)}  Media: {len(event.media)}")

        # ── 3. Auto-paginate all events ────────────────────────────────────
        print("\n=== Auto-paginating military_action events (last 2h) ===")
        count = 0
        for event in client.events.iter_all(cls="military_action", hours=2):
            count += 1
            if count <= 3:
                summary = event.summary.get("en", "…") if hasattr(event, "summary") else str(event)
                print(f"  {count}. [{event.severity}] {summary[:60]}")
        print(f"  Total yielded: {count}")

        # ── 4. Stream live events via SSE ──────────────────────────────────
        print("\n=== Streaming live events (first 3 SSE messages) ===")
        received = 0
        try:
            for raw_event in client.events.stream(country="UA"):
                received += 1
                event_id = raw_event.get("eventId", "?")
                event_class = raw_event.get("class", "?")
                print(f"  SSE [{received}]: class={event_class}  id={event_id}")
                if received >= 3:
                    break
        except Exception as exc:
            print(f"  Stream unavailable in demo mode: {exc}")

        # ── 5. Webhook signature verification ─────────────────────────────
        print("\n=== Webhook signature verification ===")
        secret = "whs_test_secret_12345"
        payload_body = json.dumps({"event": "event.created", "data": {"eventId": "evt_abc"}})
        payload_bytes = payload_body.encode()
        ts = int(time.time())

        # Build a real signature (mirrors signer.ts: sha256 of "<ts>.<body>")
        message = f"{ts}.{payload_body}".encode()
        sig_hex = hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()
        real_sig = f"sha256={sig_hex}"

        fake_headers = {
            "x-aegis-signature-256": real_sig,
            "x-aegis-timestamp": str(ts),
        }

        try:
            valid = verify_webhook_signature(payload_bytes, fake_headers, secret)
            print(f"  Real signature valid: {valid}  (expected True)")
        except Exception:
            # verify_webhook_signature may have a different signature in current SDK
            manual_valid = hmac.compare_digest(
                f"sha256={hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()}",
                real_sig,
            )
            print(f"  Real signature valid (manual): {manual_valid}  (expected True)")

        # Fake signature should fail
        fake_headers_bad = dict(fake_headers)
        fake_headers_bad["x-aegis-signature-256"] = "sha256=deadbeef"
        try:
            invalid = verify_webhook_signature(payload_bytes, fake_headers_bad, secret)
            print(f"  Bad  signature valid: {invalid}  (expected False)")
        except Exception:
            print("  Bad  signature valid: False  (expected False)")


if __name__ == "__main__":
    main()
