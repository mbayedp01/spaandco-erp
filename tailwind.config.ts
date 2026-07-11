import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        serif: ['Playfair Display', ...defaultTheme.fontFamily.serif],
      },
      colors: {
        primary: {
          50:  'rgb(var(--p-50)  / <alpha-value>)',
          100: 'rgb(var(--p-100) / <alpha-value>)',
          200: 'rgb(var(--p-200) / <alpha-value>)',
          300: 'rgb(var(--p-300) / <alpha-value>)',
          400: 'rgb(var(--p-400) / <alpha-value>)',
          500: 'rgb(var(--p-500) / <alpha-value>)',
          600: 'rgb(var(--p-600) / <alpha-value>)',
          700: 'rgb(var(--p-700) / <alpha-value>)',
          800: 'rgb(var(--p-800) / <alpha-value>)',
          900: 'rgb(var(--p-900) / <alpha-value>)',
        },
        sidebar: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
        },
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FCD34D',
        },
      },
      borderRadius: {
        xs: '4px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}

export default config
