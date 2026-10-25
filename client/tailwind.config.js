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
        wa: {
          green: '#25D366',
          teal: '#128C7E',
          'teal-dark': '#075E54',
          emerald: '#00a884',
          'emerald-light': '#02bd94',
          'bubble-out': '#005c4b',
          'bubble-in': '#202c33',
          'bubble-light-out': '#d9fdd3',
          'bubble-light-in': '#ffffff',
          'dark-bg': '#0c1317',
          'dark-sidebar': '#111b21',
          'dark-header': '#202c33',
          'dark-chat': '#0b141a',
          'dark-hover': '#202c33',
          'dark-border': '#222d34',
          'text-primary': '#e9edef',
          'text-secondary': '#8696a0',
          'text-muted': '#667781',
        }
      }
    },
  },
  plugins: [],
}
