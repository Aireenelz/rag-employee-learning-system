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
          mutedbackground: '#E5E7EA',
          cardheaderbackground: '#FBFBFD',
          bookmarkeddocumentbackground: '#EAEFFC',
          chatuser: '#3662E3',
          chatrobot: '#F2F5F8',
          primarybutton: '#3662E3',
          secondarybutton: '#F8FAFC',
          deletebutton: '#FCF1F1',
          primarybuttonhover: '#2A4DD0',
          secondarybuttonhover: '#E0E6EA',
          deletebuttonhover: '#CC0000',
					teal: '#5CD6C0',
				}
      }
    },
  },
  plugins: [],
}

