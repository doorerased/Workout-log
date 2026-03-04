/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter','sans-serif'] },
      colors: {
        surface: {
          900: '#0f1117', 800: '#161b27', 700: '#1e2536', 600: '#252d40', 500: '#2e3851',
        },
      },
      animation: {
        'slide-up': 'slideUp 0.25s ease',
        'drawer-in': 'drawerIn 0.3s ease',
        'fade-in': 'fadeIn 0.2s ease',
      },
      keyframes: {
        slideUp: { from:{ opacity:'0', transform:'translateY(10px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        drawerIn: { from:{ transform:'translateY(100%)' }, to:{ transform:'translateY(0)' } },
        fadeIn: { from:{ opacity:'0' }, to:{ opacity:'1' } },
      },
    },
  },
  plugins: [],
}
