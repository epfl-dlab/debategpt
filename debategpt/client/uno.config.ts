import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  theme: {
    extend: {
      colors: {
        empirica: {
          50: "#fbfcfe",
          100: "#f2f7fd",
          200: "#bcd8f6",
          300: "#8abbef",
          400: "#549ce8",
          500: "#237fe1",
          600: "#1966b8",
          700: "#124b87",
          800: "#0c325a",
          900: "#06192d",
        },
      },
      padding: {
        '15': '3.75rem', // 60px
        '20': '5rem', // 80px
        '25': '6.25rem', // 100px
        '30': '7.5rem', // 120px
      }
    },
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        // ...
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
