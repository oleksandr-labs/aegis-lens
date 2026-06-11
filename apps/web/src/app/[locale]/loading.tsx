export default function Loading() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-border-default border-t-accent" />
      <p className="mt-3 font-mono text-xs uppercase tracking-widest text-text-muted">Loading</p>
    </div>
  );
}
