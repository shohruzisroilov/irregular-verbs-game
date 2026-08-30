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
      // `xs` was used throughout the components but never defined, so every
      // `xs:` utility silently did nothing (e.g. the desktop tab icons were
      // permanently hidden by `hidden xs:inline`).
      screens: {
        xs: "400px",
        // A phone in landscape is wider than `sm` but only ~375px tall, so a
        // width-only breakpoint handed it the scrolling desktop layout. The
        // document-flow layout needs room in BOTH directions.
        roomy: { raw: "(min-width: 640px) and (min-height: 640px)" },
        // Phone held sideways: vertical space is the scarce resource, so the
        // persistent chrome shrinks to leave the content something to live in.
        short: { raw: "(max-height: 500px)" },
        // Not enough height for the roomy card layout, but still portrait:
        // the three forms move from stacked rows into three columns.
        compact: { raw: "(max-height: 620px)" },
      },
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
        },
        // One colour per verb form, used identically in every mode so the
        // learner reads V1/V2/V3 by colour before reading the label.
        form: {
          v1: "#7DD3FC",
          v2: "#FBBF24",
          v3: "#C084FC"
        }
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        heading: ["Outfit", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 25px rgba(99, 102, 241, 0.2)",
        card: "0 10px 30px rgba(0, 0, 0, 0.35)"
      },
      scale: {
        "98": "0.98"
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        popIn: {
          from: { opacity: "0", transform: "scale(0.94) translateY(8px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" }
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" }
        }
      },
      animation: {
        fadeIn: "fadeIn 180ms ease-out",
        popIn: "popIn 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        shake: "shake 300ms ease-in-out"
      }
    },
  },
  plugins: [],
};

export default config;
