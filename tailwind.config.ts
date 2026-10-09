import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F3F5F7",
        surface: "#FFFFFF",
        ink: "#15202B",
        muted: "#56636F",
        rule: "#D4DAE0",
        prep: {
          high: "#9F1D1D",
          mid: "#A15C07",
          low: "#0F6B5C",
          noprep: "#3B3FB6",
          nc: "#6B7280",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
