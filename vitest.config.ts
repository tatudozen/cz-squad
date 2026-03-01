import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './packages/shared/src'),
      '@api': path.resolve(__dirname, './apps/api/src'),
      '@pages': path.resolve(__dirname, './apps/pages/src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['apps/**/*.test.ts', 'packages/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    setupFiles: ['./vitest.setup.ts'],
    hookTimeout: 30000,
    teardownTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'apps/*/dist/',
        'packages/*/dist/',
        '**/*.test.ts',
      ],
    },
  },
});
