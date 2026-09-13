import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import type { PluginConfig } from "svgo";

// O @types do svgo 4.x tem um bug conhecido: o branch "preset-default" da
// union de PluginConfig (mapped type indexado por [keyof ...]) não é
// discriminado corretamente e o TS cai pro branch CustomPlugin (exigindo
// `fn`). Runtime aceita esse shape normalmente (é o próprio exemplo do JSDoc
// do tipo) — cast pontual documentado em vez de reescrever a config.
const svgoPlugins = [
  { name: "preset-default", params: { overrides: { removeViewBox: false } } },
] as PluginConfig[];

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png: { quality: 75 },
      jpg: { quality: 75 },
      jpeg: { quality: 75 },
      webp: { lossless: false, quality: 75 },
      gif: {},
      svg: { plugins: svgoPlugins },
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
