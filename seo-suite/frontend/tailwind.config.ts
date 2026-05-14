import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef9ff',
          100: '#d9f1ff',
          200: '#bbe6ff',
          300: '#8dd6ff',
          400: '#57bcff',
          500: '#2fa0ff',
          600: '#1782f5',
          700: '#1267d6',
          800: '#1554ab',
          900: '#174a87',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
