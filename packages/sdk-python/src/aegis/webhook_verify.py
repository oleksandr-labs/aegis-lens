"""Webhook signature verification helpers."""

from __future__ import annotations

import hashlib
import hmac
import time
from typing import Optional


def verify_webhook_signature(
    payload: bytes,
    signature: str,
    secret: str,
    *,
    tolerance_seconds: int = 300,
    timestamp: Optional[str] = None,
) -> bool:
    """Verify an Aegis webhook signature.

    Args:
        payload: Raw request body bytes.
        signature: Value of the ``X-Aegis-Signature`` header (``sha256=...``).
        secret: Your webhook endpoint secret.
        tolerance_seconds: Max age of the delivery in seconds (default 300).
        timestamp: Value of ``X-Aegis-Timestamp`` header (Unix seconds).

    Returns:
        ``True`` if valid, raises ``ValueError`` otherwise.
    """
    if timestamp is not None:
        try:
            ts = int(timestamp)
        except ValueError as exc:
            raise ValueError(f"Invalid X-Aegis-Timestamp: {timestamp!r}") from exc
        age = abs(time.time() - ts)
        if age > tolerance_seconds:
            raise ValueError(
                f"Webhook timestamp is {age:.0f}s old (tolerance {tolerance_seconds}s). "
                "Possible replay attack."
            )
        signed_body = f"{timestamp}.".encode() + payload
    else:
        signed_body = payload

    expected_hex = hmac.new(secret.encode(), signed_body, hashlib.sha256).hexdigest()
    expected = f"sha256={expected_hex}"

    if not hmac.compare_digest(expected, signature):
        raise ValueError("Webhook signature mismatch — request is not authentic.")
    return True


def extract_event_type(payload: dict) -> Optional[str]:
    """Extract the event type from a webhook payload dict."""
    return payload.get("type") or payload.get("event") or payload.get("eventType")
