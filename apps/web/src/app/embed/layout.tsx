// Minimal embed layout — no header/footer chrome, for iframe widgets.
import "../globals.css";

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
