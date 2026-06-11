import "server-only";

export type CaseStatus = "active" | "archived" | "locked";

export interface CasePermissions {
  viewer: string[];
  editor: string[];
  admin: string[];
}

export interface Case {
  caseId: string;
  orgId: string;
  createdBy: string;
  title: string;
  description?: string;
  status: CaseStatus;
  eventIds: string[];
  aoiIds: string[];
  permissions: CasePermissions;
  createdAt: string;
  updatedAt: string;
}

export interface CaseNote {
  noteId: string;
  caseId: string;
  authorId: string;
  content: string;
  replyToEventId?: string;
  replyToNoteId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export const caseStore = new Map<string, Case>();
export const caseNoteStore = new Map<string, CaseNote[]>();

// Seed demo case
caseStore.set("case_demo_001", {
  caseId: "case_demo_001",
  orgId: "org_demo",
  createdBy: "demo",
  title: "Mariupol Steel Plant — Historical Analysis",
  description: "Documenting the siege and subsequent events at the Azovstal facility.",
  status: "active",
  eventIds: [],
  aoiIds: ["aoi_demo_001"],
  permissions: { viewer: ["*"], editor: ["demo"], admin: ["demo"] },
  createdAt: new Date(Date.now() - 86400_000 * 30).toISOString(),
  updatedAt: new Date(Date.now() - 86400_000 * 2).toISOString(),
});
