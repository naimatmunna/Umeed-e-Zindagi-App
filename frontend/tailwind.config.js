/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* Legacy `ios-*` tokens remapped to Umeed-e-Zindagi brand palette */
        ios: {
          bg: '#F2F7F4',
          card: '#FFFFFF',
          separator: '#D4E2DA',
          label: '#1A2B22',
          secondary: '#5A6F62',
          blue: '#1A6B47',
          'blue-pressed': '#124D32',
          red: '#C41E3A',
          green: '#2E8B57',
          orange: '#E8942E',
          teal: '#3A8FB7',
        },
        brand: {
          forest: '#1A6B47',
          forestDark: '#124D32',
          forestLight: '#E9F4EE',
          heart: '#C41E3A',
          gold: '#E8942E',
          sky: '#3A8FB7',
          lime: '#6BBF59',
          cream: '#FAFCFB',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'page-title': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700', letterSpacing: '-0.02em' }],
        'section-title': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'table-head': ['0.6875rem', { lineHeight: '1rem', fontWeight: '600', letterSpacing: '0.06em' }],
        'table-cell': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
      },
      borderRadius: {
        ios: '10px',
        'ios-lg': '14px',
        'ios-xl': '18px',
      },
      boxShadow: {
        ios: '0 1px 2px rgba(26, 43, 34, 0.06), 0 1px 3px rgba(26, 43, 34, 0.04)',
        'ios-lg': '0 8px 30px rgba(26, 43, 34, 0.08)',
        'ios-card': '0 1px 3px rgba(26, 107, 71, 0.06), 0 4px 16px rgba(26, 43, 34, 0.05)',
        table: '0 1px 0 rgba(26, 107, 71, 0.08) inset',
      },
    },
  },
  plugins: [],
};
