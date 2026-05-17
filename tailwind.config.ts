import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        ink: {
          DEFAULT: "var(--ink)",
          light: "var(--ink-light)",
          lighter: "var(--ink-lighter)",
        },
        cobalt: {
          DEFAULT: "var(--cobalt)",
          light: "var(--cobalt-light)",
        },
        amber: {
          DEFAULT: "var(--amber)",
          light: "var(--amber-light)",
        },
        red: {
          DEFAULT: "var(--red)",
          light: "var(--red-light)",
        },
        green: {
          DEFAULT: "var(--green)",
          light: "var(--green-light)",
        },
        line: "var(--line)",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "var(--shadow)",
        lg: "var(--shadow-lg)",
      },
      spacing: {
        "8": "8px",
        "16": "16px",
        "24": "24px",
        "32": "32px",
      },
    },
  },
  plugins: [],
};

export default config;
