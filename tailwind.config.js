/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './shared/**/*.{js,ts,jsx,tsx}',
    './widgets/**/*.{js,ts,jsx,tsx}',
    './features/**/*.{js,ts,jsx,tsx}'
  ],
  prefix: "",
  theme: {
  },
  plugins: ["tailwindcss-animate"],
}