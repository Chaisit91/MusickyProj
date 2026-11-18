/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx.ts.tsx}", "./components/**/*.{js.jsx.ts.tsx}", "./src/app/**/*.{js,ts,tsx}",
    "./src/screens/**/*.{js,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}

