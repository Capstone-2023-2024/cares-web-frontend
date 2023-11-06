import { type Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#767373",
        secondary: "#28303B",
        accent: "#402FFF",
        charcoal: "#050505",
        paper: "#f5f5f5",
        error: "#F44646",
        success: "#46F48C",
        warning: "#E5EAA9",
        unavailable: "#AEAEAE",
      },
    },
  },
  plugins: [require("tailwindcss-animated")],
} satisfies Config;
