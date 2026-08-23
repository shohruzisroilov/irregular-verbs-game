import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0B0F19",
          card: "#131C2E",
          hover: "#1B2740",
          border: "#1E2B47",
          muted: "#94A3B8",
          text: "#F8FAFC"
        },
        brand: {
          primary: "#6366F1",
          primaryDark: "#4F46E5",
          accent: "#38BDF8",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
          purple: "#A855F7"
        }
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        heading: ["Outfit", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 25px rgba(99, 102, 241, 0.2)",
        card: "0 10px 30px rgba(0, 0, 0, 0.35)"
      }
    },
  },
  plugins: [],
};

export default config;
