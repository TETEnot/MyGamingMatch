import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cyber: {
          black: '#0a0a0a',
          darker: '#000000',
          dark: '#1a1a1a',
          green: '#00ff00',
          'green-dark': '#00cc00',
          'green-glow': '#00ff0033',
          accent: '#39ff14',
          'accent-dark': '#32cd32',
          grid: '#1a1a1a',
        },
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(transparent 0%, rgba(0, 255, 0, 0.05) 50%, transparent 100%)',
        'cyber-gradient': 'linear-gradient(45deg, #00ff00 0%, #32cd32 100%)',
      },
      keyframes: {
        'neon-pulse': {
          '0%, 100%': { opacity: '1', textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00' },
          '50%': { opacity: '0.5', textShadow: '0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 15px #00ff00' },
        },
        'matrix-bg': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        'glow-line': {
          '0%': { width: '0%', opacity: '0' },
          '50%': { width: '100%', opacity: '1' },
          '100%': { width: '100%', opacity: '0' },
        },
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'matrix-bg': 'matrix-bg 20s linear infinite',
        'glow-line': 'glow-line 2s ease-in-out forwards',
      },
      boxShadow: {
        'neon-green': '0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 15px #00ff00',
        'neon-card': '0 0 5px #00ff00, 0 0 10px rgba(0, 255, 0, 0.5)',
      },
    },
  },
  plugins: [],
} satisfies Config;
