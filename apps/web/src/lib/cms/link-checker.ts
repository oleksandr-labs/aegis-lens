/**
 * Inline Link Checker + Dead-Link Reports — scans content for HTTP links,
 * checks their reachability, and maintains a daily dead-link report store.
 *
 * Перевірка посилань + звіти про мертві посилання — сканує контент на HTTP-посилання,
 * перевіряє їх доступність та веде щоденне сховище звітів.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Timeout in milliseconds for each HTTP HEAD request during link checking.
 *
 * Таймаут у мілісекундах для кожного HTTP HEAD-запиту при перевірці посилань.
 */
export const LINK_CHECK_TIMEOUT_MS = 5_000;

// ── Types ─────────────────────────────────────────────────────────────────────

export type LinkStatus = "ok" | "dead" | "redirect" | "timeout" | "error";

export interface LinkCheckResult {
  /** The URL that was checked. / URL, який перевірявся. */
  url: string;
  status: LinkStatus;
  /** HTTP status code if obtained, or null. / HTTP-код статусу, якщо отримано, або null. */
  httpStatus: number | null;
  /** ISO-8601 timestamp of the check. / Мітка часу перевірки ISO-8601. */
  checkedAt: string;
  /** Error message for error/timeout statuses. / Повідомлення про помилку. */
  error?: string;
}

// ── Link extractor ────────────────────────────────────────────────────────────

/** Regex to extract http/https links from Markdown/MDX content. */
const URL_PATTERN = /https?:\/\/[^\s"')>\]]+/g;

/**
 * Extract all unique HTTP/HTTPS URLs from a content string.
 *
 * Видобуває всі унікальні HTTP/HTTPS URL з рядка контенту.
 */
export function extractLinks(content: string): string[] {
  const matches = content.match(URL_PATTERN) ?? [];
  return [...new Set(matches)];
}

// ── Checker ───────────────────────────────────────────────────────────────────

/**
 * Check all HTTP/HTTPS links in a content string.
 * Uses HTTP HEAD requests; falls back to GET on 405.
 * Stub in environments where fetch is unavailable.
 *
 * Перевіряє всі HTTP/HTTPS посилання у рядку контенту.
 * Використовує HEAD-запити; відступає до GET при 405.
 * Заглушка в середовищах без fetch.
 */
export async function checkLinks(content: string): Promise<LinkCheckResult[]> {
  const urls = extractLinks(content);
  return Promise.all(urls.map((url) => _checkSingleLink(url)));
}

async function _checkSingleLink(url: string): Promise<LinkCheckResult> {
  const checkedAt = new Date().toISOString();

  if (typeof fetch === "undefined") {
    // Stub for non-browser / pre-fetch environments
    return { url, status: "ok", httpStatus: null, checkedAt, error: "fetch unavailable (stub)" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LINK_CHECK_TIMEOUT_MS);

  try {
    let res = await fetch(url, { method: "HEAD", signal: controller.signal, redirect: "follow" });

    // Some servers reject HEAD; fall back to GET
    // Деякі сервери відхиляють HEAD; використовуємо GET
    if (res.status === 405) {
      res = await fetch(url, { method: "GET", signal: controller.signal, redirect: "follow" });
    }

    const httpStatus = res.status;
    const status: LinkStatus =
      httpStatus >= 200 && httpStatus < 300
        ? "ok"
        : httpStatus >= 300 && httpStatus < 400
          ? "redirect"
          : "dead";

    return { url, status, httpStatus, checkedAt };
  } catch (err) {
    const isTimeout =
      err instanceof Error && err.name === "AbortError";
    return {
      url,
      status: isTimeout ? "timeout" : "error",
      httpStatus: null,
      checkedAt,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

// ── Dead-link store ───────────────────────────────────────────────────────────

export interface DeadLinkReport {
  /** ISO date string (YYYY-MM-DD) of the report day. / Дата звіту (YYYY-MM-DD). */
  date: string;
  deadLinks: LinkCheckResult[];
  totalChecked: number;
}

export class DeadLinkStore {
  /** Reports keyed by date string. / Звіти за датою. */
  private readonly reports = new Map<string, DeadLinkReport>();

  /**
   * Record link check results into today's daily report.
   *
   * Записує результати перевірки до щоденного звіту.
   */
  record(results: LinkCheckResult[]): void {
    const date = new Date().toISOString().slice(0, 10);
    const existing = this.reports.get(date) ?? {
      date,
      deadLinks: [],
      totalChecked: 0,
    };

    existing.totalChecked += results.length;
    existing.deadLinks.push(...results.filter((r) => r.status !== "ok"));
    this.reports.set(date, existing);
  }

  /**
   * Return the dead-link report for a given date (YYYY-MM-DD).
   *
   * Повертає звіт про мертві посилання для заданої дати.
   */
  getReport(date: string): DeadLinkReport | undefined {
    return this.reports.get(date);
  }

  /**
   * Return all reports sorted by date descending.
   *
   * Повертає всі звіти, відсортовані за датою (спадання).
   */
  listReports(): DeadLinkReport[] {
    return [...this.reports.values()].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const deadLinkStore = new DeadLinkStore();
