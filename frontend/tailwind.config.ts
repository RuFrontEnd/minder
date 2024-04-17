import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: { 500: "#233C53", hover: "#092C4C" },
        secondary: { 500: "#DF914C" },
        info: { 500: "#00BFFF" },
        success: { 500: "#27AE60" },
        warning: { 500: "#E2B93B" },
        error: {
          500: "#EB5757",
          secondary: "#EBB5B5",
        },
        black: {
          1: "#000000",
          2: "#1D1D1D",
          3: "#282828",
        },
        white: { 500: "#FFFFFF" },
        grey: {
          1: "#333333",
          2: "#4F4F4F",
          3: "#828282",
          4: "#BDBDBD",
          5: "#E0E0E0",
        },
        shpe: {
          t: "#fdf8f6",
          te: "#fdf8f6",
          p: "#fdf8f6",
          d: "#fdf8f6",
          dec: "#fdf8f6",
        },
      },
      // fontSize: {
      //   h1: '0.8rem',
      //   h2: '1rem',
      //   h3:
      //   h4:
      //   h5:
      //   h6
      //   l:,
      //   m:
      //   n:
      //   s:
      // }
    },
  },
  plugins: [],
};
export default config;
