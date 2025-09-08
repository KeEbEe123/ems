/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Enable class-based dark mode
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        spinEase: {
          "0%": {
            transform: "rotate(0deg)",
          },
          "60%": {
            transform: "rotate(1080deg)",
          }, // 3 spins
          "100%": {
            transform: "rotate(1260deg)",
          }, // quarter turn finish
        },
      },
      animation: {
        // no 'forwards' so it resets when hover ends
        spinEase: "spinEase 700ms",
      },
      colors: {
        primary: "#F4A4BF", // Tight gradient
        secondary: "#A652BC", // Radial gradient
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
