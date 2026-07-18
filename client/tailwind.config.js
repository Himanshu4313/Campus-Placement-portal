/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#4F46E5', // Indigo 600
          foreground: '#FFFFFF',
          hover: '#4338CA',
        },
        secondary: {
          DEFAULT: '#7C3AED', // Violet 600
          foreground: '#FFFFFF',
          hover: '#6D28D9',
        },
        accent: {
          DEFAULT: '#06B6D4', // Cyan 500
          foreground: '#0F172A',
          hover: '#0891B2',
        },
        success: {
          DEFAULT: '#22C55E', // Green 500
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#F59E0B', // Amber 500
          foreground: '#FFFFFF',
        },
        danger: {
          DEFAULT: '#EF4444', // Red 500
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(79, 70, 229, 0.08), 0 2px 8px -1px rgba(0, 0, 0, 0.04)',
        'premium-hover': '0 12px 30px -4px rgba(79, 70, 229, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
