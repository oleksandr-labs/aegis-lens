export type RiskLevel = "extreme" | "high" | "medium" | "low" | "minimal";

export interface RiskScore {
  /** 0–100, higher = more dangerous */
  score: number;
  level: RiskLevel;
  confidence: number;
  caveats: string[];
}

export interface RiskDimension {
  name: string;
  score: number;
  weight: number;
  /** Evidence items that contributed to this score */
  signals: string[];
}

export interface CityRiskIndex {
  cityId: string;
  cityName: string;
  cityNameUk?: string;
  countryCode: string;
  lat: number;
  lon: number;
  composite: RiskScore;
  dimensions: {
    militaryActivity: RiskDimension;
    infrastructure: RiskDimension;
    civilUnrest: RiskDimension;
    weather: RiskDimension;
    accessibility: RiskDimension;
  };
  advisoryText: { en: string; uk?: string };
  updatedAt: string;
}

export interface RouteSegment {
  from: { name: string; lat: number; lon: number };
  to: { name: string; lat: number; lon: number };
  distanceKm: number;
  risk: RiskScore;
  highRiskAreas: { name: string; lat: number; lon: number; radiusKm: number }[];
}

export interface RouteRisk {
  origin: { name: string; lat: number; lon: number };
  destination: { name: string; lat: number; lon: number };
  segments: RouteSegment[];
  overallRisk: RiskScore;
  estimatedDurationHours: number;
  recommendations: string[];
  generatedAt: string;
}

export interface RiskSignal {
  sourceId: string;
  lat: number;
  lon: number;
  severity: number;
  class: string;
  occurredAt: string;
  radiusKm: number;
}
