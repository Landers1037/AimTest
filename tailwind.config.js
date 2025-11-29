/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 自定义科技色调
        'neon-blue': '#00d4ff',
        'neon-green': '#00ff88',
        'neon-orange': '#ff6b35',
        'cyber-purple': '#8b5cf6',
        'deep-space': '#1a1a2e',
        'starlight': '#16213e',
      },
      fontFamily: {
        // 科技感字体
        'orbitron': ['Orbitron', 'monospace'],
        'roboto-mono': ['Roboto Mono', 'monospace'],
      },
      animation: {
        // 自定义动画
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 15s ease infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            'box-shadow': '0 0 5px rgba(0, 212, 255, 0.3)'
          },
          '50%': { 
            'box-shadow': '0 0 20px rgba(0, 212, 255, 0.6)'
          },
        },
        'gradient-shift': {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
      },
      backgroundSize: {
        '200%': '200% 200%',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 212, 255, 0.4)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.4)',
        'neon-orange': '0 0 20px rgba(255, 107, 53, 0.4)',
      },
    },
  },
  plugins: [],
}