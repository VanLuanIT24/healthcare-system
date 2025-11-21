/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Xanh Nước Biển Theme */
        'teal': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
        },
        'ocean': {
          light: '#0891b2',
          main: '#0e7490',
          dark: '#164e63',
          cyan: '#00d9ff',
        },
        'primary': '#0891b2',
        'secondary': '#06b6d4',
        'accent': '#00d9ff',
        'light-bg': '#f0f9ff',
        'white-main': '#ffffff',
      },
      backgroundImage: {
        'gradient-teal': 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
        'gradient-light': 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)',
        'gradient-header': 'linear-gradient(90deg, #ffffff 0%, #f0f9ff 100%)',
      },
      boxShadow: {
        'teal': '0 4px 12px rgba(8, 145, 178, 0.3)',
        'teal-lg': '0 8px 24px rgba(8, 145, 178, 0.15)',
      },
    },
  },
  plugins: [],
}

