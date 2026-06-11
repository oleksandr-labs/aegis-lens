"use server";

/**
 * Ads & Sponsored Revenue — forbidden surface guard.
 *
 * Server-only module. Throws AdSurfaceError if an ad placement is attempted
 * on a surface that is prohibited by editorial policy.
 *
 * Серверний модуль. Викидає AdSurfaceError, якщо спроба розмістити рекламу
 * на забороненій поверхні.
 */

import { FORBIDDEN_AD_SURFACES } from "./policy";

// ── Error type ────────────────────────────────────────────────────────────────

/**
 * Thrown when an ad is requested on a forbidden surface.
 * Викидається, коли реклама запитується на забороненій поверхні.
 */
export class AdSurfaceError extends Error {
  /** The surface that was rejected. */
  readonly surface: string;

  constructor(surface: string) {
    super(
      `[ads] Surface "${surface}" is forbidden by editorial policy. ` +
      `Поверхня "${surface}" заборонена редакційною політикою.`,
    );
    this.name = "AdSurfaceError";
    this.surface = surface;
  }
}

// ── Guard function ────────────────────────────────────────────────────────────

/**
 * Assert that a given surface is not in the forbidden list.
 * Throws AdSurfaceError if the surface is forbidden.
 *
 * Перевіряє, що поверхня не в забороненому списку.
 * Викидає AdSurfaceError, якщо заборонено.
 *
 * @param surface  Surface identifier to check.
 */
export function assertAdSurfaceAllowed(surface: string): void {
  if ((FORBIDDEN_AD_SURFACES as readonly string[]).includes(surface)) {
    throw new AdSurfaceError(surface);
  }
}

// ── Editorial firewall statement ──────────────────────────────────────────────

/**
 * Editorial firewall policy statement — English.
 * The ads/sales team must never influence the analyst or intelligence team.
 */
export const AD_EDITORIAL_FIREWALL_EN =
  "Aegis Lens maintains a strict editorial firewall: the advertising and " +
  "sales team has no access to, influence over, or ability to review or " +
  "modify the work of the analyst and intelligence team. Sponsored content " +
  "is always clearly labelled and never appears adjacent to safety-critical " +
  "intelligence outputs, alerts, reports, or AI Copilot responses.";

/**
 * Editorial firewall policy statement — Ukrainian.
 * Рекламна / sales-команда не може впливати на аналітичну / розвідувальну команду.
 */
export const AD_EDITORIAL_FIREWALL_UK =
  "Aegis Lens підтримує суворий редакційний фаєрвол: рекламна та sales-команда " +
  "не має доступу до роботи аналітичної та розвідувальної команди, не може " +
  "впливати на неї чи редагувати її. Спонсорський контент завжди чітко " +
  "позначений і ніколи не розміщується поруч із критично важливими для безпеки " +
  "розвідувальними матеріалами, сповіщеннями, звітами або відповідями AI Copilot.";
