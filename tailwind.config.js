/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        copa: {
          green: '#1a6b3a',
          gold: '#c9a84c',
          blue: '#003087',
        },
      },
    },
  },
  plugins: [],
}
