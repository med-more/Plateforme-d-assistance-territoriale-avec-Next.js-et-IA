/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['var(--font-cairo)', 'sans-serif'],
        amiri: ['var(--font-amiri)', 'serif'],
      },
      colors: {
        // Custom color palette - uses CSS variables for theme support
        "openai-dark": "rgb(var(--openai-dark) / <alpha-value>)",
        "openai-darker": "rgb(var(--openai-darker) / <alpha-value>)",
        "openai-gray": "rgb(var(--openai-gray) / <alpha-value>)",
        "openai-light-gray": "rgb(var(--openai-light-gray) / <alpha-value>)",
        "openai-text": "rgb(var(--openai-text) / <alpha-value>)",
        "openai-text-muted": "rgb(var(--openai-text-muted) / <alpha-value>)",
        "openai-green": "rgb(var(--openai-green) / <alpha-value>)",
        "openai-green-hover": "rgb(var(--openai-green-hover) / <alpha-value>)",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      keyframes: {
        "sadaqa-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        "lantern-glow": {
          "0%, 100%": {
            boxShadow:
              "0 0 10px #ffd700, 0 0 20px #ffd700",
          },
          "50%": {
            boxShadow:
              "0 0 20px #ffd700, 0 0 30px #ffd700, 0 0 40px #ff8c00",
          },
        },
      },
      animation: {
        "sadaqa-pulse": "sadaqa-pulse 2s ease-in-out infinite",
        "lantern-glow": "lantern-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
