/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        emerald: {
          950: '#022C20',
          900: '#044E39',
          800: '#065F46',
          700: '#047857',
          600: '#059669',
          500: '#10B981',
          100: '#D1FAE5',
          50: '#ECFDF5',
        },
        gold: {
          600: '#9A7B1C',
          500: '#B59226',
          400: '#D4AF37',
          300: '#E5C158',
          100: '#FDF8E2',
          50: '#FFFDF5',
        },
        safwa: {
          dark: '#0A111E',
          card: '#131F33',
          border: '#23334D',
          emerald: '#044E39',
          gold: '#D4AF37'
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        tajawal: ['Tajawal', 'sans-serif'],
        alexandria: ['Alexandria', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
