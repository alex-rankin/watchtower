import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        body: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px hsl(var(--border) / 0.6), 0 10px 30px -12px hsl(var(--foreground) / 0.25)",
      },
    },
  },
  plugins: [],
} satisfies Config;
