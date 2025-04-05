/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    darkMode: 'class',
    theme: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      extend: {
        colors: {
          primary: {
            DEFAULT: '#1e40af', // A rich blue color
            light: '#3b82f6',
            dark: '#1e3a8a',
          },
          secondary: '#5f6368',
          accent: '#ea4335',
          // Dark mode specific colors
          dark: {
            bg: {
              primary: '#121212',
              secondary: '#1e1e1e',
              tertiary: '#2d2d2d'
            },
            text: {
              primary: '#ffffff',
              secondary: '#e0e0e0',
              tertiary: '#b0b0b0'
            }
          }
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
        spacing: {
          '128': '32rem',
        },
        backgroundColor: theme => ({
          ...theme('colors'),
        }),
        textColor: theme => ({
          ...theme('colors'),
        }),
      },
    },
    plugins: [],
  };
  