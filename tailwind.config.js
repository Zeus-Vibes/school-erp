/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A5F',
        secondary: '#6B8E23',
        accent: '#C49A1A',
        highlight: '#B23A3A',
        bg: '#FAFAF8',
        section: '#F4F3EF',
        textPrimary: '#1A1A1A',
        textMuted: '#6B7280',
        card: '#FFFFFF',
        border: '#E8E8E5',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.09)',
        sidebar: '4px 0 20px rgba(0,0,0,0.06)',
        button: '0 1px 3px rgba(0,0,0,0.08)',
        modal: '0 20px 60px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        '2xl': '20px',
        xl: '16px',
        lg: '12px',
      },
      spacing: {
        sidebar: '260px',
        topbar: '64px',
      },
    },
  },
  plugins: [],
}
