import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tokens dirigidos por CSS variables (canais RGB) — trocar a paleta
        // = trocar data-palette no <html>. Ver src/index.css e src/theme/palettes.ts.
        primary: 'rgb(var(--c-primary) / <alpha-value>)',
        secondary: 'rgb(var(--c-secondary) / <alpha-value>)',
        success: 'rgb(var(--c-success) / <alpha-value>)',
        warning: 'rgb(var(--c-warning) / <alpha-value>)',
        error: 'rgb(var(--c-error) / <alpha-value>)',
        info: 'rgb(var(--c-info) / <alpha-value>)',
        sidebar: 'rgb(var(--c-sidebar) / <alpha-value>)',
        'sidebar-elevation': 'rgb(var(--c-sidebar-elevation) / <alpha-value>)',
        background: 'rgb(var(--c-background) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        border: 'rgb(var(--c-border) / <alpha-value>)',
        'text-primary': 'rgb(var(--c-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--c-text-secondary) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xs': '7px',
        'sm': '9px',
        'md': '11px',
        'lg': '13px',
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(20, 24, 40, 0.04)',
        'card-md': '0 2px 6px rgba(20, 24, 40, 0.07)',
        'dropdown': '0 16px 40px rgba(20, 24, 40, 0.18)',
        'modal': '0 24px 60px rgba(20, 22, 40, 0.28)',
        'toast': '0 12px 30px rgba(0, 0, 0, 0.24)',
      },
      keyframes: {
        popIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(8px) scale(0.98)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        slideUp: {
          '0%': {
            transform: 'translateY(100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
      },
      animation: {
        popIn: 'popIn 0.2s ease-out',
        slideUp: 'slideUp 0.25s ease-out',
        fadeIn: 'fadeIn 0.15s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config
