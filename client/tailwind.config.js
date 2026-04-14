/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          950: '#06080d',
          900: '#0a0e17',
          850: '#0e1320',
          800: '#121829',
          700: '#1a2138',
          600: '#232c47',
        },
        neon: {
          cyan: '#00e5ff',
          indigo: '#6366f1',
          purple: '#a855f7',
          pink: '#ec4899',
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0,229,255,0.15), 0 0 60px rgba(0,229,255,0.05)',
        'glow-indigo': '0 0 20px rgba(99,102,241,0.2), 0 0 60px rgba(99,102,241,0.06)',
        'glow-sm': '0 0 10px rgba(0,229,255,0.1)',
        'neon': '0 0 5px rgba(0,229,255,0.3), 0 0 20px rgba(0,229,255,0.1), 0 0 40px rgba(99,102,241,0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh': 'radial-gradient(at 20% 20%, rgba(99,102,241,0.08) 0px, transparent 50%), radial-gradient(at 80% 50%, rgba(0,229,255,0.06) 0px, transparent 50%), radial-gradient(at 40% 80%, rgba(168,85,247,0.05) 0px, transparent 50%)',
      },
      fontFamily: {
        display: ['"Exo 2"', 'system-ui', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,229,255,0.1)' },
          '50%': { boxShadow: '0 0 30px rgba(0,229,255,0.2), 0 0 60px rgba(99,102,241,0.08)' },
        },
      },
    },
  },
  plugins: [],
};
