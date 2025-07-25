import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-blue': 'hsl(227 92% 55%)',
        'neon-purple': 'hsl(240 80% 65%)',
        'bg-primary': 'hsl(220 20% 8%)',
        'bg-card-start': 'hsl(220 15% 12%)',
        'bg-card-end': 'hsl(220 20% 15%)',
      },
      boxShadow: {
        'neon': '0 0 40px hsl(227 92% 55% / 0.3)',
        'neon-strong': '0 0 60px hsl(227 92% 55% / 0.4)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, hsl(227 92% 55%), hsl(240 80% 65%))",
        "gradient-card": "linear-gradient(135deg, hsl(220 15% 12%), hsl(220 20% 15%))",
      },
      animation: {
        'pulse-neon': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px hsl(227 92% 55% / 0.2)' },
          '100%': { boxShadow: '0 0 40px hsl(227 92% 55% / 0.4)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
