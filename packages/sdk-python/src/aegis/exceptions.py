"""SDK exception hierarchy."""

from __future__ import annotations
from typing import Any, Optional


class AegisError(Exception):
    """Base exception for all Aegis SDK errors."""

    def __init__(
        self,
        message: str,
        status_code: Optional[int] = None,
        error_code: Optional[str] = None,
        detail: Optional[Any] = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.error_code = error_code
        self.detail = detail

    def __repr__(self) -> str:
        return (
            f"{self.__class__.__name__}(message={str(self)!r}, "
            f"status_code={self.status_code}, error_code={self.error_code!r})"
        )


class AuthError(AegisError):
    """API key missing or invalid."""


class RateLimitError(AegisError):
    """Rate limit exceeded. Check retry_after attribute."""

    def __init__(self, message: str, retry_after: Optional[int] = None, **kwargs: Any) -> None:
        super().__init__(message, status_code=429, **kwargs)
        self.retry_after = retry_after


class NotFoundError(AegisError):
    """Requested resource not found."""

    def __init__(self, message: str = "Resource not found", **kwargs: Any) -> None:
        super().__init__(message, status_code=404, **kwargs)


class ValidationError(AegisError):
    """Request validation failed."""

    def __init__(self, message: str, **kwargs: Any) -> None:
        super().__init__(message, status_code=422, **kwargs)


class ServerError(AegisError):
    """Unexpected server error (5xx)."""


class GuardrailError(AegisError):
    """Copilot request blocked by safety guardrail."""

    def __init__(
        self,
        message: str,
        category: Optional[str] = None,
        message_uk: Optional[str] = None,
    ) -> None:
        super().__init__(message, status_code=422, error_code="guardrail_blocked")
        self.category = category
        self.message_uk = message_uk
