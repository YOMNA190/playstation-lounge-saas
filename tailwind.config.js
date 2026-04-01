/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ps: {
          blue:   '#003791',
          'blue-light': '#0070d1',
          dark:   '#0a0a0f',
          darker: '#050508',
          surface:'#111118',
          card:   '#16161f',
          border: '#1e1e2e',
          text:   '#e8e8f0',
          muted:  '#6b6b8a',
          green:  '#00c896',
          red:    '#ff4757',
          gold:   '#ffd700',
          purple: '#8b5cf6',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['"IBM Plex Sans Arabic"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #003791, 0 0 10px #003791' },
          '100%': { boxShadow: '0 0 20px #0070d1, 0 0 40px #0070d1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
