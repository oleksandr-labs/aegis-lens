import type { LdBudget, LdProgram } from "./types";

export const LD_BUDGET: LdBudget = {
  annualPerFtePct: 5,
  conferenceSlots: 2,
  bookCourseStipendUsd: 1500,
  rolloverAllowed: true,
};

export const LD_PROGRAMS: LdProgram[] = [
  {
    name_en: "Internal Lecture Series",
    name_uk: "Внутрішня серія лекцій",
    cadence: "monthly",
    format: "1h live session, recorded for async",
    description_en:
      "Monthly 1-hour sessions hosted by team members sharing domain expertise, project post-mortems, or new research. Internal speakers only. Recordings archived in the knowledge base.",
    description_uk:
      "Щомісячні 1-годинні сесії, які проводять члени команди, ділячись доменними знаннями, post-mortem проектів або новими дослідженнями. Тільки внутрішні спікери. Записи архівуються в базі знань.",
  },
  {
    name_en: "External Speaker Series",
    name_uk: "Серія виступів зовнішніх спікерів",
    cadence: "quarterly",
    format: "90min live session with Q&A, optional recording",
    description_en:
      "Quarterly 90-minute sessions with invited external experts from adjacent fields: investigative journalism, ML research, geopolitical analysis, or security. Q&A portion is mandatory. Recordings shared with attendee consent.",
    description_uk:
      "Щоквартальні 90-хвилинні сесії із запрошеними зовнішніми експертами з суміжних галузей: журналістика-розслідування, ML-дослідження, геополітичний аналіз або безпека. Частина Q&A є обов'язковою. Записи поширюються за згодою учасників.",
  },
  {
    name_en: "Mentor Matching",
    name_uk: "Підбір менторів",
    cadence: "ongoing, matched per cohort twice per year",
    format: "1:1 structured sessions, 45–60min biweekly",
    description_en:
      "Bi-annual cohort matching pairs employees with internal senior practitioners or vetted external mentors. Mentees define learning goals upfront. Program coordinator tracks engagement and rotates matches annually if needed.",
    description_uk:
      "Дворічний підбір когорт пов'язує співробітників з внутрішніми старшими практиками або перевіреними зовнішніми менторами. Підопічні заздалегідь визначають цілі навчання. Координатор програми відстежує залучення та щорічно змінює підбір за потреби.",
  },
  {
    name_en: "Conference Attendance",
    name_uk: "Відвідування конференцій",
    cadence: "up to 2 per FTE per year",
    format: "in-person or virtual, technical or domain conferences",
    description_en:
      "Each FTE receives 2 conference slots per year covered by L&D budget: registration, travel, and accommodation. Selection guided by role relevance and conference quality. Post-conference knowledge-sharing session with team is expected.",
    description_uk:
      "Кожен FTE отримує 2 слоти на конференцію на рік, покритих бюджетом L&D: реєстрація, подорож та проживання. Відбір керується релевантністю ролі та якістю конференції. Очікується сесія обміну знаннями з командою після конференції.",
  },
  {
    name_en: "Book + Course Stipend",
    name_uk: "Стипендія на книги та курси",
    cadence: "self-paced, annual budget",
    format: "reimbursement or pre-approved purchase",
    description_en:
      "USD 1,500 per FTE per year for books, online courses, certifications, or workshop registrations. Self-directed — no approval needed for amounts under $200. Unused budget rolls over once (not twice). Receipts required for reimbursement.",
    description_uk:
      "1500 USD на FTE на рік для книг, онлайн-курсів, сертифікацій або реєстрацій на воркшопи. Самостійний — не потрібно схвалення для сум до 200 USD. Невикористаний бюджет переноситься один раз (не двічі). Чеки необхідні для відшкодування.",
  },
  {
    name_en: "Annual Learning Plan",
    name_uk: "Річний план навчання",
    cadence: "yearly, reviewed mid-year",
    format: "structured 1:1 with manager, written artifact",
    description_en:
      "Each FTE co-authors a written annual learning plan with their manager during Q1. Plan defines 3–5 specific learning goals tied to career level expectations, L&D budget allocation, and conference/mentor choices. Mid-year check-in reviews progress.",
    description_uk:
      "Кожен FTE спільно з менеджером складає письмовий річний план навчання протягом Q1. План визначає 3–5 конкретних цілей навчання, пов'язаних з очікуваннями кар'єрного рівня, розподілом бюджету L&D та вибором конференцій/менторів. Перевірка прогресу проводиться в середині року.",
  },
];

export const LD_POLICY_EN =
  "Smart people leave when they stop learning. L&D budget is invested, not saved. Unused budget is recoverable — not lost.";

export const LD_POLICY_UK =
  "Розумні люди йдуть, коли перестають навчатися. Бюджет L&D — це інвестиція. Невикористаний бюджет відновлюється — не втрачається.";

export const LD_REGIONAL_NOTE_EN =
  "Per-region L&D opportunities tracked separately for locale-specific conferences and local mentors.";

export const LD_REGIONAL_NOTE_UK =
  "Регіональні L&D-можливості відстежуються окремо для локальних конференцій та менторів.";
