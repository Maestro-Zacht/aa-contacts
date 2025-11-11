import { defineConfig } from 'i18next-cli';

export default defineConfig({
  locales: [
    "en",
    "de",
    "es",
    "it-it",
    "ko-kr",
    "fr-fr",
    "nl",
    "pl-pl",
    "ru",
    "uk",
    "zh-hans",
    "cs",
    "ja"
  ],
  extract: {
    input: "src/**/*.{js,jsx,ts,tsx}",
    output: "i18n/{{language}}/{{namespace}}.json",
    ignore: [
      'node_modules/**',
      'src/**/*.spec.{js,jsx,ts,tsx}',
      'src/App.tsx'  // Ignore App.tsx as it contains routes
    ],
  }
});