/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#0f172a', // Slate-900 (Navy)
          800: '#1e293b', // Slate-800
          50: '#f8fafc',  // Slate-50 (Background)
        },
        accent: {
          green: '#10b981', // Emerald-500
          amber: '#f59e0b', // Amber-500
        }
      }
    },
  },
  plugins: [],
}