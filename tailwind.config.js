/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#060d0a',
        gold: '#c9a84c',
        'gold-light': '#e8c96a',
        green: { deep: '#1a4731', mid: '#2d6a4f', light: '#4a9e73' },
      },
    },
  },
  plugins: [],
}
