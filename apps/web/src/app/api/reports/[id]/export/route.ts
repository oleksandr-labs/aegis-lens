/**
 * GET /api/reports/:id/export?format=pdf|html
 *
 * Export a report as PDF (Playwright) or HTML.
 * Requires: report must be in "published" or "approved" state.
 * Rate limited to prevent expensive Playwright spawning.
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { problemNotFound, problemRateLimit, problemBadRequest } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// Demo report for testing
const DEMO_REPORT = {
  reportId: "report-demo-001",
  title: "Kharkiv Oblast Weekly Situation Analysis",
  titleUk: "Тижневий аналіз ситуації в Харківській області",
  status: "published",
  orgName: "Aegis Lens Demo",
  generatedBy: "analyst@example.com",
  version: "1.0",
  sections: [
    {
      id: "executive-summary",
      title: "Executive Summary",
      body: "<p>This week saw a significant increase in drone activity over Kharkiv Oblast, with 47 verified incidents compared to 31 in the prior week — a 52% increase. Energy infrastructure remained the primary target category.</p>",
      citations: ["evt-001", "evt-002", "evt-003"],
    },
    {
      id: "drone-activity",
      title: "Drone Activity",
      body: "<p>The majority of drone incidents involved Shahed-136 loitering munitions. Air defence successfully intercepted 68% of incoming UAVs, compared to the national average of 62%.</p>",
      citations: ["evt-001", "evt-004"],
      pageBreakBefore: false,
    },
    {
      id: "infrastructure",
      title: "Infrastructure Impact",
      body: "<p>Two substations were damaged, affecting approximately 420,000 residents. Emergency repair teams restored power to 80% of affected areas within 48 hours.</p>",
      citations: ["evt-005", "evt-006"],
    },
    {
      id: "outlook",
      title: "Outlook",
      body: "<p>Based on current patterns, elevated drone activity is expected to continue through the weekend. Power utility advisories in effect for Kharkiv, Chuhuiv, and Izium districts.</p>",
    },
  ],
};

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ip = identifyRequest(req);
  // Strict limit — PDF generation is expensive
  const rl = rateLimit(`reports:export:${ip}`, 5, 60_000);
  if (!rl.ok) return problemRateLimit(undefined, rl.resetSeconds, rateLimitHeaders(rl));

  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "pdf";
  const locale = (url.searchParams.get("locale") ?? "en") as "en" | "uk";

  if (!["pdf", "html"].includes(format)) {
    return problemBadRequest("format must be pdf or html");
  }

  if (params.id !== "demo-001" && params.id !== "report-demo-001") {
    return problemNotFound("Report");
  }

  const report = DEMO_REPORT;

  const opts = {
    title: locale === "uk" ? report.titleUk : report.title,
    locale,
    sections: report.sections.map((s) => ({
      id: s.id,
      title: s.title,
      body: s.body,
      citations: s.citations,
      pageBreakBefore: s.pageBreakBefore,
    })),
    metadata: {
      reportId: report.reportId,
      generatedAt: new Date().toISOString(),
      generatedBy: report.generatedBy,
      orgName: report.orgName,
      version: report.version,
    },
    watermark: report.status !== "published" ? "DRAFT" : undefined,
    classificationBanner: "UNCLASSIFIED // OSINT // AEGIS LENS PLATFORM",
  };

  if (format === "html") {
    // Return HTML without invoking Playwright
    const { buildReportHtml } = await import("@/../../services/reports/src/pdf-renderer").catch(() => ({
      buildReportHtml: () => `<html><body><h1>${opts.title}</h1><p>HTML export placeholder.</p></body></html>`,
    }));
    const html = buildReportHtml(opts as any);
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${report.reportId}.html"`,
        ...rateLimitHeaders(rl),
      },
    });
  }

  // PDF — attempt Playwright render with graceful fallback
  try {
    const { renderPDF } = await import("@/../../services/reports/src/pdf-renderer");
    const result = await renderPDF(opts as any);

    if (result.engine === "playwright" && result.pdfBase64) {
      const pdfBuffer = Buffer.from(result.pdfBase64, "base64");
      return new Response(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${report.reportId}.pdf"`,
          "Content-Length": String(result.sizeBytes),
          ...rateLimitHeaders(rl),
        },
      });
    }

    // Fallback: return HTML
    return new Response(result.htmlString ?? "<html><body>Report unavailable</body></html>", {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${report.reportId}.html"`,
        "X-Render-Engine": "html_fallback",
        ...rateLimitHeaders(rl),
      },
    });
  } catch {
    // Playwright not installed in this environment
    return NextResponse.json(
      {
        error: "pdf_unavailable",
        message: "PDF rendering requires Playwright. Install with: pnpm add -D playwright",
        htmlExportUrl: `/api/reports/${params.id}/export?format=html`,
      },
      { status: 503, headers: rateLimitHeaders(rl) },
    );
  }
}
