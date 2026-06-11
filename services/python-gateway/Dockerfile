# Multi-stage Python 3.12 slim image for the Aegis Lens AI Gateway.
#
# Stage 1 (builder): install dependencies into a virtual env
# Stage 2 (runtime): copy only the venv + app code — no build tools in prod image
#
# Build:
#   docker build -t aegis-python-gateway .
#
# Run:
#   docker run -p 8001:8001 --env-file .env.local aegis-python-gateway
#
# Environment variables:
#   PORT              — listening port (default 8001)
#   ENV               — "development" enables uvicorn --reload
#   ALLOWED_ORIGINS   — comma-separated CORS origins
#   KAFKA_BOOTSTRAP_SERVERS — optional, for event publishing

# ── Stage 1: builder ──────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

# Install build dependencies (needed by some ML wheels)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Create a virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip + install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

# Non-root user for security
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid appgroup --no-create-home appuser

WORKDIR /app

# Copy the virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application source
COPY main.py .

# Set ownership
RUN chown -R appuser:appgroup /app

USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:${PORT:-8001}/health').raise_for_status()"

EXPOSE 8001

ENV PORT=8001
ENV ENV=production
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "2"]
