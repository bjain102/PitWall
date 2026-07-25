import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-barlow-condensed)", "var(--font-titillium-web)", "system-ui", "sans-serif"],
        f1: ["var(--font-barlow-condensed)", "sans-serif"],
        titillium: ["var(--font-titillium-web)", "sans-serif"],
        mono: ["var(--font-barlow-condensed)", "Consolas", "monospace"],
      },
      colors: {
        f1: {
          red: "#E10600",
          redGlow: "#FF1801",
          dark: "#0B0C10",
          surface: "#12141C",
          card: "#181B26",
          cardHover: "#212534",
          border: "#282C3F",
          muted: "var(--f1-muted)",
          text: "#F3F4F6",
        },
        tyre: {
          soft: "#FF3333",
          medium: "#FFC906",
          hard: "#FFFFFF",
          inter: "#39B54A",
          wet: "#0067FF",
        },
        sector: {
          purple: "#D000FF",
          green: "#00E676",
          yellow: "#FFC107",
        },
        raceFlag: {
          green: "#00E676",
          yellow: "#FFC107",
          red: "#FF2A2A",
          sc: "#FF8C00",
          vsc: "#FFA500",
        },
      },
      boxShadow: {
        "f1-red": "0 0 15px rgba(225, 6, 0, 0.4)",
        "f1-glow": "0 0 20px rgba(225, 6, 0, 0.2)",
        "card-glow": "0 4px 20px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
