import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        expoBlue: "#0B2B5E",
        expoOrange: "#F26522",
        exhibitorBg: "#F7F9FC"
      },
      boxShadow: {
        exhibitor:
          "0 4px 12px rgba(0, 0, 0, 0.05)",
        exhibitorHover:
          "0 8px 24px rgba(0, 0, 0, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
