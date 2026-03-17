import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            keyframes: {
                pop: {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.2)" },
                },
                shake: {
                    "0%, 100%": { transform: "translateX(0)" },
                    "25%": { transform: "translateX(-2px)" },
                    "50%": { transform: "translateX(2px)" },
                    "75%": { transform: "translateX(-2px)" },
                },
            },
            animation: {
                pop: "pop 0.15s ease-out",
                shake: "shake 0.2s ease-in-out",
            },
        },
    },
    plugins: [],
};

export default config;
