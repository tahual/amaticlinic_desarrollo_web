/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#028090',
          dark: '#0B3D3A',
          light: '#00A896',
        },
        accent: '#02C39A',
      },
    },
  },
  plugins: [],
}
