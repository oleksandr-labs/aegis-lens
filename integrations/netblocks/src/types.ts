export type NetBlocksIncidentStatus = "ongoing" | "resolved" | "monitoring";
export type NetBlocksIncidentType =
  | "internet_outage"
  | "throttling"
  | "social_media_block"
  | "vpn_block"
  | "submarine_cable"
  | "bgp_anomaly";

export interface NetBlocksIncident {
  incidentId: string;
  type: NetBlocksIncidentType;
  status: NetBlocksIncidentStatus;
  country: string;         // ISO 3166-1 alpha-2
  /** Affected network or ISP names */
  affectedNetworks: string[];
  /** Estimated fraction of connectivity lost 0–1 */
  severityFraction: number;
  startedAt: string;       // ISO 8601
  resolvedAt: string | null;
  sourceUrl?: string;
  summary: string;
  summaryUk?: string;
}

export interface NetBlocksApiResponse {
  incidents: NetBlocksIncident[];
  fetchedAt: string;
}
