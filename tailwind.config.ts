import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        expoBlue: "#0B2B5E",
        expoOrange: "#F26522"
      }
    }
  },
  plugins: []
};

export default config;
