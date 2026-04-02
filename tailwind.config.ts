import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gcg: {
          dark: "#1a1a2e",
          darker: "#0f0f1a",
          blue: "#2563eb",
          accent: "#3b82f6",
          muted: "#6b7280",
          border: "#e5e7eb",
          success: "#22c55e",
          warning: "#f59e0b",
          danger: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
