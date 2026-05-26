/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        glass: '0 20px 60px rgba(15, 23, 42, 0.25)'
      },
      backgroundImage: {
        'glass-gradient': 'radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 35%)'
      }
    }
  },
  plugins: []
};
