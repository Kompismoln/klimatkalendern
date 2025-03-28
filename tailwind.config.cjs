module.exports = {
  content: ["./public/**/*.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "var(--custom-primary, #1e7d97)",
        secondary: "var(--custom-secondary, #ffd599)",
        "violet-title": "#3c376e",
        tag: "rgb(var(--color-tag) / <alpha-value>)",
        "frama-violet": "#725794",
        "frama-orange": "#cc4e13",
        "mbz-yellow": {
          DEFAULT: "#f2f2f2",
          50: "#d9d9d9",
          100: "#e5e5e5",
          200: "#f2f2f2",
          300: "#ffffff",
          400: "#cccccc",
          500: "#bfbfbf",
          600: "#b3b3b3",
          700: "#a6a6a6",
          800: "#999999",
          900: "#8c8c8c",
        },
        "mbz-yellow-alt": {
          DEFAULT: "#f2f2f2",
          50: "#d9d9d9",
          100: "#e5e5e5",
          200: "#f2f2f2",
          300: "#ffffff",
          400: "#cccccc",
          500: "#bfbfbf",
          600: "#b3b3b3",
          700: "#a6a6a6",
          800: "#999999",
          900: "#8c8c8c",
        },
        "mbz-purple": {
          DEFAULT: "#424056",
          50: "#CAC9D7",
          100: "#BEBDCE",
          200: "#A8A6BC",
          300: "#918EAB",
          400: "#7A779A",
          500: "#666385",
          600: "#54516D",
          700: "#424056",
          800: "#292836",
          900: "#111016",
        },
        "mbz-bluegreen": {
          DEFAULT: "#1E7D97",
          50: "#86D2E7",
          100: "#75CCE4",
          200: "#53BFDD",
          300: "#31B2D6",
          400: "#2599B9",
          500: "#1E7D97",
          600: "#155668",
          700: "#0B3039",
          800: "#02090B",
          900: "#000000",
        },
        "violet-1": "#3a384c",
        "violet-2": "#474467",
        "violet-3": "#3c376e",
        "yellow-1": "#ffd599",
        "yellow-2": "#fff1de",
        "body-background-color": "#efeef4",
        "purple-1": "#757199",
        "purple-2": "#cdcaea",
        "purple-3": "#e6e4f4",
        "mbz-info": "rgb(74, 222, 128)",
        "mbz-danger": "#cd2026",
        "mbz-success": "#0d8758",
        "mbz-warning": "#ffe08a",
        // primary: "#272633",
        // secondary: "#ED8D07",
      },
      lineClamp: {
        10: "10",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
