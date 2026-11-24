import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      app: fileURLToPath(new URL('./src/app', import.meta.url)),
      '#imports': fileURLToPath(
        new URL('./test/mocks/nuxtImports.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'node',
    include: ['test/unit/**/*.spec.ts'],
  },
});
