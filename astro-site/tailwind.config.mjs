import defaultTheme from "tailwindcss/defaultTheme"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        // Warm "paper / ink" remap so the whole template warms at once.
        // white = light paper background & dark text; black = light text & dark soil background.
        white: "#FBF7EF",
        black: "#1A1712",
        // Explicit garden tokens for new components.
        paper: { light: "#FBF7EF", dark: "#15130E" },
        surface: { light: "#F2EADB", dark: "#211D16" },
        ink: { light: "#2A2620", dark: "#ECE4D6" },
        // Botanical accent (Essays / primary voice).
        sage: { DEFAULT: "#4E6B4F", light: "#4E6B4F", dark: "#9CBE97" },
        // Clay accent (Notes / personal voice).
        clay: { DEFAULT: "#B06A43", light: "#B06A43", dark: "#D69A6F" },
      },
      fontFamily: {
        // Body + UI: warm literary serif.
        "sans": ["Newsreader Variable", "Newsreader", "Georgia", ...defaultTheme.fontFamily.serif],
        "serif": ["Newsreader Variable", "Newsreader", "Georgia", ...defaultTheme.fontFamily.serif],
        // Display / headings: expressive old-style serif.
        "display": ["Fraunces Variable", "Fraunces", "Georgia", "serif"],
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
