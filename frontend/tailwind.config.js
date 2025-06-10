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
          secondarybackground: '#F8FAFC',
          mainpanelbackground: '#FFFFFF',
          chatuser: '#3662E3',
          chatrobot: '#F2F5F8',
          primarybutton: '#3662E3',
					teal: '#5CD6C0',
				}
      }
    },
  },
  plugins: [],
}

