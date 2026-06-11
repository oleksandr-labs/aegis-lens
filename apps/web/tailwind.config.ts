import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Tactical dark palette (working draft — see TODO/design/TODO_styles.md)
        bg: {
          base: "#0a0d12",
          elevated: "#11151c",
          surface: "#1a1f2a",
        },
        border: {
          subtle: "#222936",
          default: "#2c3445",
        },
        text: {
          primary: "#e8edf5",
          secondary: "#9ba6b8",
          muted: "#6b7585",
        },
        accent: {
          DEFAULT: "#4ea1ff",
          hover: "#6ab2ff",
        },
        danger: "#ef4444",
        warning: "#f59e0b",
        success: "#22c55e",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
