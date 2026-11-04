/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#EAE6DF',
          stone: '#EAE6DF',
        },
        surface: {
          DEFAULT: '#F4F1EA',
          vellum: '#F4F1EA',
        },
        recessed: {
          DEFAULT: '#DDD8CE',
        },
        chassis: {
          dark: '#232220',
          charcoal: '#232220',
        },
        ink: {
          primary: '#1C1B19',
          secondary: '#5C5852',
          muted: '#8C867E',
        },
        terracotta: {
          DEFAULT: '#C85A32',
          hover: '#B54E29',
          active: '#A34321',
        },
        sage: {
          DEFAULT: '#3B6E5C',
          light: '#4C8571',
        },
        brass: {
          DEFAULT: '#B8860B',
          light: '#CF9915',
        },
        hairline: {
          DEFAULT: '#D0C9BD',
          dark: '#B8B0A2',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        beyno: ['"Beyno"', 'sans-serif'],
      },
      boxShadow: {
        'tactile': '0 2px 8px rgba(28, 27, 25, 0.08)',
        'tactile-lg': '0 8px 24px rgba(28, 27, 25, 0.12)',
        'inset-slot': 'inset 0 2px 6px rgba(28, 27, 25, 0.12)',
        'inset-subtle': 'inset 0 1px 3px rgba(28, 27, 25, 0.06)',
      },
    },
  },
  plugins: [],
}
