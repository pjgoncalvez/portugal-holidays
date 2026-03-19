import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{js,ts}'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.{js,ts}',
        '**/*.spec.{js,ts}',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '../dist/index.mjs': '/src/index.ts',
    },
  },
});
