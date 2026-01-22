/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#000000',
                foreground: '#ffffff',
                primary: '#0791ed',
                accent: {
                    pink: '#ff007a',
                    blue: '#0791ed',
                    yellow: '#fffb00',
                    green: '#00ff41',
                },
                card: {
                    bg: 'rgba(255, 255, 255, 0.05)',
                    border: 'rgba(255, 255, 255, 0.1)',
                    dark: '#111827',
                }
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', '"Space Grotesk"', '"Outfit"', 'sans-serif'],
                display: ['"Plus Jakarta Sans"', '"Space Grotesk"', 'sans-serif'],
                body: ['"Space Grotesk"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            animation: {
                'bounce-slow': 'bounce 3s infinite',
                'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
            },
            backdropBlur: {
                xs: '2px',
            },
            borderRadius: {
                'DEFAULT': '0.5rem',
                'lg': '1rem',
                'xl': '1.5rem',
                'full': '9999px'
            },
            spacing: {
                'safe-top': 'env(safe-area-inset-top)',
                'safe-bottom': 'env(safe-area-inset-bottom)',
            }
        },
    },
    plugins: [],
}
