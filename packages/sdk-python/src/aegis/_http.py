"""Shared HTTP utilities for sync and async clients."""

from __future__ import annotations

from typing import Any, Optional
import httpx

from .exceptions import (
    AegisError, AuthError, RateLimitError, NotFoundError,
    ValidationError, ServerError, GuardrailError,
)

SDK_VERSION = "0.1.0"
DEFAULT_BASE_URL = "https://app.aegislens.com"
DEFAULT_TIMEOUT = 30.0


def build_headers(api_key: Optional[str], user_agent: str) -> dict[str, str]:
    headers = {
        "User-Agent": user_agent,
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    return headers


def raise_for_status(response: httpx.Response) -> None:
    if response.is_success:
        return

    body: dict[str, Any] = {}
    try:
        body = response.json()
    except Exception:
        pass

    status = response.status_code
    message = body.get("error") or body.get("message") or response.reason_phrase or "Unknown error"
    error_code = body.get("error") or body.get("code")

    if status == 401:
        raise AuthError(message, status_code=status, error_code=error_code)
    if status == 422 and error_code == "guardrail_blocked":
        raise GuardrailError(
            message,
            category=body.get("category"),
            message_uk=body.get("messageUk"),
        )
    if status == 422:
        raise ValidationError(message, status_code=status, error_code=error_code, detail=body)
    if status == 429:
        retry_after = None
        ra = response.headers.get("Retry-After")
        if ra:
            try:
                retry_after = int(ra)
            except ValueError:
                pass
        raise RateLimitError(message, retry_after=retry_after)
    if status == 404:
        raise NotFoundError(message, error_code=error_code)
    if status >= 500:
        raise ServerError(message, status_code=status, error_code=error_code)

    raise AegisError(message, status_code=status, error_code=error_code, detail=body)


def build_params(**kwargs: Any) -> dict[str, str]:
    """Drop None values and convert to strings."""
    out: dict[str, str] = {}
    for k, v in kwargs.items():
        if v is None:
            continue
        if isinstance(v, bool):
            out[k] = "true" if v else "false"
        elif isinstance(v, list):
            out[k] = ",".join(str(i) for i in v)
        else:
            out[k] = str(v)
    return out
