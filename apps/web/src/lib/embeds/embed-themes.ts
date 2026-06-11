/**
 * Embed Themes — CSS custom-property palettes for all theme variants.
 *
 * Defines four themes: light, dark, tactical (military greens),
 * and neutral (desaturated). Each theme maps CSS variable names to values.
 *
 * Чотири теми: світла, темна, тактична (зелена), нейтральна (знебарвлена).
 */

// ── Theme enum ────────────────────────────────────────────────────────────────

/**
 * Available embed theme identifiers.
 *
 * Доступні теми embed-ів.
 */
export enum EmbedTheme {
  Light = 'light',
  Dark = 'dark',
  Tactical = 'tactical',
  Neutral = 'neutral',
}

// ── CSS variable maps ─────────────────────────────────────────────────────────

/**
 * Per-theme CSS custom-property definitions.
 * Keys are CSS variable names (without --); values are CSS colour values.
 *
 * Карта CSS-змінних для кожної теми.
 */
export const EMBED_THEME_CSS_VARS: Record<EmbedTheme, Record<string, string>> = {
  [EmbedTheme.Light]: {
    'embed-bg':           '#ffffff',
    'embed-surface':      '#f4f5f7',
    'embed-border':       '#e2e4e9',
    'embed-text':         '#111827',
    'embed-text-muted':   '#6b7280',
    'embed-accent':       '#2563eb',
    'embed-accent-hover': '#1d4ed8',
    'embed-danger':       '#dc2626',
    'embed-warning':      '#d97706',
    'embed-success':      '#16a34a',
    'embed-overlay':      'rgba(0,0,0,0.08)',
    'embed-shadow':       '0 1px 4px rgba(0,0,0,0.12)',
  },

  [EmbedTheme.Dark]: {
    'embed-bg':           '#0f1117',
    'embed-surface':      '#1a1d27',
    'embed-border':       '#2d3148',
    'embed-text':         '#e8eaf0',
    'embed-text-muted':   '#8890a4',
    'embed-accent':       '#3b82f6',
    'embed-accent-hover': '#60a5fa',
    'embed-danger':       '#f87171',
    'embed-warning':      '#fbbf24',
    'embed-success':      '#4ade80',
    'embed-overlay':      'rgba(255,255,255,0.06)',
    'embed-shadow':       '0 1px 6px rgba(0,0,0,0.5)',
  },

  // Military / OSINT aesthetic — desaturated greens + amber.
  // Тактична тема — зелена гамма + жовтогарячий.
  [EmbedTheme.Tactical]: {
    'embed-bg':           '#0d1a0d',
    'embed-surface':      '#172617',
    'embed-border':       '#2a402a',
    'embed-text':         '#c8d8c0',
    'embed-text-muted':   '#6b8060',
    'embed-accent':       '#7ec850',
    'embed-accent-hover': '#a3e075',
    'embed-danger':       '#e05c30',
    'embed-warning':      '#d4a017',
    'embed-success':      '#5cb85c',
    'embed-overlay':      'rgba(120,200,80,0.08)',
    'embed-shadow':       '0 1px 6px rgba(0,0,0,0.6)',
  },

  // Desaturated / wire-service neutral.
  // Нейтральна тема — знебарвлена, підходить для преси.
  [EmbedTheme.Neutral]: {
    'embed-bg':           '#f9f9f9',
    'embed-surface':      '#efefef',
    'embed-border':       '#d0d0d0',
    'embed-text':         '#1a1a1a',
    'embed-text-muted':   '#5a5a5a',
    'embed-accent':       '#444444',
    'embed-accent-hover': '#222222',
    'embed-danger':       '#b00000',
    'embed-warning':      '#9a6700',
    'embed-success':      '#1a6600',
    'embed-overlay':      'rgba(0,0,0,0.06)',
    'embed-shadow':       '0 1px 3px rgba(0,0,0,0.10)',
  },
};

// ── Accessor ──────────────────────────────────────────────────────────────────

/**
 * Retrieve the CSS variable map for a given theme.
 * Falls back to dark theme if the value is not recognised.
 *
 * Повертає карту CSS-змінних для заданої теми.
 */
export function getThemeCssVars(theme: EmbedTheme | string): Record<string, string> {
  return EMBED_THEME_CSS_VARS[theme as EmbedTheme] ?? EMBED_THEME_CSS_VARS[EmbedTheme.Dark];
}

// ── CSS block generator ───────────────────────────────────────────────────────

/**
 * Render a <style> block with the theme's CSS variables scoped to a selector.
 *
 * Генерує блок <style> з CSS-змінними теми для заданого селектора.
 */
export function buildThemeStyleBlock(theme: EmbedTheme | string, selector = ':root'): string {
  const vars = getThemeCssVars(theme);
  const declarations = Object.entries(vars)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join('\n');
  return `<style>\n${selector} {\n${declarations}\n}\n</style>`;
}
