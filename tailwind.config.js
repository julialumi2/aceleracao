// As cores saem de variáveis CSS (definidas em src/index.css) pra que o
// painel interno possa ter a própria paleta — grafite quente — sem mexer
// no site público, que continua com a paleta da marca.
const cor = (nome) => `rgb(var(${nome}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: cor("--c-base"),
          soft: cor("--c-base-soft"),
        },
        surface: {
          DEFAULT: cor("--c-surface"),
          raised: cor("--c-surface-raised"),
          light: "#FFFFFF",
          "light-soft": "#F6F9F7",
        },
        line: {
          DEFAULT: cor("--c-line"),
          forte: cor("--c-line-forte"),
          light: "#444444",
        },
        emerald: {
          brand: cor("--c-brasa"),
          bright: cor("--c-brasa-forte"),
          deep: "#C97F00",
        },
        flame: {
          DEFAULT: cor("--c-chama"),
          dim: "#B92424",
        },
        ink: {
          DEFAULT: cor("--c-ink"),
          muted: cor("--c-ink-muted"),
          dim: cor("--c-ink-dim"),
          dark: "#0E1512",
          "dark-muted": "#444444",
        },
        // Estado, não decoração: pago/assinado e informação.
        ok: cor("--c-ok"),
        info: cor("--c-info"),
      },
      fontFamily: {
        display: ["Anton", "sans-serif"],
        body: ["Manrope", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
        painel: ['"Schibsted Grotesk"', "system-ui", "sans-serif"],
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
