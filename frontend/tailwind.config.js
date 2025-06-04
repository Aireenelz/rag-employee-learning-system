/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        els: {
					primarybackground: '#3662E3',
					teal: '#5CD6C0',
          secondarybackground: '#F8FAFC',
				}
      }
    },
  },
  plugins: [],
}

