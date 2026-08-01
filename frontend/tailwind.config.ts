import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        f1: ["var(--font-anton)", "sans-serif"],
        titillium: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "Consolas", "monospace"],
      },
      colors: {
        f1: {
          red: "#FF3D1A",
          redGlow: "#FF6A44",
          dark: "#0A0908",
          surface: "#0F0D0B",
          card: "#141210",
          cardHover: "#1C1712",
          border: "#241F19",
          borderLight: "#2A2620",
          dim: "#3A342C",
          subtle: "#6B6459",
          muted: "var(--f1-muted)",
          secondary: "#B5AFA2",
          text: "#F5F1EA",
        },
        tyre: {
          soft: "#FF4D4D",
          medium: "#FFC94D",
          hard: "#EDEDED",
          inter: "#4DDB8A",
          wet: "#4DA6FF",
        },
        sector: {
          purple: "#B24DFF",
          green: "#4DDB8A",
          yellow: "#FFD24D",
        },
        raceFlag: {
          green: "#4DDB8A",
          yellow: "#FFD24D",
          red: "#FF3D1A",
          sc: "#FF8A1E",
          vsc: "#FFC94D",
        },
      },
      boxShadow: {
        "f1-red": "0 0 15px rgba(255, 61, 26, 0.35)",
        "f1-glow": "0 0 20px rgba(255, 61, 26, 0.18)",
        "card-glow": "0 4px 20px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
