"""FastAPI gateway for AI/ML services (vision, NLP, predictions).

Routes:
  GET  /health                     — liveness probe
  POST /vision/detect              — object detection in an image
  POST /vision/ocr                 — optical character recognition
  POST /nlp/classify               — text classification (event type, severity)
  POST /nlp/extract-entities       — named entity recognition
  POST /nlp/translate              — translation (EN ↔ UK)
  POST /predictions/forecast       — activity forecast for a region

All routes return typed responses.
In production, replace the stub bodies with real model inference calls.

Шлюз FastAPI для AI/ML: vision, NLP, передбачення.
Всі маршрути — заглушки з типізованими відповідями.
"""

from __future__ import annotations

import logging
import os
import time
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# ── App setup ─────────────────────────────────────────────────────────────────

logger = logging.getLogger("python-gateway")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Aegis Lens — Python AI Gateway",
    description="AI/ML microservice for vision, NLP, and prediction tasks.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Allow calls from the Next.js app and internal services
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)

# ── Request timing middleware ─────────────────────────────────────────────────

@app.middleware("http")
async def add_process_time(request: Request, call_next: Any) -> Any:
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
    response.headers["X-Process-Time-Ms"] = str(elapsed_ms)
    return response


# ── Health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "python-gateway"
    version: str = "0.1.0"
    timestamp: float = Field(default_factory=time.time)
    models_loaded: dict[str, bool] = Field(
        default_factory=lambda: {
            "vision_detect": False,
            "vision_ocr": False,
            "nlp_classify": False,
            "nlp_ner": False,
            "nlp_translate": False,
            "forecast": False,
        }
    )


@app.get("/health", response_model=HealthResponse, tags=["system"])
async def health() -> HealthResponse:
    """Liveness probe — returns 200 when the service is running."""
    return HealthResponse()


# ── Vision models ─────────────────────────────────────────────────────────────

class VisionRequest(BaseModel):
    """Image submitted as base64 or a publicly accessible URL."""
    image_url: Optional[str] = Field(None, description="Public HTTPS image URL")
    image_base64: Optional[str] = Field(None, description="Base64-encoded image (JPEG/PNG/WEBP)")
    confidence_threshold: float = Field(0.5, ge=0.0, le=1.0)


class DetectedObject(BaseModel):
    label: str
    confidence: float
    bounding_box: Optional[dict[str, float]] = None  # {x, y, w, h} normalised 0–1


class VisionDetectResponse(BaseModel):
    request_id: str
    objects: list[DetectedObject]
    processing_time_ms: float
    model: str = "stub-yolov8"


@app.post("/vision/detect", response_model=VisionDetectResponse, tags=["vision"])
async def vision_detect(req: VisionRequest) -> VisionDetectResponse:
    """Object detection in an image.

    Detects vehicles, personnel, equipment, and infrastructure damage.
    In production: load YOLOv8 / RT-DETR weights fine-tuned on OSINT imagery.
    """
    if not req.image_url and not req.image_base64:
        raise HTTPException(status_code=422, detail="Provide image_url or image_base64")

    # Stub: real model inference wired here in production
    return VisionDetectResponse(
        request_id=_new_id(),
        objects=[
            DetectedObject(label="vehicle", confidence=0.87, bounding_box={"x": 0.2, "y": 0.3, "w": 0.15, "h": 0.1}),
        ],
        processing_time_ms=12.5,
    )


class OcrResponse(BaseModel):
    request_id: str
    text: str
    confidence: float
    language_detected: Optional[str] = None
    processing_time_ms: float
    model: str = "stub-easyocr"


@app.post("/vision/ocr", response_model=OcrResponse, tags=["vision"])
async def vision_ocr(req: VisionRequest) -> OcrResponse:
    """Optical character recognition from an image.

    In production: EasyOCR or PaddleOCR with Ukrainian + Russian + English support.
    """
    if not req.image_url and not req.image_base64:
        raise HTTPException(status_code=422, detail="Provide image_url or image_base64")

    return OcrResponse(
        request_id=_new_id(),
        text="[OCR stub — no text extracted]",
        confidence=0.0,
        language_detected=None,
        processing_time_ms=8.0,
    )


# ── NLP models ────────────────────────────────────────────────────────────────

class NlpRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=32_000)
    language: str = Field("uk", description="ISO 639-1 language code (uk, en, ru)")


class ClassifyResponse(BaseModel):
    request_id: str
    label: str
    confidence: float
    all_labels: list[dict[str, float]]
    processing_time_ms: float
    model: str = "stub-bert-ua"


