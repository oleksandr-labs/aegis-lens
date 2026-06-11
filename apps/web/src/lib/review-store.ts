import "server-only";

export type ReviewTaskType = "classify" | "geolocate" | "verify_media" | "translate" | "corroborate";
export type ReviewTaskStatus = "pending" | "in_progress" | "completed" | "skipped" | "escalated";
export type ReviewDecision = "accept" | "reject" | "edit" | "escalate" | "skip";

export interface ReviewTask {
  taskId: string;
  eventId: string;
  taskType: ReviewTaskType;
  priority: number;  // 0 (highest) to 100 (lowest)
  status: ReviewTaskStatus;
  assignedTo?: string;
  assignedAt?: string;
  slaDeadline?: string;
  context?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewDecisionRecord {
  decisionId: string;
  taskId: string;
  reviewerId: string;
  decision: ReviewDecision;
  payload?: Record<string, unknown>;
  timeSpentSec?: number;
  createdAt: string;
}

export const reviewTaskStore = new Map<string, ReviewTask>();
export const reviewDecisionStore = new Map<string, ReviewDecisionRecord[]>();

// Seed demo tasks
const now = new Date();
reviewTaskStore.set("task_demo_001", {
  taskId: "task_demo_001",
  eventId: "evt_001",
  taskType: "verify_media",
  priority: 10,
  status: "pending",
  slaDeadline: new Date(now.getTime() + 3600_000 * 4).toISOString(),
  context: {
    aiConfidence: 0.41,
    sourceUrl: "https://t.me/example/123",
    claim: "Strike on infrastructure in Kharkiv",
  },
  createdAt: new Date(now.getTime() - 1800_000).toISOString(),
  updatedAt: new Date(now.getTime() - 1800_000).toISOString(),
});

reviewTaskStore.set("task_demo_002", {
  taskId: "task_demo_002",
  eventId: "evt_002",
  taskType: "geolocate",
  priority: 25,
  status: "pending",
  slaDeadline: new Date(now.getTime() + 3600_000 * 12).toISOString(),
  context: {
    aiConfidence: 0.55,
    proposedCoords: [36.23, 49.99],
    proposal: "Kharkiv Oblast, approximate",
  },
  createdAt: new Date(now.getTime() - 3600_000).toISOString(),
  updatedAt: new Date(now.getTime() - 3600_000).toISOString(),
});

reviewTaskStore.set("task_demo_003", {
  taskId: "task_demo_003",
  eventId: "evt_003",
  taskType: "classify",
  priority: 50,
  status: "pending",
  slaDeadline: new Date(now.getTime() + 3600_000 * 24).toISOString(),
  context: {
    aiConfidence: 0.60,
    aiClass: "drone",
    alternatives: ["missile", "artillery"],
  },
  createdAt: new Date(now.getTime() - 7200_000).toISOString(),
  updatedAt: new Date(now.getTime() - 7200_000).toISOString(),
});
