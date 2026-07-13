import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F5F2",
        surface: "#F2ECE3",
        card: "#E8DDCF",
        sage: "#DDE8E1",
        lavender: "#DDD9EC",
        blue: "#D8E6EC",
        accent: "#3B3B3B",
        ink: {
          DEFAULT: "#202020",
          soft: "#6B6B6B",
        },
        border: "rgba(0,0,0,0.08)",
      },
      fontFamily: {
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px",
        "3xl": "32px",
      },
      boxShadow: {
        soft: "0 6px 20px rgba(0,0,0,0.04)",
        "soft-lg": "0 12px 32px rgba(0,0,0,0.06)",
        hover: "0 10px 28px rgba(0,0,0,0.06)",
      },
      transitionTimingFunction: {
        calm: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
      transitionDuration: {
        "200": "200ms",
      },
      letterSpacing: {
        tightest: "-0.03em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
