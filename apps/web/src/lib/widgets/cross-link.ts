/**
 * Cross-widget linking — event bus for widget-to-widget interactions.
 * Крос-зв'язок між віджетами — шина подій для взаємодії між віджетами.
 *
 * NOTE (EN): CrossLinkBus is a client-side pub/sub; register rules on component mount.
 * NOTE (UK): CrossLinkBus — клієнтський pub/sub; реєструйте правила при монтуванні компонента.
 *
 * NOTE (EN): linkType 'filter' narrows data in target; 'highlight' marks rows; 'navigate' redirects.
 * NOTE (UK): linkType 'filter' звужує дані цілі; 'highlight' позначає рядки; 'navigate' перенаправляє.
 *
 * NOTE (EN): Unsubscribe handlers on component unmount to prevent memory leaks.
 * NOTE (UK): Скасовуйте підписки при розмонтуванні компонента для запобігання витоків пам'яті.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WidgetLinkEvent {
  sourceWidgetId: string;
  targetWidgetId: string;
  linkType: "filter" | "highlight" | "navigate";
  payload: Record<string, unknown>;
}

export interface CrossLinkRule {
  ruleId: string;
  sourceWidgetId: string;
  targetWidgetId: string;
  onEvent: "click" | "hover" | "select";
  linkType: "filter" | "highlight" | "navigate";
}

export type CrossLinkHandler = (event: WidgetLinkEvent) => void;

// ---------------------------------------------------------------------------
// CrossLinkBus
// ---------------------------------------------------------------------------

/**
 * In-memory cross-widget event bus.
 * Внутрішня шина міжвіджетних подій у пам'яті.
 */
export class CrossLinkBus {
  private readonly rules = new Map<string, CrossLinkRule>();
  private readonly subscribers = new Map<string, Set<CrossLinkHandler>>();

  /**
   * Register a cross-link rule between two widgets.
   * Реєструє правило крос-зв'язку між двома віджетами.
   */
  register(rule: CrossLinkRule): void {
    this.rules.set(rule.ruleId, rule);
  }

  /**
   * Remove a cross-link rule.
   * Видаляє правило крос-зв'язку.
   */
  unregister(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  /**
   * Emit a link event — dispatched to all subscribers of the target widget.
   * Генерує подію зв'язку — надсилається всім підписникам цільового віджета.
   */
  emit(event: WidgetLinkEvent): void {
    const handlers = this.subscribers.get(event.targetWidgetId);
    if (!handlers) return;
    for (const handler of handlers) {
      try {
        handler(event);
      } catch {
        // Isolate handler errors; do not break other subscribers
      }
    }
  }

  /**
   * Subscribe a handler for events targeting a given widget.
   * Підписує обробник для подій, адресованих заданому віджету.
   */
  subscribe(targetWidgetId: string, handler: CrossLinkHandler): void {
    const existing = this.subscribers.get(targetWidgetId) ?? new Set();
    existing.add(handler);
    this.subscribers.set(targetWidgetId, existing);
  }

  /**
   * Unsubscribe a handler for a given target widget.
   * Скасовує підписку обробника для заданого цільового віджета.
   */
  unsubscribe(targetWidgetId: string, handler: CrossLinkHandler): void {
    this.subscribers.get(targetWidgetId)?.delete(handler);
  }

  /** Get all registered rules. / Повертає всі зареєстровані правила. */
  getRules(): CrossLinkRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Convenience: trigger all rules originating from a source widget on a given event type.
   * Зручність: запускає всі правила від джерела-віджета для заданого типу події.
   */
  triggerFrom(
    sourceWidgetId: string,
    onEvent: CrossLinkRule["onEvent"],
    payload: Record<string, unknown>,
  ): void {
    for (const rule of this.rules.values()) {
      if (rule.sourceWidgetId === sourceWidgetId && rule.onEvent === onEvent) {
        this.emit({
          sourceWidgetId,
          targetWidgetId: rule.targetWidgetId,
          linkType: rule.linkType,
          payload,
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

/** Global cross-widget link bus singleton. */
export const crossLinkBus = new CrossLinkBus();
