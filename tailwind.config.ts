import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        background: "#111111",
        foreground: "#ffffff",
        card: { DEFAULT: "#18181b", foreground: "#ffffff" },
        popover: { DEFAULT: "#18181b", foreground: "#ffffff" },
        primary: { DEFAULT: "#ea580c", foreground: "#ffffff" },
        secondary: { DEFAULT: "#1f2937", foreground: "#ffffff" },
        muted: { DEFAULT: "#374151", foreground: "#d1d5db" },
        accent: { DEFAULT: "#ea580c", foreground: "#ffffff" },
        destructive: { DEFAULT: "#dc2626", foreground: "#ffffff" },
        border: "#374151",
        input: "#374151",
        ring: "#ea580c",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
