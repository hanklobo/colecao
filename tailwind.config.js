/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        copa: {
          green: '#065f46',
          gold: '#d97706',
          blue: '#003087',
        },
      },
    },
  },
  plugins: [],
}
