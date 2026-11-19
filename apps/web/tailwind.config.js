const v = (n) => `rgb(var(--${n}) / <alpha-value>)`;
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: v('bg'), surface: v('surface'), surface2: v('surface2'), line: v('line'),
        ink: v('ink'), ink2: v('ink2'), navy: v('navy'), accent: v('accent'), accentSoft: v('accent-soft'),
        warn: v('warn'), ok: v('ok'),
      },
      fontFamily: { sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'Inter', 'system-ui', 'sans-serif'],
                    display: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { ctl: '14px', sheet: '18px' },
      boxShadow: { card: '0 1px 2px rgba(16,42,67,.06)' },
    },
  },
  plugins: [],
};
