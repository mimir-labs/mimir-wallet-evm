const { nextui } = require("@nextui-org/react");
const defaultConfig = require('tailwindcss/defaultConfig')

/** @type {import('tailwindcss/types').Config} */
const config = {
  content: [
    'index.html',
    'src/**/*.tsx',
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Sofia Sans Semi Condensed"', ...defaultConfig.theme.fontFamily.sans]
      },
      backgroundImage: {
        'main-background': 'linear-gradient(245deg, #F4F2FF 0%, #FBFDFF 100%)'
      },
      height: {
        'sidebar-height': 'calc(100vh - 1px - var(--nextui-spacing-unit)*16)'
      }
    },
  },
  darkMode: "class",
  plugins: [nextui({
    layout: {
      spacingUnit: 4,
      dividerWeight: 1,
      radius: {
        small: '5px',
        medium: '10px',
        large: '15px'
      },
      boxShadow: {
        small: '0px 0px 6px 0px rgba(21, 31, 52, 0.04)',
        medium: '0px 0px 10px 0px rgba(21, 31, 52, 0.06)',
        medium: '0px 0px 14px 0px rgba(21, 31, 52, 0.08)'
      }
    },
    themes: {
      light: {
        extend: 'light',
        colors: {
          foreground: {DEFAULT: '#151F34'},
          divider: {DEFAULT: '#F4F0FF'},
          primary: {
            50: '#F4F0FF',
            100: '#EEE8FF',
            200: '#CEBFFF',
            300: '#AB96FF',
            400: '#866EFF',
            500: '#5F45FF',
            600: '#4130D9',
            700: '#281EB3',
            800: '#15118C',
            900: '#0B0B66',
            foreground: '#FFF',
            DEFAULT: '#5F45FF'
          },
          secondary: {
            foreground: '#151F34',
            DEFAULT: '#F4F0FF'
          },
          success: {
            foreground: '#FFF',
            DEFAULT: '#00DBA6'
          },
          warning: {
            foreground: '#FFF',
            DEFAULT: '#FF8D07'
          },
          danger: {
            foreground: '#FFF',
            DEFAULT: '#E82F5E'
          },
        }
      }
    }
  })],
  experimental: { optimizeUniversalDefaults: true },
}
module.exports = config