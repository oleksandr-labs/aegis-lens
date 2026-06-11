export interface PromptVariable {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;
  description?: string;
  default?: unknown;
}

export interface PromptVersion {
  version: string;
  content: string;
  systemPrompt?: string;
  variables: PromptVariable[];
  locale: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  /** Estimated cost per call in USD */
  estimatedCostUsd?: number;
  /** p50 latency in ms from eval runs */
  p50LatencyMs?: number;
  evalScore?: number;
  evalSetId?: string;
  author: string;
  releasedAt: string;
  isDeprecated?: boolean;
  deprecationNote?: string;
}

export interface PromptDefinition {
  id: string;
  name: string;
  description: string;
  service: string;
  tags: string[];
  versions: PromptVersion[];
  activeVersion: string;
  locales: string[];
}

export type TemplateVars = Record<string, string | number | boolean | unknown[] | Record<string, unknown>>;
