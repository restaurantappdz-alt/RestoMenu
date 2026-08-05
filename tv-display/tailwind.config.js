export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../shared/layouts/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B132B',
          'navy-light': '#111C44',
          orange: '#FF5100',
          'orange-bright': '#FF7A00',
          honey: '#FFB703',
          'warm-gray': '#E2E8F0',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
