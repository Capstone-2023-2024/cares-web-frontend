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
      keyframes: {
        loading: {
          "0%, 100%": {
            transform: "translate(1rem, 1rem)",
            backgroundColor: "#767373",
          },
          "25%": {
            transform: "translate(-1rem, 1rem)",
            backgroundColor: "#28303B",
          },
          "50%": {
            transform: "translate(-1rem, -1rem)",
            backgroundColor: "#ffd866",
          },
          "75%": {
            transform: "translate(1rem, -1rem)",
            backgroundColor: "#f5f5f5",
          },
        },
        gradient: {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "400% 50%",
          },
          "100%": {
            backgroundPosition: "0% 50%",
          },
        },
      },

      animation: {
        "spin-slow": "spin 3s linear infinite",
        loading: "loading 1s ease-in-out infinite",
        "gradient-sm": "gradient 30s infinite linear forwards",
        "gradient-md": "gradient 23s infinite ease-in-out alternate",
        "gradient-lg": "gradient 15s infinite ease-in-out alternate",
      },
    },
  },
  plugins: [require("tailwindcss-animated")],
} satisfies Config;
