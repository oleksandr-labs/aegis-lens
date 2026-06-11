/**
 * Per-update changelog with summary text (TODO task:
 * "Per-update changelog with summary text").
 *
 * Turns a SnapshotDiff (+ optional Telegram commentary) into a human-readable, bilingual
 * (EN + UK) changelog entry. Phrasing is deliberately cautious — we report DeepState's
 * mapped changes, never assert official military fact (see disputed-policy.ts).
 */

import type { FrontlineCommentary, SnapshotDiff } from "./types";

export interface ChangelogEntry {
  date: string; // the `toDate` of the diff
  fromDate: string;
  summary: { en: string; uk: string };
  /** Bullet lines, bilingual. */
  highlights: Array<{ en: string; uk: string }>;
  netKm2: SnapshotDiff["netKm2"];
  /** Linked source commentary URLs (Telegram), if any. */
  commentaryUrls: string[];
}

const STATUS_LABEL: Record<string, { en: string; uk: string }> = {
  controlled: { en: "occupied", uk: "окуповано" },
  contested: { en: "contested", uk: "спірна зона" },
  liberated: { en: "liberated", uk: "звільнено" },
};

function fmtKm2(n: number): string {
  return `${n.toFixed(1)} km²`;
}

export function buildChangelog(
  diff: SnapshotDiff,
  commentary: FrontlineCommentary[] = [],
): ChangelogEntry {
  const highlights: Array<{ en: string; uk: string }> = [];

  for (const c of diff.changes) {
    const area = c.areaDeltaKm2 ? ` (~${fmtKm2(Math.abs(c.areaDeltaKm2))})` : "";
    const lbl = c.label?.en ?? c.label?.uk ?? c.polygonId;
    const lblUk = c.label?.uk ?? c.label?.en ?? c.polygonId;
    if (c.type === "status_changed" && c.previousStatus && c.newStatus) {
      highlights.push({
        en: `${lbl}: ${STATUS_LABEL[c.previousStatus].en} → ${STATUS_LABEL[c.newStatus].en}${area}`,
        uk: `${lblUk}: ${STATUS_LABEL[c.previousStatus].uk} → ${STATUS_LABEL[c.newStatus].uk}${area}`,
      });
    } else if (c.type === "added" && c.newStatus) {
      highlights.push({
        en: `New ${STATUS_LABEL[c.newStatus].en} area: ${lbl}${area}`,
        uk: `Нова зона (${STATUS_LABEL[c.newStatus].uk}): ${lblUk}${area}`,
      });
    } else if (c.type === "removed" && c.previousStatus) {
      highlights.push({
        en: `Area no longer marked ${STATUS_LABEL[c.previousStatus].en}: ${lbl}${area}`,
        uk: `Зону більше не позначено як ${STATUS_LABEL[c.previousStatus].uk}: ${lblUk}${area}`,
      });
    } else if (c.type === "geometry_changed") {
      const dir = (c.areaDeltaKm2 ?? 0) >= 0 ? { en: "expanded", uk: "розширено" } : { en: "shrank", uk: "зменшено" };
      highlights.push({
        en: `Boundary ${dir.en}: ${lbl}${area}`,
        uk: `Зміна меж (${dir.uk}): ${lblUk}${area}`,
      });
    }
  }

  const n = diff.netKm2;
  const summary = {
    en:
      diff.changes.length === 0
        ? `No mapped frontline changes between ${diff.fromDate} and ${diff.toDate}.`
        : `${diff.changes.length} mapped change(s) ${diff.fromDate}→${diff.toDate}: ` +
          `~${fmtKm2(n.towardUa)} toward Ukrainian control, ~${fmtKm2(n.towardRu)} toward occupation, ` +
          `~${fmtKm2(n.contested)} contested. Per DeepStateMAP; not an official military assessment.`,
    uk:
      diff.changes.length === 0
        ? `Картографованих змін лінії фронту між ${diff.fromDate} та ${diff.toDate} немає.`
        : `${diff.changes.length} змін(и) ${diff.fromDate}→${diff.toDate}: ` +
          `~${fmtKm2(n.towardUa)} на користь контролю України, ~${fmtKm2(n.towardRu)} у бік окупації, ` +
          `~${fmtKm2(n.contested)} спірних. За даними DeepStateMAP; не є офіційною військовою оцінкою.`,
  };

  return {
    date: diff.toDate,
    fromDate: diff.fromDate,
    summary,
    highlights,
    netKm2: diff.netKm2,
    commentaryUrls: commentary.map((c) => c.url),
  };
}
