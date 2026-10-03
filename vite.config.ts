import { defineConfig } from 'vitest/config'

/**
 * Built as an IIFE so a host site can load it with a plain script tag on any
 * page, with no module support or bundler required.
 *
 * The same config drives the test runner, which needs a DOM because almost
 * everything this widget does is read or write the host document.
 */
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'QuickCasaAccessibility',
      fileName: () => 'accessibility.js',
      formats: ['iife'],
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
  },
})
