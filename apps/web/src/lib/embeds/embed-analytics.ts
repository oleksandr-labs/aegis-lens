/**
 * Embed Analytics — anonymous embed-load ping tracking.
 *
 * Collects lightweight telemetry: embed-load, embed-click, embed-error.
 * Pings are anonymous (no PII). The referrer domain is captured as an
 * SEO backlink signal.
 *
 * Анонімна телеметрія embed-ів: завантаження, кліки, помилки.
 * PII не збирається. Домен-реферер використовується як SEO-сигнал.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** API endpoint that receives ping events. Ендпоінт для прийому пінгів. */
export const ANALYTICS_CALLBACK_ENDPOINT = '/api/v1/embeds/ping';

/** Maximum events buffered before a forced flush. Максимум подій у буфері. */
const ANALYTICS_BUFFER_MAX = 50;

/** Auto-flush interval in milliseconds. Інтервал авто-скидання буфера. */
const ANALYTICS_FLUSH_INTERVAL_MS = 10_000;

// ── Event types ───────────────────────────────────────────────────────────────

/**
 * Named event categories for embed telemetry.
 *
 * Типи подій телеметрії embed-ів.
 */
export type EmbedAnalyticsEvent = 'embed-load' | 'embed-click' | 'embed-error';

// ── Interfaces ────────────────────────────────────────────────────────────────

/** A single analytics ping payload. Один запис телеметрії. */
export interface EmbedPing {
  /** Event type. Тип події. */
  event: EmbedAnalyticsEvent;
  /** Embed type (map, timeline, …). Тип embed. */
  embedType: string;
  /** Region context if applicable. Регіон. */
  region?: string;
  /** Referrer domain (no path, no PII). Домен-реферер. */
  referrerDomain?: string;
  /** Unix timestamp (ms). Час події. */
  ts: number;
}

// ── Ping script builder ───────────────────────────────────────────────────────

/**
 * Build an inline <script> snippet that fires an anonymous ping when
 * the embed iframe calls window.parent.postMessage.
 *
 * Генерує вбудований скрипт для надсилання анонімних пінгів.
 */
export function buildAnalyticsPingScript(): string {
  const endpoint = ANALYTICS_CALLBACK_ENDPOINT;

  const scriptBody = `(function(){
  var EP="${endpoint}";
  function ping(data){
    try{
      if(navigator.sendBeacon){
        navigator.sendBeacon(EP,JSON.stringify(data));
      } else {
        var x=new XMLHttpRequest();
        x.open('POST',EP,true);
        x.setRequestHeader('Content-Type','application/json');
        x.send(JSON.stringify(data));
      }
    }catch(e){}
  }
  window.addEventListener('message',function(e){
    if(!e.data||e.data.__aegis!==1)return;
    ping({
      event:e.data.event||'embed-load',
      embedType:e.data.embedType||'unknown',
      region:e.data.region||undefined,
      referrerDomain:location.hostname,
      ts:Date.now()
    });
  });
})();`;

  return [
    `<!-- Aegis Lens Embed Analytics Ping -->`,
    `<script>`,
    scriptBody,
    `</script>`,
  ].join('\n');
}

// ── EmbedAnalyticsStore ───────────────────────────────────────────────────────

/**
 * Server-side in-process buffer for incoming embed pings.
 * In production this would flush to a time-series DB / analytics warehouse.
 *
 * Серверний буфер для пінгів embed-ів (у продакшні → БД/аналітика).
 */
export class EmbedAnalyticsStore {
  private readonly buffer: EmbedPing[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Record a ping event. Triggers a flush when the buffer is full.
   *
   * Записує пінг. При заповненні буфера — скидає.
   */
  record(ping: EmbedPing): void {
    this.buffer.push(ping);
    if (this.buffer.length >= ANALYTICS_BUFFER_MAX) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  // ── Flush ──────────────────────────────────────────────────────────────────

  /**
   * Drain the buffer and return the events.
   * Replace this with a real persistence call in production.
   *
   * Спустошує буфер і повертає події.
   */
  flush(): EmbedPing[] {
    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    return this.buffer.splice(0, this.buffer.length);
  }

  private scheduleFlush(): void {
    if (this.flushTimer !== null) return;
    this.flushTimer = setTimeout(() => {
      this.flush();
    }, ANALYTICS_FLUSH_INTERVAL_MS);
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Return the current buffer without draining it.
   *
   * Повертає поточний буфер без очищення.
   */
  peek(): ReadonlyArray<EmbedPing> {
    return [...this.buffer];
  }

  /** Current buffer size. Поточний розмір буфера. */
  get size(): number {
    return this.buffer.length;
  }

  // ── Aggregates ─────────────────────────────────────────────────────────────

  /**
   * Count pings by event type in the current buffer.
   *
   * Підраховує пінги за типом події.
   */
  countByEvent(): Record<EmbedAnalyticsEvent, number> {
    const counts: Record<EmbedAnalyticsEvent, number> = {
      'embed-load': 0,
      'embed-click': 0,
      'embed-error': 0,
    };
    for (const ping of this.buffer) {
      if (ping.event in counts) counts[ping.event] += 1;
    }
    return counts;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global embed analytics buffer. Глобальний буфер аналітики embed-ів. */
export const embedAnalyticsStore = new EmbedAnalyticsStore();
