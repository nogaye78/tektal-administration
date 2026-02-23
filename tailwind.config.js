/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Optionnel : on peut ajouter les couleurs exactes de Tektal ici plus tard
      }
    },
  },
  plugins: [],
}