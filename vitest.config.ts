import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['*.spec.ts'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
});
