/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core Brand Colors
        brand: {
          forest: '#0D3027',
          emerald: '#087F5B',
          'emerald-hover': '#06684B',
          mint: '#25C993',
          'mint-hover': '#46D9A6',
          'pale-mint': '#E5F5EF',
          'dark-mint': '#1D3830',
        },
        // Theme tokens
        page: {
          light: '#F6F9F7',
          dark: '#101815',
        },
        surface: {
          light: '#FFFFFF',
          'light-secondary': '#F0F5F2',
          dark: '#17211D',
          'dark-elevated': '#1E2B25',
        },
        content: {
          'light-primary': '#16231F',
          'light-secondary': '#5D7168',
          'light-muted': '#788980',
          'dark-primary': '#F2F7F4',
          'dark-secondary': '#B2C1B8',
          'dark-muted': '#8A9A91',
        },
        border: {
          light: '#DCE7E1',
          dark: '#2D3D35',
        },
        // Semantic Colors
        semantic: {
          'success-light': '#16865D',
          'success-dark': '#3DD39C',
          'warning-light': '#9A6700',
          'warning-dark': '#F3C969',
          'error-light': '#B42318',
          'error-dark': '#FF938B',
          'info-light': '#2867A8',
          'info-dark': '#8BBEFF',
        },
        // WhatsApp legacy mappings for smooth backward compatibility
        wa: {
          green: '#25C993',
          teal: '#087F5B',
          'teal-dark': '#0D3027',
          emerald: '#087F5B',
          'emerald-light': '#25C993',
          'bubble-out': '#0D3027',
          'bubble-in': '#17211D',
          'bubble-light-out': '#E5F5EF',
          'bubble-light-in': '#FFFFFF',
          'dark-bg': '#101815',
          'dark-sidebar': '#17211D',
          'dark-header': '#1E2B25',
          'dark-chat': '#101815',
          'dark-hover': '#1E2B25',
          'dark-border': '#2D3D35',
          'text-primary': '#F2F7F4',
          'text-secondary': '#B2C1B8',
          'text-muted': '#8A9A91',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      borderRadius: {
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '14px',
        '2xl': '16px',
        '3xl': '24px',
      }
    },
  },
  plugins: [],
}
