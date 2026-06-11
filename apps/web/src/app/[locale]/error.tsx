"use client";

import { useEffect } from "react";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[locale-error]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-text-muted">500</p>
      <h1 className="mt-2 text-3xl font-semibold text-text-primary">Something broke</h1>
      <p className="mt-3 text-text-secondary">
        We've logged the issue. Try again in a moment.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-text-muted">ref: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="mt-6 rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-hover"
      >
        Try again
      </button>
    </div>
  );
}
