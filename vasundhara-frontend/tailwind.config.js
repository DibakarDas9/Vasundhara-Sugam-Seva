/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Soothing modern palette: muted teal and soft indigo
        primary: {
          50: '#f5fbfb',
          100: '#eef8f7',
          200: '#d9f0ef',
          300: '#bfe6e0',
          400: '#9bd6cc',
          500: '#72c4b3',
          600: '#4aa995',
          700: '#2e8b76',
          800: '#146859',
          900: '#0b4a42',
        },
        accent: {
          50: '#fbf7ff',
          100: '#f6eefb',
          200: '#ecd9f5',
          300: '#dfbff0',
          400: '#d29de8',
          500: '#c06be9',
          600: '#a34bd0',
          700: '#7e38a6',
          800: '#5f2c81',
          900: '#44205d',
        },
        neutral: {
          50: '#fbfbfd',
          100: '#f7f7fb',
          200: '#eef0f6',
          300: '#e6e9f1',
          400: '#d6dbe8',
          500: '#bfc6db',
          600: '#98a1b7',
          700: '#6f7a94',
          800: '#4d5666',
          900: '#2f3640',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
};