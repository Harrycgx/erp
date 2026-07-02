/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0F172A",
        surface: "#111827",
        primary: "#2563EB",
        border: "#1F2937",
        textMain: "#F8FAFC",
        textSub: "#94A3B8",
      },
    },
  },
  plugins: [],
};