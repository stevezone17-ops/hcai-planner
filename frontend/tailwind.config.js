/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: "var(--surface-border)",
        input: "var(--surface-border)",
        ring: "hsl(var(--ring))",
        background: "var(--surface-base)",
        foreground: "hsl(var(--foreground))",
        sidebar: "var(--sidebar-bg)",
        header: "var(--header-bg)",
        surface: {
          base: "var(--surface-base)",
          sidebar: "var(--sidebar-bg)",
          header: "var(--header-bg)",
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
          border: "var(--surface-border)",
          hover: "var(--surface-2)",
        },
        brand: {
          primary: "#5B5CE2",
          hover: "#4F46E5",
          soft: "#EEF2FF",
          border: "#C7D2FE",
        },
        hitl: {
          ai: "#5B5CE2",
          accepted: "#047857",
          modified: "#B45309",
          rejected: "#B91C1C",
          locked: "#1D4ED8",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        elevated: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
        dropdown: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      }
    }
  },
  plugins: [],
}
