/**
 * Keyboard navigation utilities for Aegis Lens.
 *
 * Provides:
 *   - FocusTrap class for modals / drawers / menus
 *   - Focusable element helpers
 *   - Skip-to-content implementation
 */

/** All CSS selectors that produce a natively focusable element. */
export const FOCUSABLE_SELECTORS: string[] = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "details > summary",
  "embed",
  "iframe",
  "input:not([disabled]):not([type='hidden'])",
  "object",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[contenteditable]:not([contenteditable='false'])",
  "[tabindex]:not([tabindex='-1'])",
];

/** Minimal interface so FocusTrap works server-side without a full DOM type. */
interface QueryableContainer {
  querySelectorAll: (selector: string) => ArrayLike<Element>;
}

/**
 * FocusTrap — restricts keyboard focus to a container element.
 *
 * Usage:
 *   const trap = new FocusTrap(dialogEl);
 *   trap.activate();   // on open
 *   trap.deactivate(); // on close
 */
export class FocusTrap {
  private container: QueryableContainer;
  private isActive = false;
  private boundHandler: (e: KeyboardEvent) => void;

  constructor(containerEl: QueryableContainer) {
    this.container = containerEl;
    this.boundHandler = this.handleKeyDown.bind(this);
  }

  activate(): void {
    if (this.isActive) return;
    this.isActive = true;
    if (typeof document !== "undefined") {
      document.addEventListener("keydown", this.boundHandler);
      // Move focus to the first focusable element inside the container
      const first = this.getElements()[0] as HTMLElement | undefined;
      first?.focus();
    }
  }

  deactivate(): void {
    if (!this.isActive) return;
    this.isActive = false;
    if (typeof document !== "undefined") {
      document.removeEventListener("keydown", this.boundHandler);
    }
  }

  handleKeyDown(e: KeyboardEvent): void {
    if (!this.isActive) return;

    if (e.key === "Escape") {
      this.deactivate();
      return;
    }

    if (e.key !== "Tab") return;

    const elements = this.getElements() as HTMLElement[];
    if (elements.length === 0) return;

    const first = elements[0];
    const last = elements[elements.length - 1];
    const active =
      typeof document !== "undefined" ? document.activeElement : null;

    if (e.shiftKey) {
      // Shift+Tab: if on first element, wrap to last
      if (active === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: if on last element, wrap to first
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  private getElements(): Element[] {
    return getFocusableElements(this.container as unknown as Element);
  }
}

/**
 * Return all focusable elements within a container in DOM order,
 * excluding elements that are hidden or have tabIndex === -1.
 */
export function getFocusableElements(container: Element): Element[] {
  const selector = FOCUSABLE_SELECTORS.join(", ");
  const all = Array.from(container.querySelectorAll(selector));

  return all.filter((el) => {
    const htmlEl = el as HTMLElement;
    // Exclude elements hidden via display:none / visibility:hidden
    if (typeof window !== "undefined") {
      const style = window.getComputedStyle(htmlEl);
      if (style.display === "none" || style.visibility === "hidden") return false;
    }
    // Exclude elements with explicit tabIndex -1
    if (htmlEl.tabIndex === -1) return false;
    return true;
  });
}

/**
 * Move focus to the first focusable element within a container.
 */
export function moveToFirstFocusable(container: Element): void {
  const first = getFocusableElements(container)[0] as HTMLElement | undefined;
  first?.focus();
}

/**
 * Move focus to the last focusable element within a container.
 */
export function moveToLastFocusable(container: Element): void {
  const els = getFocusableElements(container);
  const last = els[els.length - 1] as HTMLElement | undefined;
  last?.focus();
}

/**
 * Programmatically trigger skip-to-main-content behaviour.
 * Call this when the user activates the visible "Skip to content" link.
 *
 * @param mainId  id attribute of the <main> element (default: "main-content")
 */
export function skipToContent(mainId = "main-content"): void {
  if (typeof document === "undefined") return;

  const main = document.getElementById(mainId) as HTMLElement | null;
  if (!main) return;

  // Temporarily make main focusable if it is not already
  const hadTabIndex = main.hasAttribute("tabindex");
  if (!hadTabIndex) main.setAttribute("tabindex", "-1");

  main.focus({ preventScroll: false });

  // Remove the synthetic tabindex after focus moves away
  if (!hadTabIndex) {
    main.addEventListener(
      "blur",
      () => main.removeAttribute("tabindex"),
      { once: true },
    );
  }
}
