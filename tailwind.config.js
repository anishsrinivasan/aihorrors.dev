/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'horror-red': '#ef4444', // Less intense red (Tailwind red-500)
        'horror-orange': '#f97316', // Softer orange (Tailwind orange-500)
        'horror-black': '#0a0a0a', // Very dark gray instead of pure black
        'horror-gray': '#171717', // Dark gray (neutral-900)
        'horror-gray-light': '#262626', // Medium dark gray (neutral-800)
        'horror-gray-lighter': '#404040', // Lighter gray (neutral-700)
      },
      fontFamily: {
        'mono': ['Space Mono', 'monospace'],
        'display': ['Archivo Black', 'sans-serif'],
      },
      animation: {
        'glitch': 'glitch 0.3s infinite',
        'flicker': 'flicker 3s infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
