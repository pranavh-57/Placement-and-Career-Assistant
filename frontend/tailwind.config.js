/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F6F3',
        panel: '#FFFFFF',
        ink: '#161A1F',
        muted: '#5B6470',
        hairline: '#E3E5E0',
        cobalt: {
          DEFAULT: '#2451B8',
          dark: '#1B3C8F',
          light: '#E8EEFC',
        },
        signal: {
          green: '#15803D',
          amber: '#B45309',
          red: '#B42318',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(22,26,31,0.04), 0 1px 0 rgba(22,26,31,0.03)',
      },
    },
  },
  plugins: [],
}
