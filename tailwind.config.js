/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'glow': 'glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { 'box-shadow': '0 0 15px 5px rgba(78, 224, 252, 0.3)' },
          '50%': { 'box-shadow': '0 0 25px 10px rgba(78, 224, 252, 0.5)' },
        },
      },
      colors: {
        electric: '#4EE0FC',
        electricDark: '#169cb3', // darker shade
        electricLight: '#a5f3fc', // lighter shade
        electricAccent: '#00f0ff', // accent/bright
        sky: '#87CEEB',
        teal: '#38b2ac', // harmonious teal
        cyan: '#06b6d4', // harmonious cyan
        navy: '#0a192f', // deep background
        midnight: '#011627', // alternative dark bg
        white: '#ffffff',
        black: '#000000',
      },
    },
  },
  plugins: [],
}