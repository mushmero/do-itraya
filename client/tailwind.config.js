/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        primary: "#0a0e27", // Deep Navy Blue
        secondary: "#141b2d", // Rich Dark Blue
        tertiary: "#1f2937", // Slate Blue
        accent: "#fbbf24", // Warm Gold
        "accent-hover": "#f59e0b", // Deeper Gold
        danger: "#ef4444", // Red 500
        success: "#10b981", // Emerald 500
        info: "#3b82f6", // Blue 500

        // Light theme colors
        "light-primary": "#f8fafc", // Slate 50
        "light-secondary": "#f1f5f9", // Slate 100
        "light-tertiary": "#e2e8f0", // Slate 200
        "light-text": "#0f172a", // Slate 900
        "light-text-secondary": "#475569", // Slate 600

        // Extended gradient palette
        "gold-light": "#fcd34d",
        "gold-dark": "#d97706",
        "emerald-light": "#34d399",
        "emerald-dark": "#059669",
        "blue-light": "#60a5fa",
        "blue-dark": "#1e40af",
        "purple-light": "#a78bfa",
        "purple-dark": "#6d28d9",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "festive-gradient":
          "linear-gradient(135deg, #0a0e27 0%, #1e3a8a 50%, #312e81 100%)",
        "gradient-mesh":
          "radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(251, 191, 36, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(139, 92, 246, 0.15) 0px, transparent 50%)",
        "gold-gradient":
          "linear-gradient(135deg, #fcd34d 0%, #fbbf24 50%, #f59e0b 100%)",
        "emerald-gradient":
          "linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)",
        "blue-gradient":
          "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1e40af 100%)",
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        countUp: "countUp 1s ease-out forwards",
        "spin-slow": "spin 3s linear infinite",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        pop: "pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(251, 191, 36, 0.3)" },
          "100%": { boxShadow: "0 0 30px rgba(251, 191, 36, 0.6)" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)" },
          "100%": { transform: "translateY(0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glow-sm": "0 0 10px rgba(251, 191, 36, 0.3)",
        "glow-md": "0 0 20px rgba(251, 191, 36, 0.4)",
        "glow-lg": "0 0 30px rgba(251, 191, 36, 0.5)",
        "emerald-glow": "0 0 20px rgba(16, 185, 129, 0.4)",
        "blue-glow": "0 0 20px rgba(59, 130, 246, 0.4)",
      },
      animationDelay: {
        0: "0ms",
        75: "75ms",
        100: "100ms",
        150: "150ms",
        200: "200ms",
        300: "300ms",
        500: "500ms",
        700: "700ms",
        1000: "1000ms",
      },
    },
  },
  plugins: [],
};
