/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00C896',
          light: '#00E0A8',
          dark: '#00B080',
        },
      },
    },
  },
  plugins: [],
}
