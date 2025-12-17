/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/frontend/src/**/*.{html,ts}",
    "./libs/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#14A800',
          light: '#B5DEB1',
          dark: '#108A00',
        },
        secondary: '#73BB44',
        accent: '#0A66C2',
        surface: '#FFFFFF',
        background: '#F8F9FA',
        muted: '#B5DEB1',
        text: {
          primary: '#1D1D1F',
          secondary: '#6E6E73',
          tertiary: '#AEAEB2',
        },
        success: '#14A800',
        info: '#0A66C2',
        warning: '#FF9500',
        error: '#FF3B30',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'full': '999px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.12)',
        'md': '0 3px 8px rgba(0, 0, 0, 0.15)',
        'lg': '0 10px 24px rgba(0, 0, 0, 0.18)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.2, 0, 0, 1)',
        'enter': 'cubic-bezier(0, 0, 0.2, 1)',
        'exit': 'cubic-bezier(0.4, 0, 1, 1)',
      },
    },
  },
  plugins: [],
}

