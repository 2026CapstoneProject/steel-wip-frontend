/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0053db",
        "primary-dim": "#0048c1",
        surface: "#f7f9fb",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f0f4f7",
        "surface-container-high": "#e1e9ee",
        "surface-container-highest": "#d9e4ea",
        "on-surface": "#2a3439",
        "on-surface-variant": "#566166",
        "secondary-container": "#d3e4fe",
        "on-secondary-container": "#435368",
        "primary-container": "#dbe1ff",
        "on-primary-container": "#0048bf",
        "outline-variant": "#a9b4b9",
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
