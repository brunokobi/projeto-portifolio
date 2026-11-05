import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import type { PluginConfig } from "svgo";
import { readFileSync } from "node:fs";
import type { Plugin } from "vite";
import messages from "./src/i18n/messages/pt.json";
import { CURRICULO } from "./src/data/curriculo";
import { JARVIS_PROFILE_PATH, buildJarvisProfile, extractSkillLabels } from "./src/utils/jarvisProfile";

// O @types do svgo 4.x tem um bug conhecido: o branch "preset-default" da
// union de PluginConfig (mapped type indexado por [keyof ...]) não é
// discriminado corretamente e o TS cai pro branch CustomPlugin (exigindo
// `fn`). Runtime aceita esse shape normalmente (é o próprio exemplo do JSDoc
// do tipo) — cast pontual documentado em vez de reescrever a config.
const svgoPlugins = [
  { name: "preset-default", params: { overrides: { removeViewBox: false } } },
] as PluginConfig[];

// Perfil que o workflow do JARVIS no n8n busca em /jarvis/perfil.md para responder.
function jarvisProfile(): Plugin {
  const render = () =>
    buildJarvisProfile({
      messages,
      curriculo: CURRICULO,
      skills: extractSkillLabels(readFileSync("src/pages/About/skills.ts", "utf8")),
    });

  return {
    name: "jarvis-profile",
    configureServer(server) {
      server.middlewares.use(`/${JARVIS_PROFILE_PATH}`, (_req, res) => {
        res.setHeader("Content-Type", "text/markdown; charset=utf-8");
        res.end(render());
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: JARVIS_PROFILE_PATH, source: render() });
    },
  };
}

export default defineConfig({
  plugins: [react(), jarvisProfile(), ViteImageOptimizer({
    png: { quality: 75 },
    jpg: { quality: 75 },
    jpeg: { quality: 75 },
    webp: { lossless: false, quality: 75 },
    gif: {},
    svg: { plugins: svgoPlugins },
    logStats: true,
  })],
  server: { port: 3000, open: true },
  build: {
    outDir: "dist",
    sourcemap: false,
    // Minifica espaços e sintaxe, mas não renomeia identificadores: a renomeação
    // causava "Cannot access X before initialization" no hover do globo.
    minify: "esbuild",
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
  esbuild: { loader: "tsx", include: /src\/.*\.tsx?$/, exclude: [], minifyIdentifiers: false },
  optimizeDeps: { esbuildOptions: { loader: { ".tsx": "tsx" } } },
  define: { global: "window" },
});
