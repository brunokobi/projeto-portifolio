import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png: { quality: 75 },
      jpg: { quality: 75 },
      jpeg: { quality: 75 },
      webp: { lossless: false, quality: 75 },
      gif: {},
      svg: { plugins: [{ name: "removeViewBox", active: false }] },
      logStats: true,
    }),
  ],
  server: { port: 3000, open: true },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          chakra: ["@chakra-ui/react", "@emotion/react", "@emotion/styled"],
          framer: ["framer-motion"],
          supabase: ["@supabase/supabase-js"],
          intl: ["react-intl"],
        },
      },
    },
  },
  define: { global: "window" },
});
