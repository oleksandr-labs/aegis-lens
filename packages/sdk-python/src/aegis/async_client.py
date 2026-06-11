"""Async Aegis Lens client (httpx-based)."""

from __future__ import annotations

from typing import Any, AsyncIterator, Optional
import httpx

from .models import (
    AegisEvent, AegisSource, AegisAlert, PagedResponse,
    CopilotResponse, SearchResponse, WebhookEndpoint, PaginationMeta,
)
from ._http import (
    build_headers, build_params, raise_for_status,
    SDK_VERSION, DEFAULT_BASE_URL, DEFAULT_TIMEOUT,
)


class AsyncEventsResource:
    def __init__(self, client: "AsyncAegisClient") -> None:
        self._c = client

    async def list(
        self,
        *,
        country: Optional[str] = None,
        cls: Optional[str | list[str]] = None,
        region: Optional[str] = None,
        since: Optional[str] = None,
        until: Optional[str] = None,
        hours: Optional[int] = None,
        severity: Optional[int] = None,
        limit: int = 20,
        cursor: Optional[str] = None,
    ) -> PagedResponse[AegisEvent]:
        params = build_params(
            country=country, cls=cls, region=region,
            since=since, until=until, hours=hours,
            severity=severity, limit=limit, cursor=cursor,
        )
        data = await self._c._get("/api/events", params=params)
        events = [AegisEvent.model_validate(e) for e in data["data"]]
        raw_meta = data.get("meta", {})
        meta = PaginationMeta(
            count=len(events),
            total=raw_meta.get("total"),
            next_cursor=raw_meta.get("nextCursor"),
            has_more=bool(raw_meta.get("nextCursor")),
        )
        return PagedResponse[AegisEvent](data=events, meta=meta)

    async def get(self, event_id: str) -> AegisEvent:
        data = await self._c._get(f"/api/events/{event_id}")
        return AegisEvent.model_validate(data["data"])

    async def iter_all(self, **kwargs: Any) -> AsyncIterator[AegisEvent]:
        cursor: Optional[str] = None
        while True:
            page = await self.list(cursor=cursor, **kwargs)
            for event in page.data:
                yield event
            if not page.meta.has_more or not page.meta.next_cursor:
                break
            cursor = page.meta.next_cursor


class AsyncCopilotResource:
    def __init__(self, client: "AsyncAegisClient") -> None:
        self._c = client

    async def ask(
        self,
        prompt: str,
        *,
        country: Optional[str] = None,
        hours: Optional[int] = None,
    ) -> CopilotResponse:
        body = build_params(prompt=prompt, country=country, hours=hours)
        data = await self._c._post("/api/copilot", json=body)
        return CopilotResponse.model_validate(data)


class AsyncAegisClient:
    """Async Aegis Lens API client.

    Example::

        async with AsyncAegisClient(api_key="ak_...") as client:
            async for event in client.events.iter_all(country="UA", hours=24):
                print(event.title)
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        *,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = DEFAULT_TIMEOUT,
        user_agent: Optional[str] = None,
    ) -> None:
        import os
        self._api_key = api_key or os.environ.get("AEGIS_API_KEY")
        ua = user_agent or f"aegis-sdk-python/{SDK_VERSION} (async)"
        self._http = httpx.AsyncClient(
            base_url=base_url,
            headers=build_headers(self._api_key, ua),
            timeout=timeout,
        )
        self.events = AsyncEventsResource(self)
        self.copilot = AsyncCopilotResource(self)

    async def _get(self, path: str, *, params: Optional[dict[str, str]] = None) -> Any:
        resp = await self._http.get(path, params=params)
        raise_for_status(resp)
        return resp.json()

    async def _post(self, path: str, *, json: Optional[dict[str, Any]] = None) -> Any:
        resp = await self._http.post(path, json=json)
        raise_for_status(resp)
        return resp.json()

    async def aclose(self) -> None:
        await self._http.aclose()

    async def __aenter__(self) -> "AsyncAegisClient":
        return self

    async def __aexit__(self, *_: Any) -> None:
        await self.aclose()
