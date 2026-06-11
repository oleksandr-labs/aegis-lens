"""Synchronous Aegis Lens client."""

from __future__ import annotations

from typing import Any, Generator, Iterator, Optional
import httpx

from .models import (
    AegisEvent, AegisSource, AegisAlert, PagedResponse,
    CopilotResponse, SearchResponse, WebhookEndpoint, PaginationMeta,
)
from ._http import (
    build_headers, build_params, raise_for_status,
    SDK_VERSION, DEFAULT_BASE_URL, DEFAULT_TIMEOUT,
)


class EventsResource:
    def __init__(self, client: "AegisClient") -> None:
        self._c = client

    def list(
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
        data = self._c._get("/api/events", params=params)
        events = [AegisEvent.model_validate(e) for e in data["data"]]
        raw_meta = data.get("meta", {})
        meta = PaginationMeta(
            count=len(events),
            total=raw_meta.get("total"),
            next_cursor=raw_meta.get("nextCursor"),
            has_more=bool(raw_meta.get("nextCursor")),
        )
        return PagedResponse[AegisEvent](data=events, meta=meta)

    def get(self, event_id: str) -> AegisEvent:
        data = self._c._get(f"/api/events/{event_id}")
        return AegisEvent.model_validate(data["data"])

    def iter_all(self, **kwargs: Any) -> Iterator[AegisEvent]:
        """Auto-paginate: yields all events matching filters."""
        cursor: Optional[str] = None
        while True:
            page = self.list(cursor=cursor, **kwargs)
            yield from page.data
            if not page.meta.has_more or not page.meta.next_cursor:
                break
            cursor = page.meta.next_cursor

    def stream(
        self,
        *,
        cls: Optional[str] = None,
        country: Optional[str] = None,
        severity: Optional[int] = None,
    ) -> Generator[dict[str, Any], None, None]:
        """SSE stream of live events. Yields parsed event dicts."""
        params = build_params(cls=cls, country=country, severity=severity)
        with self._c._http.stream("GET", "/api/events/stream", params=params) as resp:
            raise_for_status(resp)
            for line in resp.iter_lines():
                if line.startswith("data:"):
                    import json
                    raw = line[5:].strip()
                    if raw and raw != "[DONE]":
                        try:
                            yield json.loads(raw)
                        except Exception:
                            pass


class SearchResource:
    def __init__(self, client: "AegisClient") -> None:
        self._c = client

    def query(
        self,
        q: str,
        *,
        cls: Optional[str | list[str]] = None,
        severity: Optional[int] = None,
        since: Optional[str] = None,
        until: Optional[str] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        radius_km: Optional[float] = None,
        limit: int = 10,
        cursor: Optional[str] = None,
    ) -> SearchResponse:
        params = build_params(
            q=q, cls=cls, severity=severity, since=since,
            until=until, lat=lat, lon=lon, radiusKm=radius_km,
            limit=limit, cursor=cursor,
        )
        data = self._c._get("/api/search", params=params)
        return SearchResponse.model_validate(data)


class CopilotResource:
    def __init__(self, client: "AegisClient") -> None:
        self._c = client

    def ask(
        self,
        prompt: str,
        *,
        country: Optional[str] = None,
        hours: Optional[int] = None,
    ) -> CopilotResponse:
        body = build_params(prompt=prompt, country=country, hours=hours)
        data = self._c._post("/api/copilot", json=body)
        return CopilotResponse.model_validate(data)


class AlertsResource:
    def __init__(self, client: "AegisClient") -> None:
        self._c = client

    def list(self) -> list[AegisAlert]:
        data = self._c._get("/api/alerts")
        return [AegisAlert.model_validate(a) for a in data["data"]]

    def create(self, *, name: str, filters: dict[str, Any], description: Optional[str] = None) -> AegisAlert:
        body = {"name": name, "filters": filters, "description": description}
        data = self._c._post("/api/alerts", json=body)
        return AegisAlert.model_validate(data["data"])

    def delete(self, alert_id: str) -> None:
        self._c._delete(f"/api/alerts/{alert_id}")


class SourcesResource:
    def __init__(self, client: "AegisClient") -> None:
        self._c = client

    def list(self) -> list[AegisSource]:
        data = self._c._get("/api/sources")
        return [AegisSource.model_validate(s) for s in data["data"]]


class WebhooksResource:
    def __init__(self, client: "AegisClient") -> None:
        self._c = client

    def list(self) -> list[WebhookEndpoint]:
        data = self._c._get("/api/webhooks")
        return [WebhookEndpoint.model_validate(w) for w in data["data"]]

    def create(self, *, name: str, url: str, events: list[str], secret: Optional[str] = None) -> WebhookEndpoint:
        body = {"name": name, "url": url, "events": events, "secret": secret}
        data = self._c._post("/api/webhooks", json={k: v for k, v in body.items() if v is not None})
        return WebhookEndpoint.model_validate(data["data"])

    def delete(self, endpoint_id: str) -> None:
        self._c._delete(f"/api/webhooks/{endpoint_id}")

    def verify_signature(self, payload: bytes, signature: str, secret: str) -> bool:
        """Verify a webhook delivery signature."""
        import hmac, hashlib
        expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
        return hmac.compare_digest(f"sha256={expected}", signature)


class AegisClient:
    """Synchronous Aegis Lens API client.

    Example::

        from aegis import AegisClient

        client = AegisClient(api_key="ak_...")
        for event in client.events.iter_all(country="UA", hours=24):
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
        ua = user_agent or f"aegis-sdk-python/{SDK_VERSION}"
        self._http = httpx.Client(
            base_url=base_url,
            headers=build_headers(self._api_key, ua),
            timeout=timeout,
        )
        self.events = EventsResource(self)
        self.search = SearchResource(self)
        self.copilot = CopilotResource(self)
        self.alerts = AlertsResource(self)
        self.sources = SourcesResource(self)
        self.webhooks = WebhooksResource(self)

    def _get(self, path: str, *, params: Optional[dict[str, str]] = None) -> Any:
        resp = self._http.get(path, params=params)
        raise_for_status(resp)
        return resp.json()

    def _post(self, path: str, *, json: Optional[dict[str, Any]] = None) -> Any:
        resp = self._http.post(path, json=json)
        raise_for_status(resp)
        return resp.json()

    def _delete(self, path: str) -> None:
        resp = self._http.delete(path)
        raise_for_status(resp)

    def close(self) -> None:
        self._http.close()

    def __enter__(self) -> "AegisClient":
        return self

    def __exit__(self, *_: Any) -> None:
        self.close()
