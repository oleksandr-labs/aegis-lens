"use client";
import { useEffect } from "react";

export function ThemeApplier() {
  useEffect(() => {
    const theme = localStorage.getItem("aegis_theme") ?? "dark";
    if (theme !== "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, []);

  return null;
}
