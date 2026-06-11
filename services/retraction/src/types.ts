export type RetractState = "retracted" | "corrected" | "disputed";

export interface RetractionRecord {
  id: string;
  eventId: string;
  state: RetractState;
  reason: string;
  /** The new accurate information, if state === "corrected" */
  correctionSummary?: { en: string; uk?: string };
  /** ID of the replacement/correction event if one was published */
  replacementEventId?: string;
  retractedBy: string;
  retractedAt: string;
  /** Linked reports/cases/exports that cited this event */
  downstreamRefs: DownstreamRef[];
  /** Whether subscriber notifications have been sent */
  notificationsSent: boolean;
  notificationsSentAt?: string;
  publiclyVisible: boolean;
}

export interface DownstreamRef {
  kind: "report" | "case" | "export" | "alert";
  refId: string;
  title?: string;
}

export interface RetractionNotification {
  retractionId: string;
  eventId: string;
  recipientId: string;
  channel: "email" | "push" | "telegram";
  state: RetractState;
  originalSummary: string;
  correctionSummary?: string;
  sentAt?: string;
}
