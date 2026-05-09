/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: '#9f7aea',
        'primary-hover': '#805ad5',
        secondary: '#0ea5e9',
        'secondary-hover': '#0284c7',
        // Slate palette (overrides Tailwind defaults for consistency)
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
      backgroundImage: {
        'gradient-dark': 'radial-gradient(circle at top, rgba(99, 102, 241, 0.12), transparent 30%), radial-gradient(circle at bottom, rgba(14, 165, 233, 0.1), transparent 25%), #020617',
      },
    },
  },
  plugins: [],
};
