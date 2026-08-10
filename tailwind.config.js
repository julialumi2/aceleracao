/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#0A0F0D",
          soft: "#0F1512",
        },
        surface: {
          DEFAULT: "#121A16",
          raised: "#161F1A",
          light: "#FFFFFF",
          "light-soft": "#F6F9F7",
        },
        line: {
          DEFAULT: "#444444",
          light: "#444444",
        },
        emerald: {
          brand: "#FF9F00",
          bright: "#FFB74D",
          deep: "#CC7F00",
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
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      backgroundImage: {
        "ring-glow":
          "radial-gradient(circle at center, rgba(255,159,0,0.16) 0%, rgba(255,159,0,0.03) 40%, transparent 70%)",
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
      },
      animation: {
        "ring-pulse": "ring-pulse 6s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
