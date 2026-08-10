/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#070604",
          soft: "#0C0906",
        },
        surface: {
          DEFAULT: "#120D08",
          raised: "#1B140C",
          light: "#FFFFFF",
          "light-soft": "#F6F9F7",
        },
        line: {
          DEFAULT: "#444444",
          light: "#444444",
        },
        emerald: {
          brand: "#F5A513",
          bright: "#FFC24D",
          deep: "#C97F00",
        },
        flame: {
          DEFAULT: "#FF3131",
          dim: "#B92424",
        },
        ink: {
          DEFAULT: "#FFFFFF",
          muted: "#B8B8B8",
          dim: "#7A7A7A",
          dark: "#0E1512",
          "dark-muted": "#444444",
        },
      },
      fontFamily: {
        display: ["Anton", "sans-serif"],
        body: ["Baloo 2", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      backgroundImage: {
        "ring-glow":
          "radial-gradient(circle at center, rgba(245,165,19,0.16) 0%, rgba(245,165,19,0.03) 40%, transparent 70%)",
        "ember-glow":
          "radial-gradient(circle at 80% 15%, rgba(255,49,49,0.20) 0%, rgba(245,165,19,0.12) 35%, transparent 65%)",
      },
      keyframes: {
        "ring-pulse": {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.03)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        spark: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "0.6" },
          "100%": { transform: "translateY(-140px) scale(0.4)", opacity: "0" },
        },
      },
      animation: {
        "ring-pulse": "ring-pulse 6s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        spark: "spark linear infinite",
      },
    },
  },
  plugins: [],
};
