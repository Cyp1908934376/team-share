/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Apple System Colors
        apple: {
          blue: '#007AFF',
          green: '#34C759',
          indigo: '#5856D6',
          orange: '#FF9500',
          pink: '#FF2D55',
          purple: '#AF52DE',
          red: '#FF3B30',
          teal: '#5AC8FA',
          yellow: '#FFCC00',
        },
        // Apple Dark Mode Colors
        'apple-dark': {
          blue: '#0A84FF',
          green: '#30D158',
          indigo: '#5E5CE6',
          orange: '#FF9F0A',
          pink: '#FF375F',
          purple: '#BF5AF2',
          red: '#FF453A',
          teal: '#64D2FF',
          yellow: '#FFD60A',
        },
        // Background Colors
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          elevated: 'var(--bg-elevated)',
        },
        // Fill Colors
        fill: {
          primary: 'var(--fill-primary)',
          secondary: 'var(--fill-secondary)',
          tertiary: 'var(--fill-tertiary)',
          quaternary: 'var(--fill-quaternary)',
        },
        // Text Colors
        label: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          quaternary: 'var(--text-quaternary)',
        },
        // Separator
        separator: {
          DEFAULT: 'var(--separator)',
          opaque: 'var(--separator-opaque)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        'large-title': ['34px', { lineHeight: '41px', fontWeight: '700' }],
        'title-1': ['28px', { lineHeight: '34px', fontWeight: '700' }],
        'title-2': ['22px', { lineHeight: '28px', fontWeight: '700' }],
        'title-3': ['20px', { lineHeight: '25px', fontWeight: '600' }],
        headline: ['17px', { lineHeight: '22px', fontWeight: '600' }],
        body: ['17px', { lineHeight: '22px', fontWeight: '400' }],
        callout: ['16px', { lineHeight: '21px', fontWeight: '400' }],
        subheadline: ['15px', { lineHeight: '20px', fontWeight: '400' }],
        footnote: ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'caption-1': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'caption-2': ['11px', { lineHeight: '13px', fontWeight: '400' }],
      },
      spacing: {
        'space-1': '4px',
        'space-2': '8px',
        'space-3': '12px',
        'space-4': '16px',
        'space-5': '20px',
        'space-6': '24px',
        'space-8': '32px',
        'space-10': '40px',
        'space-12': '48px',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '12px',
        xl: '14px',
      },
      boxShadow: {
        'apple-1': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'apple-2': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'apple-3': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'apple-4': '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
      },
      backdropBlur: {
        'apple': 'saturate(180%) blur(20px)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 300ms cubic-bezier(0.0, 0.0, 0.2, 1.0)',
        'slide-down': 'slideDown 300ms cubic-bezier(0.0, 0.0, 0.2, 1.0)',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.0, 0.0, 0.2, 1.0)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          from: { transform: 'translateY(-8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionDuration: {
        instant: '100ms',
        fast: '200ms',
        normal: '300ms',
        slow: '500ms',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
        'apple-in': 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
        'apple-out': 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
      },
    },
  },
  plugins: [],
}
