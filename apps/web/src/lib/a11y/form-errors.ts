/**
 * Form error accessibility helpers for Aegis Lens.
 *
 * WCAG 3.3.1 (Error Identification) and 3.3.3 (Error Suggestion) require
 * that form errors are:
 *   1. Associated with the field programmatically (aria-describedby)
 *   2. Announced by screen readers without user action (aria-live)
 *   3. Described in text (not only by color or icon)
 */

export interface FormError {
  /** id of the <input> / <select> / <textarea> the error belongs to. */
  fieldId: string;
  /** id of the error message element (used for aria-describedby). */
  errorId: string;
  message_en: string;
  message_uk: string;
  severity: "error" | "warning" | "info";
}

/**
 * Returns the ARIA props to spread onto the field element.
 *
 * Example:
 *   <input id="email" {...buildErrorProps(emailError)} />
 */
export function buildErrorProps(error: FormError): {
  "aria-describedby": string;
  "aria-invalid": boolean;
} {
  return {
    "aria-describedby": error.errorId,
    "aria-invalid": error.severity === "error",
  };
}

/**
 * Returns the ARIA props to spread onto the error message element.
 *
 * 'error' and 'warning' → assertive (interrupts the screen reader).
 * 'info'               → polite (waits for current announcement to finish).
 *
 * Example:
 *   <p id={error.errorId} {...buildErrorMessageProps(emailError)}>{msg}</p>
 */
export function buildErrorMessageProps(error: FormError): {
  id: string;
  role: "alert";
  "aria-live": "assertive" | "polite";
} {
  return {
    id: error.errorId,
    role: "alert",
    "aria-live": error.severity === "info" ? "polite" : "assertive",
  };
}

/**
 * Standard error message templates.
 *
 * Keys map to validation rule names used throughout the codebase.
 * Values are bilingual so the correct locale can be selected at render time.
 */
export const FORM_ERROR_TEMPLATES: Record<string, { en: string; uk: string }> = {
  required: {
    en: "This field is required.",
    uk: "Це поле є обов'язковим.",
  },
  "too-short": {
    en: "This value is too short.",
    uk: "Це значення задто коротке.",
  },
  "too-long": {
    en: "This value exceeds the maximum allowed length.",
    uk: "Це значення перевищує максимально допустиму довжину.",
  },
  "invalid-email": {
    en: "Please enter a valid email address.",
    uk: "Будь ласка, введіть дійсну електронну адресу.",
  },
  "invalid-url": {
    en: "Please enter a valid URL (include https://).",
    uk: "Будь ласка, введіть дійсну URL-адресу (включаючи https://).",
  },
  "invalid-date": {
    en: "Please enter a valid date.",
    uk: "Будь ласка, введіть дійсну дату.",
  },
  "passwords-mismatch": {
    en: "The passwords do not match.",
    uk: "Паролі не збігаються.",
  },
  "password-too-weak": {
    en: "Password must be at least 8 characters and include a number.",
    uk: "Пароль повинен містити щонайменше 8 символів та одну цифру.",
  },
  "network-error": {
    en: "A network error occurred. Please check your connection and try again.",
    uk: "Виникла мережева помилка. Перевірте з'єднання та спробуйте знову.",
  },
  "server-error": {
    en: "Something went wrong on our end. Please try again later.",
    uk: "Щось пішло не так з нашого боку. Будь ласка, спробуйте пізніше.",
  },
};
