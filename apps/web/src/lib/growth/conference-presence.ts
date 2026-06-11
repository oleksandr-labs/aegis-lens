/**
 * Conference / OSINT Summit Presence — target conferences for team presence.
 *
 * Tracks target conferences, proposal deadlines, and attendance status
 * to coordinate speaking slots, demos, and networking.
 *
 * Конференції та OSINT-саміти: цільові події для присутності команди.
 */

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ConferenceTarget {
  /** Short identifier slug. / Slug-ідентифікатор. */
  id: string;
  /** Full conference name. / Повна назва. */
  name: string;
  /** Conference website URL. / URL сайту. */
  url: string;
  /** Typical month(s) of the conference (1–12). / Типові місяці проведення. */
  typicalMonths: number[];
  /** Location (city, country). / Місце проведення. */
  location: string;
  /** Primary audience for this conference. / Основна аудиторія. */
  audience: string;
  /** Submission / CFP deadline (ISO-8601 or null). / Дедлайн подачі заявок. */
  cfpDeadline?: string;
  /** Attendance goal. / Ціль участі. */
  goal: "speak" | "exhibit" | "attend" | "sponsor";
  /** Notes. / Нотатки. */
  notes?: string;
}

// ── Targets ───────────────────────────────────────────────────────────────────

/**
 * Five priority conferences for Aegis Lens team presence.
 *
 * П'ять пріоритетних конференцій для присутності команди Aegis Lens.
 */
export const CONFERENCE_TARGETS: readonly ConferenceTarget[] = [
  {
    id: "osint-summit",
    name: "OSINT Summit",
    url: "https://osintsummit.com",
    typicalMonths: [4],
    location: "Washington D.C., USA",
    audience: "OSINT practitioners, intelligence analysts, journalists",
    goal: "speak",
    notes:
      "Primary target. Present methodology and open-dataset release. Submit CFP 3 months prior.",
  },
  {
    id: "bellingcat",
    name: "Bellingcat Investigative Reporting Workshop",
    url: "https://www.bellingcat.com",
    typicalMonths: [6, 11],
    location: "Amsterdam, Netherlands (and online)",
    audience: "Open-source investigators, journalists, NGO researchers",
    goal: "speak",
    notes:
      "Ideal venue for methodology post live demo. Bellingcat community crossover is high-value.",
  },
  {
    id: "cyberwarcon",
    name: "CyberWarCon",
    url: "https://cyberwarcon.com",
    typicalMonths: [11],
    location: "Arlington, VA, USA",
    audience: "Threat-intel analysts, nation-state tracking researchers",
    goal: "attend",
    notes:
      "Network with threat-intel community; explore integration with cyber-actor attribution workflows.",
  },
  {
    id: "gijn",
    name: "GIJN Global Investigative Journalism Conference",
    url: "https://gijn.org",
    typicalMonths: [9, 10],
    location: "Rotates globally",
    audience: "Investigative journalists, data reporters, media organisations",
    goal: "exhibit",
    notes:
      "Demo press embed kit and journalist tier. Distribute press-kit USB drives. High citation potential.",
  },
  {
    id: "defcon",
    name: "DEF CON",
    url: "https://defcon.org",
    typicalMonths: [8],
    location: "Las Vegas, NV, USA",
    audience: "Security researchers, hackers, OSINT community (Recon Village)",
    goal: "speak",
    notes:
      "Target Recon Village track. Present geolocation bounty program and verified-contributor system.",
  },
] as const;

// ── ConferencePresenceStore ───────────────────────────────────────────────────

export class ConferencePresenceStore {
  private readonly targets = new Map<string, ConferenceTarget>(
    CONFERENCE_TARGETS.map((c) => [c.id, c]),
  );

  /**
   * Add or update a conference target.
   *
   * Додає або оновлює конференцію.
   */
  upsert(target: ConferenceTarget): void {
    this.targets.set(target.id, target);
  }

  /**
   * Get a conference by ID.
   *
   * Повертає конференцію за ID.
   */
  get(id: string): ConferenceTarget | undefined {
    return this.targets.get(id);
  }

  /**
   * List all conference targets, sorted by earliest typical month.
   *
   * Повертає всі конференції, відсортовані за місяцем.
   */
  list(): ConferenceTarget[] {
    return Array.from(this.targets.values()).sort(
      (a, b) => Math.min(...a.typicalMonths) - Math.min(...b.typicalMonths),
    );
  }

  /**
   * List conferences by goal type.
   *
   * Повертає конференції за типом цілі.
   */
  listByGoal(goal: ConferenceTarget["goal"]): ConferenceTarget[] {
    return this.list().filter((c) => c.goal === goal);
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global conference presence store. */
export const conferencePresenceStore = new ConferencePresenceStore();
