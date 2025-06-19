/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D1117', // Dark background
          secondary: '#161B22', // Secondary dark
        },
        text: {
          primary: '#E5E5E5', // Main text
          secondary: '#6B7280', // Neutral gray (new)
          placeholder: '#6E7B8B', // From Auth.css
        },
        accent: {
          cyan: '#40E0D0', // Softened cyan (turquoise)
          purple: '#9C27B0', // Original purple
          neutral: '#4B5563', // Neutral gray for borders (new)
          error: '#F44336', // From Auth.css
        },
        light: {
          bg: '#F9FAFB', // Light mode background
          text: '#1F2937', // Light mode text
          secondary: '#E5E7EB', // Light secondary
        },
      },
      backgroundImage: {
        'gradient-auth': 'linear-gradient(to right, #40E0D0, #9C27B0)', // Subtle Auth gradient
        'gradient-card': 'linear-gradient(to bottom, #161B22, #0D1117)', // Card background
      },
      fontFamily: {
        inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 6px rgba(0, 0, 0, 0.5)', // From variables.css
        hover: '0 8px 12px rgba(0, 0, 0, 0.6)', // From variables.css
      },
    },
  },
  plugins: [],
};