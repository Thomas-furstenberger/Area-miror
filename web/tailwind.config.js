/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F1DAC4',
        primary: '#474973',
        secondary: '#A69CAC',
        text: '#161B33',
        dark: '#0D0C1D',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        h1: ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['36px', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['28px', { lineHeight: '1.4', fontWeight: '500' }],
        body: ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        link: ['16px', { lineHeight: '1.6', fontWeight: '500' }],
      },
      spacing: {
        section: '100px',
        element: '50px',
      },
    },
  },
  plugins: [],
};
