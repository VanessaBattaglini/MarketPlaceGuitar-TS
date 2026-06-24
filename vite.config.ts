import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Nota: Configuración de vitest se define en vite.config.ts pero
  // TypeScript necesita que inferir el tipo desde getViteConfig.
  // Para desarrollo local, la config de tests está disponible en runtime.
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
} as any)
