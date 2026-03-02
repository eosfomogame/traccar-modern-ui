/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        surface: {
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#0a0f1a',
        },
        online:  '#10b981',
        moving:  '#3b82f6',
        stopped: '#f59e0b',
        offline: '#6b7280',
        alarm:   '#ef4444',
      },
      animation: {
        'fade-in':       'fade-in 0.2s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'ping':          'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        'fade-in':       { from: { opacity: '0', transform: 'translateY(-4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-in-left': { from: { transform: 'translateX(-100%)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
      },
      backdropBlur: { xl: '20px' },
      boxShadow: {
        glow: '0 0 20px rgba(59,130,246,0.4)',
      },
    },
  },
  plugins: [],
};
