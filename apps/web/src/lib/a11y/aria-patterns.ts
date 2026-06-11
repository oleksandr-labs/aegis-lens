/**
 * ARIA pattern builders for Aegis Lens.
 *
 * Each builder returns a plain object of ARIA attributes that can be spread
 * onto the appropriate React element:  <div {...buildAriaMenuProps(config)} />
 *
 * Pattern references:
 *   https://www.w3.org/WAI/ARIA/apg/patterns/
 */

// ─── Menu / Navigation ────────────────────────────────────────────────────────

export interface AriaMenuConfig {
  labelledById?: string;
  label?: string;
  isOpen: boolean;
  orientation?: "horizontal" | "vertical";
}

export function buildAriaMenuProps(config: AriaMenuConfig): Record<string, unknown> {
  return {
    role: "menu",
    "aria-orientation": config.orientation ?? "vertical",
    "aria-expanded": config.isOpen,
    ...(config.labelledById
      ? { "aria-labelledby": config.labelledById }
      : config.label
        ? { "aria-label": config.label }
        : {}),
  };
}

/** Props for an individual menu item within an AriaMenu. */
export function buildAriaMenuItemProps(options: {
  disabled?: boolean;
  checked?: boolean;
  hasSubmenu?: boolean;
}): Record<string, unknown> {
  return {
    role: options.checked !== undefined ? "menuitemcheckbox" : "menuitem",
    "aria-disabled": options.disabled ?? false,
    ...(options.checked !== undefined ? { "aria-checked": options.checked } : {}),
    ...(options.hasSubmenu ? { "aria-haspopup": true, "aria-expanded": false } : {}),
  };
}

// ─── Dialog / Modal ───────────────────────────────────────────────────────────

export interface AriaDialogConfig {
  titleId: string;
  descriptionId?: string;
  isModal?: boolean;
}

export function buildAriaDialogProps(config: AriaDialogConfig): Record<string, unknown> {
  return {
    role: "dialog",
    "aria-modal": config.isModal ?? true,
    "aria-labelledby": config.titleId,
    ...(config.descriptionId ? { "aria-describedby": config.descriptionId } : {}),
  };
}

// ─── Combobox (autocomplete / search) ─────────────────────────────────────────

export interface AriaComboboxConfig {
  inputId: string;
  listboxId: string;
  activeOptionId?: string;
  isOpen: boolean;
  autocomplete?: "none" | "list" | "inline" | "both";
}

export function buildAriaComboboxProps(config: AriaComboboxConfig): {
  input: Record<string, unknown>;
  listbox: Record<string, unknown>;
} {
  return {
    input: {
      role: "combobox",
      "aria-autocomplete": config.autocomplete ?? "list",
      "aria-expanded": config.isOpen,
      "aria-controls": config.listboxId,
      "aria-haspopup": "listbox",
      ...(config.activeOptionId ? { "aria-activedescendant": config.activeOptionId } : {}),
    },
    listbox: {
      role: "listbox",
      id: config.listboxId,
    },
  };
}

/** Props for a single option within an AriaCombobox listbox. */
export function buildAriaComboboxOptionProps(options: {
  id: string;
  selected?: boolean;
}): Record<string, unknown> {
  return {
    role: "option",
    id: options.id,
    "aria-selected": options.selected ?? false,
  };
}

// ─── Listbox ──────────────────────────────────────────────────────────────────

export interface AriaListboxConfig {
  labelledById?: string;
  label?: string;
  multiselect?: boolean;
  activeOptionId?: string;
  orientation?: "horizontal" | "vertical";
}

export function buildAriaListboxProps(config: AriaListboxConfig): Record<string, unknown> {
  return {
    role: "listbox",
    "aria-multiselectable": config.multiselect ?? false,
    "aria-orientation": config.orientation ?? "vertical",
    ...(config.labelledById
      ? { "aria-labelledby": config.labelledById }
      : config.label
        ? { "aria-label": config.label }
        : {}),
    ...(config.activeOptionId
      ? { "aria-activedescendant": config.activeOptionId }
      : {}),
  };
}

/** Props for a single option within an AriaListbox. */
export function buildAriaListboxOptionProps(options: {
  id: string;
  selected?: boolean;
  disabled?: boolean;
}): Record<string, unknown> {
  return {
    role: "option",
    id: options.id,
    "aria-selected": options.selected ?? false,
    "aria-disabled": options.disabled ?? false,
  };
}
