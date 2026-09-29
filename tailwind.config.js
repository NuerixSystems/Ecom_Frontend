/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cracker: {
          orange: '#FF6B1A',
          red: '#E4362B',
          gold: '#FFC300',
          navy: '#0B1330',
          navy2: '#141E44',
          cream: '#FFF8EF',
        },
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'firework-hero': "radial-gradient(circle at 20% 30%, rgba(255,195,0,0.35), transparent 40%), radial-gradient(circle at 80% 20%, rgba(228,54,43,0.35), transparent 40%), radial-gradient(circle at 60% 70%, rgba(255,107,26,0.3), transparent 45%), linear-gradient(180deg, #0B1330 0%, #141E44 60%, #0B1330 100%)",
      },
      keyframes: {
        sparkle: {
          '0%, 100%': { opacity: 0.4, transform: 'scale(0.8)' },
          '50%': { opacity: 1, transform: 'scale(1.2)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        sparkle: 'sparkle 2.2s ease-in-out infinite',
        floaty: '4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
