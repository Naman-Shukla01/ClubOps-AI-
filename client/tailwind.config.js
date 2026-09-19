export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        appBg: '#0a0a0f', surface: '#12121a', card: '#1a1a26', cardHover: '#22222e',
        border: '#2a2a3a', muted: '#71718a', fg: '#e8e8f0', accent: '#7c5cfc',
        accentHover: '#6b4ce0', green: '#34d399', blue: '#60a5fa', orange: '#fb923c',
        red: '#f87171', yellow: '#fbbf24',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: { glow: '0 0 40px rgba(124,92,252,0.15)' },
    },
  },
  plugins: [],
}