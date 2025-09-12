import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
  // Silence node built-in imports in browser builds (from deps like habit.app)
  fs: path.resolve(__dirname, "./src/shims/empty.ts"),
  path: path.resolve(__dirname, "./src/shims/empty.ts"),
  "node:fs": path.resolve(__dirname, "./src/shims/empty.ts"),
  "node:path": path.resolve(__dirname, "./src/shims/empty.ts"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React et dépendances core doivent être chargées en premier
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // UI components qui dépendent de React
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            // Notre app de gestion d'habitudes
            if (id.includes('habit.app')) {
              return 'vendor-app';
            }
            return 'vendor';
          }
        },
      },
    },
  },
}));
