import tailwindcssAnimate from 'tailwindcss-animate'

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E8C84A',
          dark: '#B8962F',
        },
        primary: {
          DEFAULT: '#D4AF37',
          foreground: '#0D0D0D',
          50: '#FFF8E1',
          100: '#FFE082',
          200: '#FFD54F',
          300: '#FFCA28',
          400: '#FFC107',
          500: '#D4AF37',
          600: '#B8962F',
          700: '#9C7E27',
          800: '#80661F',
          900: '#644E17',
        },
        slate: {
          850: '#111827',
          950: '#0D0D0D',
        },
        secondary: {
          DEFAULT: '#27272a',
          foreground: '#fafafa',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#fafafa',
        },
        muted: {
          DEFAULT: '#27272a',
          foreground: '#a1a1aa',
        },
        accent: {
          DEFAULT: '#27272a',
          foreground: '#fafafa',
        },
        popover: {
          DEFAULT: '#18181b',
          foreground: '#fafafa',
        },
        card: {
          DEFAULT: '#18181b',
          foreground: '#fafafa',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-scale': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-scale': 'fade-in-scale 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
