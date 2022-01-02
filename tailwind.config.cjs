const colors = require('tailwindcss/colors')


const config = {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    darkMode: "class",
    theme: {
        colors: {
            inherit: colors.inherit,
            current: colors.current,
            transparent: colors.transparent,
            black: colors.black,
            white: colors.white,
            slate: colors.slate,
            red: colors.red,
            orange: colors.orange,
            amber: colors.amber,
            yellow: colors.yellow,
            lime: colors.lime,
            green: colors.green,
            emerald: colors.emerald,
            teal: colors.teal,
            cyan: colors.cyan,
            sky: colors.sky,
            blue: colors.blue,
            indigo: colors.indigo,
            violet: colors.violet,
            pink: {
                100: '#EEAAC3',
                200: '#E06793',
                300: '#D9457B',
                400: '#CB2A65',
                500: '#A92354',
            },
            purple: {
                100: '#6F5A87',
                200: '#5B496E',
                300: '#3F334D',
                400: '#32293D',
                500: '#1E1825',
            },
            neutral: {
                100: '#F4F4F4',
                200: '#F6F4F5',
                300: '#E3DEE0',
                400: '#C6BEC0',
                500: '#AA9DA1',
                600: '#8D7C81',
                700: '#6A5D61',
                800: '#4C4245',
                900: '#372F32',
                1000: '#211C1E',
                1100: '#0B090A',
            }
        },
        extend: {
            strokeWidth: {
                "3": "3px",
            },
            fontSize: {
                "7.5xl": "5rem",
            }
        }
    },
    plugins: [],
};

module.exports = config;
