"""Pydantic models for Aegis Lens API responses."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field


# ── Enums ────────────────────────────────────────────────────────────────────

EventClass = Literal[
    "drone", "missile", "airstrike", "artillery", "ground_combat",
    "explosion", "fire", "infrastructure_damage", "power_outage",
    "comms_outage", "humanitarian", "displacement", "protest",
    "cyberattack", "chemical", "radiation", "other",
]

VerificationState = Literal[
    "unverified", "in_review", "verified", "disputed", "retracted"
]

DangerBand = Literal["calm", "elevated", "active", "high", "critical"]


# ── Core Models ───────────────────────────────────────────────────────────────

class GeoPoint(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)
    uncertainty_m: Optional[float] = None


class LocalizedText(BaseModel):
    en: Optional[str] = None
    uk: Optional[str] = None

    def __str__(self) -> str:
        return self.en or self.uk or ""


class SourceCitation(BaseModel):
    source_id: str
    source_type: str
    url: Optional[str] = None
    captured_at: Optional[datetime] = None
    archive_url: Optional[str] = None


class EventLink(BaseModel):
    event_id: str
    link_type: str


class AegisEvent(BaseModel):
    event_id: str
    schema_version: str = "1.0.0"
    cls: str = Field(alias="class")
    subclass: Optional[str] = None

    location: Optional[GeoPoint] = None
    country: str
    region_code: Optional[str] = None

    severity: int = Field(ge=1, le=5)
    confidence: float = Field(ge=0.0, le=1.0)
    danger_score: Optional[int] = Field(default=None, ge=0, le=100)
    danger_band: Optional[DangerBand] = None

    verification_state: VerificationState = "unverified"
    occurred_at: datetime
    ingested_at: datetime
    updated_at: datetime

    title: LocalizedText
    summary: Optional[LocalizedText] = None
    media_urls: list[str] = Field(default_factory=list)
    citations: list[SourceCitation] = Field(default_factory=list)
    links: list[EventLink] = Field(default_factory=list)

    org_id: str
    is_public: bool
    is_retracted: bool

    model_config = {"populate_by_name": True}


class AegisSource(BaseModel):
    source_id: str
    name: str
    type: str
    country: Optional[str] = None
    language: Optional[str] = None
    reliability: float = Field(ge=0.0, le=1.0, default=0.7)
    is_active: bool = True
    last_fetched_at: Optional[datetime] = None


class AegisAlert(BaseModel):
    alert_id: str
    name: str
    description: Optional[str] = None
    is_active: bool
    filters: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime


# ── Pagination ────────────────────────────────────────────────────────────────

class PaginationMeta(BaseModel):
    total: Optional[int] = None
    count: int
    next_cursor: Optional[str] = None
    has_more: bool = False


class PagedResponse[T](BaseModel):
    data: list[T]
    meta: PaginationMeta


# ── Copilot ───────────────────────────────────────────────────────────────────

class CopilotStats(BaseModel):
    total_events: int
    top_class: Optional[str] = None
    avg_severity: float
    avg_confidence: float
    time_window_hours: int


class CopilotResponse(BaseModel):
    answer: str
    citations: list[str] = Field(default_factory=list)
    stats: CopilotStats
    model: str
    is_demo: bool = False


# ── Search ────────────────────────────────────────────────────────────────────

class SearchResult(BaseModel):
    event_id: str
    score: float
    event: AegisEvent


class SearchResponse(BaseModel):
    data: list[SearchResult]
    meta: dict[str, Any] = Field(default_factory=dict)


# ── Webhook ───────────────────────────────────────────────────────────────────

class WebhookEndpoint(BaseModel):
    endpoint_id: str
    name: str
    url: str
    events: list[str]
    is_active: bool
    last_triggered_at: Optional[datetime] = None
    failure_count: int = 0
    created_at: datetime
