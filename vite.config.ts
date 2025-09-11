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
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("scheduler")) return "vendor-react";
            if (id.includes("@radix-ui") || id.includes("@tanstack")) return "vendor-ui";
            if (id.includes("habit.app")) return "vendor-habit-app";
            return "vendor";
          }
        },
      },
    },
  },
}));
