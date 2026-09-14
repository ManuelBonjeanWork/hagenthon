import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    // I worktree degli agent contengono copie complete del repo, test inclusi:
    // senza questa esclusione vitest li raccoglie e fallisce su codice di altri branch.
    exclude: ['**/node_modules/**', '**/dist/**', '.claude/**'],
  },
})
