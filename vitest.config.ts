import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      provider: 'v8',
    },
    // Add TypeScript support
    testTransformMode: {
      web: ['\\.ts$', '\\.tsx$', '\\.js$', '\\.jsx$'],
    },
    // TypeScript configuration
    typecheck: {
      tsconfig: './tsconfig.vitest.json',
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@/test': fileURLToPath(new URL('./test', import.meta.url)),
    },
  },
});
