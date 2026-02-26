import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  integrations: [],
  vite: {
    ssr: {
      external: ['@copyzen/shared'],
    },
  },
});
