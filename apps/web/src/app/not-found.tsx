import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-bg-base font-sans text-text-primary">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-text-muted">404</p>
          <h1 className="mt-2 text-3xl font-semibold">Not found</h1>
          <p className="mt-3 text-text-secondary">
            The page you're looking for doesn't exist or was retired.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-hover"
          >
            Back to home
          </Link>
        </div>
      </body>
    </html>
  );
}
