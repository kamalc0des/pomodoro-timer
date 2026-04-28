module.exports = {
  content: ["./src/**/*.{html,js,ts}", "./public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        accentFg: "rgb(var(--accent-fg) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
      },
      fontFamily: {
        hero: ['"Shippori Mincho"', 'serif'],
        display: ['"Clash Display"', 'system-ui', 'sans-serif'],
        sans: ['"Satoshi"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
