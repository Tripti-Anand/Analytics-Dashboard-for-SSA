/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        laptop: '1600px',
        desktop: '2500px',
      },
    },
  },
  plugins: [],
};