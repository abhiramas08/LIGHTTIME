/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        space: {
          deep: '#07111F',
          darker: '#040B14',
          surface: '#0A1726',
        },
        control: {
          navy: '#10243A',
          muted: '#142C47',
          highlight: '#1C3E63',
        },
        panel: {
          blue: '#193B59',
          light: '#235078',
          border: 'rgba(67, 198, 232, 0.2)',
          borderSubtle: 'rgba(25, 59, 89, 0.6)',
        },
        telemetry: {
          cyan: '#43C6E8',
          dim: '#2A8299',
          glow: 'rgba(67, 198, 232, 0.15)',
        },
        offwhite: '#F2F4F5',
        warning: {
          amber: '#F5A623',
          dim: '#8A5D13',
          glow: 'rgba(245, 166, 35, 0.15)',
        },
        critical: {
          red: '#E05252',
          dim: '#7A2B2B',
          glow: 'rgba(224, 82, 82, 0.15)',
        },
        nominal: {
          green: '#45B77A',
          dim: '#21593B',
          glow: 'rgba(69, 183, 122, 0.15)',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Consolas', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'telemetry-sm': '0 0 10px rgba(67, 198, 232, 0.15)',
        'telemetry-md': '0 0 20px rgba(67, 198, 232, 0.25)',
        'warning-sm': '0 0 10px rgba(245, 166, 35, 0.2)',
        'critical-sm': '0 0 10px rgba(224, 82, 82, 0.25)',
        'nominal-sm': '0 0 10px rgba(69, 183, 122, 0.2)',
      },
      backgroundImage: {
        'technical-grid': 'linear-gradient(to right, rgba(25, 59, 89, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(25, 59, 89, 0.15) 1px, transparent 1px)',
        'dots-pattern': 'radial-gradient(rgba(67, 198, 232, 0.15) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-pattern': '24px 24px',
        'dots-pattern': '16px 16px',
      },
    },
  },
  plugins: [],
};
