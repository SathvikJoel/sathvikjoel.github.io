import defaultTheme from "tailwindcss/defaultTheme"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        // Maggie Appleton's exact DARK palette (her site's prefers-color-scheme: dark).
        // white = bright text/headings; black = the cream page background.
        white: "#D4D1CC",
        black: "#1C1B18",
        // Page + surfaces (her cream / light-cream / tinted-cream, dark values).
        paper: { light: "#F6F5F1", dark: "#1C1B18" },
        surface: { light: "#FCFBF7", dark: "#252420" },
        ink: { light: "#353534", dark: "#C2BFBA" },
        // Secondary accent — her sea-blue.
        sage: { DEFAULT: "#2BC4DA", light: "#008BA3", dark: "#2BC4DA" },
        // Tertiary accent — her salmon.
        clay: { DEFAULT: "#FF9A8A", light: "#FD8370", dark: "#FF9A8A" },
        // Primary accent — her crimson (pink in dark) for links + card hover.
        crimson: { DEFAULT: "#E85AAB", light: "#5F023E", dark: "#E85AAB" },
        // Extra accents from her palette, available for use.
        seablue: { DEFAULT: "#2BC4DA", dark: "#008BA3" },
        gold: { DEFAULT: "#E5B876" },
        salmon: { DEFAULT: "#FF9A8A" },
        purple: { DEFAULT: "#9B7FD9" },
      },
      fontFamily: {
        // UI / labels / meta — exactly as Maggie Appleton uses.
        "sans": ["Lato", ...defaultTheme.fontFamily.sans],
        // Reading body — warm editorial serif (free Canela Text substitute).
        "serif": ["Newsreader Variable", "Georgia", ...defaultTheme.fontFamily.serif],
        // Display / headings — high-contrast soft serif (free Canela Deck substitute).
        "display": ["Fraunces Variable", "Georgia", "serif"],
        "mono": ["JetBrains Mono Variable", "JetBrains Mono", ...defaultTheme.fontFamily.mono],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "full",
          },
        },
      },
      rotate: {
        "45": "45deg",
        "135": "135deg",
        "225": "225deg",
        "315": "315deg",
      },
      animation: {
        twinkle: "twinkle 2s ease-in-out forwards",
        meteor: "meteor 3s ease-in-out forwards",
        "fade-up": "fade-up 0.7s ease forwards",
        sway: "sway 6s ease-in-out infinite",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        sway: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        twinkle: {
          "0%": { 
            opacity: 0, 
            transform: "rotate(0deg)" 
          },
          "50%": { 
            opacity: 1,
            transform: "rotate(180deg)" 
          },
          "100%": { 
            opacity: 0, 
            transform: "rotate(360deg)" 
          },
        },
        meteor: {
          "0%": { 
            opacity: 0, 
            transform: "translateY(200%)" 
          },
          "50%": { 
            opacity: 1  
          },
          "100%": { 
            opacity: 0, 
            transform: "translateY(0)" 
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
