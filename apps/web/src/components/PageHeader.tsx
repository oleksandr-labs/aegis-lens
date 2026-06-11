export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="border-b border-border-subtle">
      <div className="mx-auto max-w-5xl px-4 py-12">
        {eyebrow && (
          <p className="font-mono text-xs uppercase tracking-widest text-accent">{eyebrow}</p>
        )}
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-pretty text-text-secondary">{description}</p>
        )}
      </div>
    </header>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-text-primary [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-text-primary [&_p]:mt-3 [&_p]:text-text-secondary [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-text-secondary [&_li]:mt-1 [&_a]:text-accent [&_a]:underline-offset-2 hover:[&_a]:underline">
      {children}
    </div>
  );
}
