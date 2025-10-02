/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      keyframes: {
          'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'bounce-slower': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        // Existing fadeUp animation
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Fade-in animation for loading screen
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Slow spinning ring
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        // Reverse spinning ring
        'spin-reverse': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        fadeUp: 'fadeUp 0.6s ease forwards',
        fadeUpDelay200: 'fadeUp 0.6s ease 0.2s forwards',
        fadeUpDelay400: 'fadeUp 0.6s ease 0.4s forwards',
        fadeIn: 'fadeIn 0.6s ease-out forwards',
        'spin-slow': 'spin-slow 3s linear infinite',
        'spin-reverse': 'spin-reverse 4s linear infinite',
        bounce: 'bounce 1s infinite',
        'gradient-x': 'gradient-x 8s ease infinite',
         'bounce-slow': 'bounce-slow 4s ease-in-out infinite',
        'bounce-slower': 'bounce-slower 6s ease-in-out infinite',

      },
       backgroundSize: {
        '200%': '200% 200%',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.animate-delay-150': { 'animation-delay': '150ms' },
        '.animate-delay-300': { 'animation-delay': '300ms' },
        '.animate-delay-500': { 'animation-delay': '500ms' },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
};
