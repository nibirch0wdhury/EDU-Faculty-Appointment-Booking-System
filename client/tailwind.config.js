/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff5f5',
          100: '#ffe0e0',
          200: '#ffb3b3',
          300: '#ff8080',
          400: '#ff4d4d',
          500: '#990000',
          600: '#880000',
          700: '#770000',
          800: '#660000',
          900: '#550000',
          950: '#440000',
        },
        accent: {
          red: '#990000',
          dark: '#1a0000',
          light: '#ffe0e0',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'red-glow': '0 0 30px -5px rgba(153, 0, 0, 0.3)',
        'red-glow-lg': '0 0 60px -10px rgba(153, 0, 0, 0.4)',
        'red-inner': 'inset 0 0 30px rgba(153, 0, 0, 0.1)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 40px rgba(153, 0, 0, 0.12)',
        'card-dark': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'card-hover-dark': '0 8px 40px rgba(153, 0, 0, 0.2)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'marquee': 'marquee 20s linear infinite',
        'border-pulse': 'borderPulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseRed: {
          '0%, 100%': { opacity: 0.6 },
          '50%': { opacity: 1 },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        borderPulse: {
          '0%, 100%': { borderColor: 'rgba(153, 0, 0, 0.3)' },
          '50%': { borderColor: 'rgba(153, 0, 0, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}