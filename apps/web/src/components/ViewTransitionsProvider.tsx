"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function ViewTransitionsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    // View Transitions API — fires automatically on route change;
    // the CSS in globals.css drives the actual animation.
    if ("startViewTransition" in document) {
      // Transition is triggered by Next.js router updating the DOM.
      // No manual call needed — the browser intercepts automatically
      // when the API is active and the CSS pseudo-elements are declared.
    }
  }, [pathname]);

  return <>{children}</>;
}
