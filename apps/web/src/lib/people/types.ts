export type Discipline =
  | "engineering"
  | "design"
  | "product"
  | "ai-ml"
  | "osint-analyst"
  | "sales"
  | "sales-management";

export type LevelId =
  | "l1"
  | "l2"
  | "l3"
  | "l4"
  | "l5"
  | "l6"
  | "l7"
  | "l8"
  | "principal"
  | "distinguished";

export interface CareerLevel {
  id: LevelId;
  title_en: string;
  title_uk: string;
  scope_en: string;
  scope_uk: string;
  impact_en: string;
  impact_uk: string;
  leadership_en: string;
  leadership_uk: string;
  craft_en: string;
  craft_uk: string;
  typicalYearsExperience: number;
}

export interface CareerLadder {
  discipline: Discipline;
  levels: CareerLevel[];
  managementSplit: boolean;
  managementTrackStart?: LevelId;
  description_en: string;
  description_uk: string;
}

export interface LdBudget {
  annualPerFtePct: number;
  conferenceSlots: number;
  bookCourseStipendUsd: number;
  rolloverAllowed: true;
}

export interface LdProgram {
  name_en: string;
  name_uk: string;
  cadence: string;
  format: string;
  description_en: string;
  description_uk: string;
}
