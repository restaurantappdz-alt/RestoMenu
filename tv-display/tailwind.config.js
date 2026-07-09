export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E8C84A',
          dark: '#B8962F',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
