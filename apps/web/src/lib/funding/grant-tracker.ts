/**
 * Grant tracker — deadline management and reporting calendar.
 *
 * Трекер грантів — управління дедлайнами та календар звітності.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GrantTrackerEntry {
  grantId: string;
  /** ISO date string of the application / renewal deadline */
  deadline: string;
  /** Key project milestones tied to this grant */
  milestones: string[];
  /** Name or role of the person responsible for this grant */
  responsible: string;
  /** ISO date string of the last update to this tracker entry */
  lastUpdated: string;
  /** Cadence description, e.g. "quarterly narrative + financial report" */
  reportingCadence: string;
}

// ── Tracker Entries ───────────────────────────────────────────────────────────

/**
 * Reporting cadence templates for the top 5 aligned grants.
 * Deadlines are indicative; update from funder portals before submission.
 *
 * Шаблони розкладу звітності для 5 найбільш узгоджених грантів.
 * Дедлайни є орієнтовними — оновлювати з порталів фандерів.
 */
export const GRANT_TRACKER_ENTRIES: GrantTrackerEntry[] = [
  {
    grantId: "us-state-drl",
    deadline: "2025-03-31",
    milestones: [
      "Submit letter of intent (LOI) — 60 days before full application",
      "Submit full application with budget narrative",
      "Award notification (estimated 6 months post-deadline)",
      "Month 3: launch civilian alert feature (M1 deliverable)",
      "Month 6: Q1 narrative + financial report due",
      "Month 9: Q2 report + product usage metrics",
      "Month 12: Q3 report + mid-term evaluation",
      "Month 18: Q4 report + final evaluation",
    ],
    responsible: "Founder / CEO",
    lastUpdated: "2026-06-10",
    reportingCadence:
      "Quarterly narrative report + quarterly financial report; " +
      "annual external evaluation required by funder; " +
      "ad-hoc progress updates via DRL portal.",
  },
  {
    grantId: "eu-horizon-europe-security",
    deadline: "2025-09-15",
    milestones: [
      "Identify and onboard EU consortium partner (university or NGO)",
      "Submit Expression of Interest (EoI) to consortium lead",
      "Submit full Horizon proposal (typically 70–100 pages)",
      "Award notification (estimated 9–12 months post-deadline)",
      "Month 6: Periodic Report 1 (technical + financial)",
      "Month 18: Periodic Report 2 + deliverables review",
      "Month 36: Final report + open-source repository handover",
    ],
    responsible: "Founder / CEO + EU Consortium Partner Lead",
    lastUpdated: "2026-06-10",
    reportingCadence:
      "Bi-annual periodic reports (technical + financial); " +
      "continuous deliverable tracking in EU reporting portal; " +
      "open-source code releases tied to each milestone.",
  },
  {
    grantId: "us-ned",
    deadline: "2025-06-30",
    milestones: [
      "Concept paper submission (500 words)",
      "Full proposal invitation (if concept paper accepted)",
      "Award notification (estimated 4–6 months post-deadline)",
      "Month 3: Quarterly progress report",
      "Month 6: Mid-term report + budget reforecast",
      "Month 9: Q3 progress report",
      "Month 12: Final narrative + financial closeout report",
    ],
    responsible: "Founder / CEO",
    lastUpdated: "2026-06-10",
    reportingCadence:
      "Quarterly progress reports (narrative + financial); " +
      "NED programme officer check-ins (monthly); " +
      "annual closeout report with sustainability plan.",
  },
  {
    grantId: "press-freedom-orgs",
    deadline: "2025-11-30",
    milestones: [
      "ICFJ application submission (Knight Prototype Fund or similar)",
      "Prototype demo milestone (3 months post-award)",
      "Journalist pilot cohort launch (50 users, 3 months)",
      "Mid-term report with usage and safety metrics",
      "Final report with journalism impact case studies",
    ],
    responsible: "Head of Partnerships / Founder",
    lastUpdated: "2026-06-10",
    reportingCadence:
      "Milestone-based reporting (not calendar-based); " +
      "ICFJ programme check-ins every 6 weeks; " +
      "usage metrics shared monthly; " +
      "joint press release on key milestones.",
  },
  {
    grantId: "eu-creative-europe-journalism",
    deadline: "2025-05-15",
    milestones: [
      "Submit application through IJ4EU portal",
      "Award notification (estimated 3–4 months post-deadline)",
      "Kick-off meeting with IJ4EU programme officer",
      "Month 4: First investigation published using Aegis Lens",
      "Month 8: Mid-term report + 2nd investigation output",
      "Month 12: Final report + published investigations bundle",
    ],
    responsible: "Founder + Editorial Partner",
    lastUpdated: "2026-06-10",
    reportingCadence:
      "Semi-annual reports + published output log; " +
      "IJ4EU requires editorial partner co-applicant; " +
      "all published investigations linked in final report.",
  },
];

// ── Calendar Builder ──────────────────────────────────────────────────────────

/**
 * Build a Markdown reporting calendar from tracker entries.
 * Lists application deadlines and all milestone dates in chronological order.
 *
 * Генерує Markdown-календар звітності зі списком дедлайнів.
 */
export function buildReportingCalendar(entries: GrantTrackerEntry[]): string {
  if (entries.length === 0) {
    return `# Grant Reporting Calendar\n\n> No tracker entries provided.\n`;
  }

  const lines: string[] = [
    `# Grant Reporting Calendar`,
    ``,
    `> Generated: ${new Date().toISOString().split("T")[0]}`,
    `> Entries: ${entries.length}`,
    ``,
    `---`,
    ``,
  ];

  // Sort entries by deadline ascending
  const sorted = [...entries].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
  );

  for (const entry of sorted) {
    lines.push(`## Grant: \`${entry.grantId}\``);
    lines.push(``);
    lines.push(`| Field | Value |`);
    lines.push(`|---|---|`);
    lines.push(`| **Application Deadline** | ${entry.deadline} |`);
    lines.push(`| **Responsible** | ${entry.responsible} |`);
    lines.push(`| **Reporting Cadence** | ${entry.reportingCadence} |`);
    lines.push(`| **Last Updated** | ${entry.lastUpdated} |`);
    lines.push(``);
    lines.push(`### Milestones`);
    lines.push(``);
    for (const milestone of entry.milestones) {
      lines.push(`- [ ] ${milestone}`);
    }
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  }

  return lines.join("\n");
}
