/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        copa: {
          // Refined World Cup 2026 palette
          green: '#0f9d58',
          gold: '#f4b400',
          'gold-deep': '#d97706',
          blue: '#1a73e8',
          navy: '#0b2e6b',
          ink: '#111827',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(17,24,39,0.08), 0 1px 2px rgba(17,24,39,0.04)',
        'card-lg': '0 4px 16px rgba(17,24,39,0.10)',
      },
      keyframes: {
        'bounce-in': {
          '0%': { transform: 'translateY(-12px) scale(0.96)', opacity: '0' },
          '60%': { transform: 'translateY(2px) scale(1.01)', opacity: '1' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-7px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'bounce-in': 'bounce-in 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'slide-down': 'slide-down 0.22s ease-out',
        'fade-in': 'fade-in 0.5s ease-out both',
        float: 'float 3.5s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
}
