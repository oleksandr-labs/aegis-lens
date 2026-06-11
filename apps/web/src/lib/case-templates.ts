export interface CaseTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  tags: string[];
}

export const CASE_TEMPLATES: CaseTemplate[] = [
  {
    id: "incident-dossier",
    name: "Incident Dossier",
    description: "Document and verify a specific incident",
    sections: ["Incident overview", "Timeline", "Sources", "Verification", "Conclusions"],
    tags: ["incident", "verification"],
  },
  {
    id: "entity-profile",
    name: "Entity Profile",
    description: "Build an intelligence profile on an entity (unit, organization)",
    sections: ["Entity overview", "Known activities", "Associated events", "Source network"],
    tags: ["entity", "profile"],
  },
  {
    id: "investigation",
    name: "Open Investigation",
    description: "Long-running investigation with multiple evidence streams",
    sections: ["Research question", "Evidence collected", "Analysis", "Open questions"],
    tags: ["investigation"],
  },
];
