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
        // Nude, Cream & Sand Palette
        nude: {
          50: '#FDFBF7',
          100: '#F8F4EB',
          200: '#F1E9DB',
          300: '#E5D8C3',
          400: '#D3BF9F',
          500: '#B99D77',
          600: '#9A7D58',
          700: '#7B6041',
          800: '#5F4830',
          900: '#4A3724',
        },
        // Warm Terracotta / Peach Blush
        blush: {
          50: '#FFF8F5',
          100: '#FEEFEA',
          200: '#FCD8CC',
          300: '#F8B7A0',
          400: '#F28E6E',
          500: '#E76541',
          600: '#C94827',
        },
        // Honey Amber / Champagne
        champagne: {
          50: '#FDFBF4',
          100: '#FBF5E5',
          200: '#F6E9C4',
          300: '#EED799',
          400: '#E3C065',
          500: '#D4A63B',
          600: '#B38327',
        },
        // Vibrant Fresh Mint / Emerald
        mint: {
          50: '#F0FDF8',
          100: '#DCFCEE',
          200: '#BAF7DC',
          400: '#49DE9C',
          500: '#1EB879',
          600: '#0E935D',
        },
        // Soft Slate / Charcoal
        charcoal: {
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Outfit"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'nude-soft': '0 4px 20px -2px rgba(185, 157, 119, 0.12), 0 2px 6px -1px rgba(185, 157, 119, 0.06)',
        'nude-card': '0 8px 30px -4px rgba(185, 157, 119, 0.15), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
        'glow-coral': '0 10px 25px -4px rgba(242, 142, 110, 0.35)',
        'glow-amber': '0 10px 25px -4px rgba(227, 192, 101, 0.35)',
        'glow-mint': '0 10px 25px -4px rgba(30, 184, 121, 0.35)',
      }
    },
  },
  plugins: [],
}
