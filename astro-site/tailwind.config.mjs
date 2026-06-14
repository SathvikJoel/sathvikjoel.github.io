import defaultTheme from "tailwindcss/defaultTheme"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        // Background = Astro Sphere's pitch black; accents = Maggie Appleton's palette,
        // brightened so links/marks pop against true black.
        white: "#ECEAE6",
        black: "#000000",
        // Page + surfaces. paper.dark is pure black (Astro Sphere); surfaces are subtly raised.
        paper: { light: "#F6F5F1", dark: "#000000" },
        surface: { light: "#FCFBF7", dark: "#111113" },
        ink: { light: "#353534", dark: "#C9C6C2" },
        // Secondary accent — Maggie's sea-blue, brightened for black bg.
        sage: { DEFAULT: "#3DD6ED", light: "#008BA3", dark: "#3DD6ED" },
        // Tertiary accent — her salmon.
        clay: { DEFAULT: "#FF9A8A", light: "#FD8370", dark: "#FF9A8A" },
        // Primary accent — her crimson (pink), brightened for links + card hover.
        crimson: { DEFAULT: "#FF6FB5", light: "#5F023E", dark: "#FF6FB5" },
        // Extra accents from her palette, available for use.
        seablue: { DEFAULT: "#3DD6ED", dark: "#008BA3" },
        gold: { DEFAULT: "#F0C27B" },
        salmon: { DEFAULT: "#FF9A8A" },
        purple: { DEFAULT: "#A98CE6" },
      },
      fontFamily: {
        // UI / labels / meta — exactly as Maggie Appleton uses.
        "sans": ["Lato", ...defaultTheme.fontFamily.sans],
        // Reading body — Fraunces, the same warm high-contrast serif as the headings/hero.
        "serif": ["Fraunces Variable", "Georgia", ...defaultTheme.fontFamily.serif],
        // Margin / sidenotes — warm glyphic serif.
        "note": ["Hedvig Letters Serif", "Georgia", "serif"],
        // Headings — same high-contrast soft serif as the hero (Fraunces), kept light.
        "display": ["Fraunces Variable", "Georgia", "serif"],
        // Home hero only — high-contrast soft serif.
        "hero": ["Fraunces Variable", "Georgia", "serif"],
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
