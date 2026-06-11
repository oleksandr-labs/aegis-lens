import "server-only";

export type AlertSeverity = "critical" | "high" | "medium" | "low";
export type AlertChannel = "email" | "sms" | "push" | "webhook" | "slack" | "telegram";

export interface AlertRule {
  ruleId: string;
  name: string;
  description?: string;
  filter: {
    classes?: string[];
    regions?: string[];
    minDanger?: number;
    keywords?: string[];
  };
  channels: AlertChannel[];
  severity: AlertSeverity;
  enabled: boolean;
  orgId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const alertStore = new Map<string, AlertRule>();

// Seed a demo rule
alertStore.set("rule_demo_001", {
  ruleId: "rule_demo_001",
  name: "High-danger events in Kharkiv",
  filter: { regions: ["Kharkiv"], minDanger: 70 },
  channels: ["push", "email"],
  severity: "high",
  enabled: true,
  userId: "demo",
  createdAt: new Date(Date.now() - 86400_000 * 3).toISOString(),
  updatedAt: new Date(Date.now() - 86400_000 * 3).toISOString(),
});

alertStore.set("rule_demo_002", {
  ruleId: "rule_demo_002",
  name: "Critical infrastructure strikes",
  filter: { classes: ["infrastructure"], minDanger: 80 },
  channels: ["sms", "push", "slack"],
  severity: "critical",
  enabled: true,
  userId: "demo",
  createdAt: new Date(Date.now() - 86400_000).toISOString(),
  updatedAt: new Date(Date.now() - 86400_000).toISOString(),
});
