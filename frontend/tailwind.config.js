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
          mutedbackground: '#F3F4F6',
          cardheaderbackground: '#FBFBFD',
          bookmarkeddocumentbackground: '#EAEFFC',
          chatuser: '#3662E3',
          chatrobot: '#F2F5F8',
          primarybutton: '#3662E3',
          secondarybutton: '#F8FAFC',
          deletebutton: '#FCF1F1',
          redbutton: '#E53E3E',
          primarybuttonhover: '#5679e5ff',
          primarybuttonhoverdark: '#3351aaff',
          secondarybuttonhover: '#E0E6EA',
          deletebuttonhover: '#C52B2B',
          redbuttonhover: '#C52B2B',
          selectedtab: '#FFFFFF',
					teal: '#5CD6C0',
				}
      }
    },
  },
  plugins: [],
}

