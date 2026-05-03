import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sacred Earth Palette
        stone: {
          warm: "#f5f0e8",
        },
        charcoal: {
          DEFAULT: "#2c2c2c",
          light: "#3d3d3d",
          dark: "#1a1a1a",
        },
        sage: {
          DEFAULT: "#7a8c6e",
          light: "#94a686",
          dark: "#5f6d55",
          50: "#f4f6f2",
          100: "#e6eae3",
          200: "#cdd5c7",
          300: "#adb9a3",
          400: "#8a9b7d",
          500: "#7a8c6e",
          600: "#5f6d55",
          700: "#4b5644",
          800: "#3e4738",
          900: "#343b2f",
        },
        cream: {
          DEFAULT: "#faf6f0",
          dark: "#f0ebe2",
        },
        earth: {
          50: "#fdf8f0",
          100: "#f5f0e8",
          200: "#ebe3d5",
          300: "#ddd1bc",
          400: "#c9b89a",
          500: "#b5a07e",
          600: "#a08966",
          700: "#867153",
          800: "#6e5d46",
          900: "#5b4d3b",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "Georgia", "serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
