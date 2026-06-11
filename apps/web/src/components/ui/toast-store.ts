export type ToastVariant = "success" | "error" | "warning" | "info";

/**
 * Fire-and-forget helper that works outside of React.
 * ToastProvider listens for "aegis:toast" CustomEvents on window.
 */
export function showToast(
  message: string,
  variant: ToastVariant = "info",
  duration = 4000,
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("aegis:toast", { detail: { message, variant, duration } }),
  );
}
