import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#f9f9f9",
          tertiary: "#f2f2f2",
          dark: "#0a0a0a",
          "dark-secondary": "#141414",
          "dark-tertiary": "#1e1e1e",
        },
        text: {
          primary: "#0a0a0a",
          secondary: "#555555",
          tertiary: "#999999",
          "dark-primary": "#f5f5f5",
          "dark-secondary": "#a0a0a0",
          "dark-tertiary": "#666666",
        },
        border: {
          DEFAULT: "#e8e8e8",
          dark: "#262626",
        },
        accent: {
          DEFAULT: "#0a0a0a",
          hover: "#333333",
          dark: "#f5f5f5",
          "dark-hover": "#d4d4d4",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      animation: {
        "fade-up": "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "scale-in": "scaleIn 0.2s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
