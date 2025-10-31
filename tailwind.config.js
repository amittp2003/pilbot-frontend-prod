module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Dark Theme Palette
        'neural': {
          900: '#0A0A0A',  // Primary background
          850: '#0F0F0F',  // Secondary background
          800: '#141414',  // Tertiary background / hover states
          700: '#1A1A1A',  // Component backgrounds
          600: '#1F1F1F',  // Border colors
          500: '#2A2A2A',  // Subtle dividers
          400: '#3A3A3A',  // Focus states
          300: '#6B6B6B',  // Muted gray text
          200: '#A0A0A0',  // Secondary text
          100: '#FFFFFF',  // Primary text
        },
        'accent': {
          DEFAULT: '#DC2626',
          dark: '#B91C1C',
        },
        'success': '#10B981',
        // Legacy PCE colors (keeping for compatibility)
        'pce-maroon': '#800000',
        'pce-gold': '#FFD700',
        'pce-cream': '#FFFDD0',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],      // 11px
        'sm': ['0.8125rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],   // 13px
        'base': ['0.875rem', { lineHeight: '1.5rem', letterSpacing: '0' }],        // 14px
        'lg': ['0.9375rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],  // 15px
        'xl': ['1rem', { lineHeight: '1.75rem', letterSpacing: '-0.02em' }],       // 16px
        '2xl': ['1.125rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],     // 18px
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'sm': '0.5rem',   // 8px
        'md': '0.75rem',  // 12px
        'lg': '1rem',     // 16px
        'xl': '1.25rem',  // 20px
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.4)',
        'elevated': '0 4px 12px rgba(0, 0, 0, 0.5)',
        'glow': '0 0 20px rgba(220, 38, 38, 0.15)',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.98)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
}