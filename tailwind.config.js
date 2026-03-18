/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#10B981",
        danger: "#EF4444",
        warning: "#F59E0B",
      },
      spacing: {
        safe: "max(1rem, env(safe-area-inset-bottom, 1rem))",
      },
    },
  },
  plugins: [],
}
