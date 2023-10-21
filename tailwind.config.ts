import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      colors: {
        "neutral": {
          '50': 'var(--neutral-50)',
          '100': 'var(--neutral-100)',
          '200': 'var(--neutral-200)',
          '700': 'var(--neutral-700)',
          '900': 'var(--neutral-900)',
        },
        "red": {
          '400': 'var(--red-400)'
        },
        "yellow": {
          '500': 'var(--yellow-500)'
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
