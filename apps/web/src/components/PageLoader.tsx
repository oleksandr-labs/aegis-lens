"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function PageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(0);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;

    setLoading(true);
    setWidth(30);
    const t1 = setTimeout(() => setWidth(70), 100);
    const t2 = setTimeout(() => setWidth(90), 500);
    const t3 = setTimeout(() => {
      setWidth(100);
      setTimeout(() => setLoading(false), 200);
    }, 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  if (!loading && width === 0) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[100] h-0.5 bg-accent transition-all duration-300"
      style={{ width: `${width}%`, opacity: loading ? 1 : 0 }}
    />
  );
}
