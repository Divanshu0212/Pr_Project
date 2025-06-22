/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Semantic color names that now directly point to hex codes or RGB values
      colors: {
        background: {
          primary: 'var(--color-background-primary)', // Will be set in CSS based on theme
          secondary: 'var(--color-background-secondary)', // Will be set in CSS based on theme
        },
        text: {
          primary: 'var(--color-text-primary)', // Will be set in CSS based on theme
          secondary: 'var(--color-text-secondary)', // Will be set in CSS based on theme
          placeholder: 'var(--color-text-placeholder)', // Will be set in CSS based on theme
        },
        accent: {
          primary: 'var(--color-accent-primary)', // Will be set in CSS based on theme
          secondary: 'var(--color-accent-secondary)', // Will be set in CSS based on theme
          neutral: 'var(--color-accent-neutral)', // Will be set in CSS based on theme
          error: 'var(--color-accent-error)', // Will be set in CSS based on theme
          highlight: 'var(--color-highlight)', // NEW: Adding a highlight specific for the purple
        },
        // NEW: Direct hex colors from your prompt for easier application if needed,
        // though it's better to map these to the semantic variables below.
        // I will still define these as CSS variables to ensure reactivity.
        'dark-primary-bg': 'var(--color-dark-primary-bg)',
        'dark-secondary-bg': 'var(--color-dark-secondary-bg)',
        'dark-font': 'var(--color-dark-font)',
        'dark-accent-cyan': 'var(--color-dark-accent-cyan)',
        'dark-highlight-purple': 'var(--color-dark-highlight-purple)',

        // For the light theme, deriving analogous colors
        'light-primary-bg': 'var(--color-light-primary-bg)',
        'light-secondary-bg': 'var(--color-light-secondary-bg)',
        'light-font': 'var(--color-light-font)',
        'light-accent-cyan': 'var(--color-light-accent-cyan)', // Keeping a cyan accent for contrast
        'light-highlight-purple': 'var(--color-light-highlight-purple)', // Keeping a purple highlight
      },

      // Background gradients
      backgroundImage: {
        // Updated to use the new CSS variables for card gradients
        'gradient-card-dark': 'linear-gradient(145deg, var(--color-dark-gradient-card-start) 0%, var(--color-dark-gradient-card-end) 100%)',
        'gradient-card-light': 'linear-gradient(145deg, var(--color-light-gradient-card-start) 0%, var(--color-light-gradient-card-end) 100%)',
        // Other gradients remain as they are specific values
        'gradient-auth': 'linear-gradient(135deg, #3182CE 0%, #805AD5 100%)',
        'gradient-mesh': 'radial-gradient(circle at 20% 80%, rgba(49, 130, 206, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(128, 90, 213, 0.3) 0%, transparent 50%)',
        'gradient-hero': 'linear-gradient(135deg, rgba(49, 130, 206, 0.1) 0%, rgba(128, 90, 213, 0.1) 100%)',
      },

      // Typography
      fontFamily: {
        inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },

      // Enhanced shadows - these often change with theme, consider variables if you want them dynamic
      boxShadow: {
        'card': '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
        'hover': '0 6px 20px 0 rgba(0, 0, 0, 0.12)',
        'card-dark': '0 4px 14px 0 rgba(0, 0, 0, 0.4)',
        'hover-dark': '0 6px 20px 0 rgba(0, 0, 0, 0.5)',
        'glow': '0 0 20px rgba(49, 130, 206, 0.3)',
        'glow-purple': '0 0 20px rgba(128, 90, 213, 0.3)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)',
        'lifted': '0 10px 40px rgba(0, 0, 0, 0.1)',
        'float': '0 15px 35px rgba(0, 0, 0, 0.1), 0 3px 10px rgba(0, 0, 0, 0.1)',
      },

      // Animation keyframes
      keyframes: {
        // Text animations
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in-left': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'fade-in-right': {
          '0%': {
            opacity: '0',
            transform: 'translateX(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'slide-up': {
          '0%': {
            transform: 'translateY(100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'typewriter': {
          '0%': { width: '0ch' },
          '100%': { width: '100%' },
        },
        'blink': {
          '0%, 50%': { 'border-color': 'transparent' },
          '51%, 100%': { 'border-color': 'currentColor' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'scale-in': {
          '0%': {
            transform: 'scale(0.9)',
            opacity: '0',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      // Animation utilities
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in-down': 'fade-in-down 0.6s ease-out forwards',
        'fade-in-left': 'fade-in-left 0.6s ease-out forwards',
        'fade-in-right': 'fade-in-right 0.6s ease-out forwards',
        'slide-up': 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'typewriter': 'typewriter 2s steps(20) forwards',
        'blink': 'blink 1s infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'scale-in': 'scale-in 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',

        // Delayed animations for staggered effects
        'fade-in-up-delay-100': 'fade-in-up 0.6s ease-out 0.1s forwards',
        'fade-in-up-delay-200': 'fade-in-up 0.6s ease-out 0.2s forwards',
        'fade-in-up-delay-300': 'fade-in-up 0.6s ease-out 0.3s forwards',
        'fade-in-up-delay-400': 'fade-in-up 0.6s ease-out 0.4s forwards',
        'fade-in-up-delay-500': 'fade-in-up 0.6s ease-out 0.5s forwards',
      },

      // Transition utilities
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
      },

      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      // Spacing for better layouts
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // Border radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // Backdrop blur
      backdropBlur: {
        'xs': '2px',
      },

      // Z-index scale
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
};