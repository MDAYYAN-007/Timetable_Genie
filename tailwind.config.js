/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        lavender: "#d1c4e9",
        mint: "#b2dfdb",
        peach: "#ffe0b2",
        deepPurple: "#8e44ad",
        skyBlue: "#3498db",
      },
      boxShadow: {
        glow: "0 0 15px rgba(138, 43, 226, 0.5)", // Glowing hover effect
      },
      fontFamily: {
        sans: ["Poppins", "Lato", "sans-serif"],
      },
      backgroundImage: {
        auroraGradient: "linear-gradient(to right, #8e44ad, #3498db)",
      },
    },
  },
  plugins: [],
};
