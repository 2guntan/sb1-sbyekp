/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dibi': {
          bg: '#f0f0f0',
          fg: '#030303',
          accent1: '#c52138',
          accent2: '#841726',
          accent3: '#440d15',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-out': 'fadeOut 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};