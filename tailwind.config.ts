import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        serif: ["var(--font-serif)", ...fontFamily.serif],
      },
      colors: {
        neutral: {
          "50": "hsl(var(--neutral-50))",
          "100": "hsl(var(--neutral-100))",
          "200": "hsl(var(--neutral-200))",
          "700": "hsl(var(--neutral-700))",
          "900": "hsl(var(--neutral-900))",
        },
        red: {
          "400": "hsl(var(--red-400))",
        },
        yellow: {
          "500": "hsl(var(--yellow-500))",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
