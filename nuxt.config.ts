import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxt/eslint'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
    },
  },
  dir: {
    app: 'src/app',
    pages: 'src/app',
    plugins: 'src/app/plugins',
    layouts: 'src/app/layouts',
    middleware: 'src/app/middleware',
  },
  imports: {
    autoImport: false,
  },
  alias: {
    app: fileURLToPath(new URL('./src/app', import.meta.url)),
    pages: fileURLToPath(new URL('./src/pages', import.meta.url)),
    widgets: fileURLToPath(new URL('./src/widgets', import.meta.url)),
    shared: fileURLToPath(new URL('./src/shared', import.meta.url)),
    entities: fileURLToPath(new URL('./src/entities', import.meta.url)),
  },
  typescript: {
    strict: true,
  },
  css: ['~/src/assets/main.css'],
});
