/**
 * Typed prompt library: versioned, immutable, locale-aware.
 *
 * Template variables: use {{variable_name}} syntax.
 * Injection defense: all user-supplied variables are escaped before interpolation.
 */

import type { PromptDefinition, PromptVersion, TemplateVars } from "./types";

/** Escape prompt-injection chars from user-controlled strings */
function sanitizeVar(value: unknown): string {
  if (typeof value === "string") {
    return value
      .replace(/\\/g, "\\\\")
      .replace(/`/g, "\\`")
      .replace(/\{\{/g, "[[")
      .replace(/\}\}/g, "]]")
      .slice(0, 4000); // hard cap to prevent token exhaustion
  }
  return String(value);
}

export function renderTemplate(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key];
    if (val === undefined || val === null) return `{{${key}}}`;
    if (typeof val === "object") return sanitizeVar(JSON.stringify(val));
    return sanitizeVar(val);
  });
}

export class PromptLibrary {
  private readonly prompts = new Map<string, PromptDefinition>();

  register(prompt: PromptDefinition): void {
    this.prompts.set(prompt.id, prompt);
  }

  getActive(id: string, locale = "en"): PromptVersion | null {
    const def = this.prompts.get(id);
    if (!def) return null;

    // Try locale-specific version first, then fall back to EN
    const localeVersion = def.versions.find(
      (v) => v.version === def.activeVersion && v.locale === locale,
    );
    return localeVersion ?? def.versions.find((v) => v.version === def.activeVersion && v.locale === "en") ?? null;
  }

  render(id: string, vars: TemplateVars, locale = "en"): { system?: string; user: string } | null {
    const version = this.getActive(id, locale);
    if (!version) return null;

    return {
      system: version.systemPrompt ? renderTemplate(version.systemPrompt, vars) : undefined,
      user: renderTemplate(version.content, vars),
    };
  }

  list(): PromptDefinition[] {
    return [...this.prompts.values()];
  }

  getById(id: string): PromptDefinition | null {
    return this.prompts.get(id) ?? null;
  }
}