@app.post("/nlp/classify", response_model=ClassifyResponse, tags=["nlp"])
async def nlp_classify(req: NlpRequest) -> ClassifyResponse:
    """Text classification: event type (airstrike, shelling, movement...) + severity.

    In production: fine-tuned multilingual BERT / XLM-RoBERTa on OSINT event corpus.
    """
    return ClassifyResponse(
        request_id=_new_id(),
        label="unclassified",
        confidence=0.0,
        all_labels=[
            {"airstrike": 0.0},
            {"shelling": 0.0},
            {"movement": 0.0},
            {"unclassified": 1.0},
        ],
        processing_time_ms=15.0,
    )


class Entity(BaseModel):
    text: str
    label: str  # PERSON | ORG | GPE | MILITARY_UNIT | WEAPON | DATE | ...
    start: int
    end: int
    confidence: float


class NerResponse(BaseModel):
    request_id: str
    entities: list[Entity]
    processing_time_ms: float
    model: str = "stub-spacy-ua"


@app.post("/nlp/extract-entities", response_model=NerResponse, tags=["nlp"])
async def nlp_extract_entities(req: NlpRequest) -> NerResponse:
    """Named entity recognition: people, organisations, locations, military units.

    In production: spaCy with uk_core_news_trf + custom military entity model.
    """
    return NerResponse(
        request_id=_new_id(),
        entities=[],
        processing_time_ms=10.0,
    )


class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10_000)
    source_language: Optional[str] = Field(None, description="Auto-detect if omitted")
    target_language: str = Field("en", description="Target language (en or uk)")


class TranslateResponse(BaseModel):
    request_id: str
    translated_text: str
    source_language: str
    target_language: str
    processing_time_ms: float
    model: str = "stub-opus-mt"


@app.post("/nlp/translate", response_model=TranslateResponse, tags=["nlp"])
async def nlp_translate(req: TranslateRequest) -> TranslateResponse:
    """Text translation between Ukrainian and English.

    In production: Helsinki-NLP opus-mt-uk-en / DeepL API with fallback.
    """
    return TranslateResponse(
        request_id=_new_id(),
        translated_text=f"[translation stub: {req.text[:100]}]",
        source_language=req.source_language or "auto",
        target_language=req.target_language,
        processing_time_ms=20.0,
    )


# ── Predictions ───────────────────────────────────────────────────────────────

class ForecastRequest(BaseModel):
    region: str = Field(..., description="Oblast code (e.g. UA-30)")
    forecast_horizon_days: int = Field(7, ge=1, le=30)
    event_types: list[str] = Field(
        default_factory=lambda: ["airstrike", "shelling", "movement"],
        description="Event types to forecast",
    )


class ForecastPoint(BaseModel):
    date: str  # YYYY-MM-DD
    event_type: str
    predicted_count: float
    confidence_interval_low: float
    confidence_interval_high: float


class ForecastResponse(BaseModel):
    request_id: str
    region: str
    forecast: list[ForecastPoint]
    model: str = "stub-prophet"
    generated_at: str
    processing_time_ms: float


@app.post("/predictions/forecast", response_model=ForecastResponse, tags=["predictions"])
async def predictions_forecast(req: ForecastRequest) -> ForecastResponse:
    """Activity forecast for a region over the next N days.

    In production: Meta Prophet / NeuralProphet trained on historical event data
    + weather, terrain, and seasonal features.
    """
    import datetime

    forecast: list[ForecastPoint] = []
    today = datetime.date.today()
    for day_offset in range(req.forecast_horizon_days):
        date_str = (today + datetime.timedelta(days=day_offset)).isoformat()
        for event_type in req.event_types:
            forecast.append(
                ForecastPoint(
                    date=date_str,
                    event_type=event_type,
                    predicted_count=0.0,
                    confidence_interval_low=0.0,
                    confidence_interval_high=0.0,
                )
            )

    return ForecastResponse(
        request_id=_new_id(),
        region=req.region,
        forecast=forecast,
        generated_at=datetime.datetime.utcnow().isoformat() + "Z",
        processing_time_ms=5.0,
    )


# ── Global error handler ──────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled exception on %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "path": str(request.url.path)},
    )


# ── Helpers ───────────────────────────────────────────────────────────────────

def _new_id() -> str:
    """Generates a short unique request ID."""
    import uuid
    return str(uuid.uuid4())[:8]


# ── Dev entrypoint ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8001")),
        reload=os.getenv("ENV", "production") == "development",
        log_level="info",
    )
