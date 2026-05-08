/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:       'rgb(var(--color-bg) / <alpha-value>)',
        surface:  'rgb(var(--color-surface) / <alpha-value>)',
        ctext:    'rgb(var(--color-text) / <alpha-value>)',
        muted:    'rgb(var(--color-muted) / <alpha-value>)',
        border:   'rgb(var(--color-border) / <alpha-value>)',
        primary:  'rgb(var(--color-primary) / <alpha-value>)',
        accent:   'rgb(var(--color-accent) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 5px rgb(var(--color-primary) / 0.4)' },
          '100%': { boxShadow: '0 0 20px rgb(var(--color-primary) / 0.8), 0 0 40px rgb(var(--color-accent) / 0.3)' },
        },
      },
      backdropBlur: { xs: '2px' },
      clipPath: {
        hex: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
      },
    },
  },
  plugins: [],
}
