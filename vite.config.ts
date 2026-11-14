import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import type { PluginConfig } from "svgo";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Plugin, UserConfig } from "vite";
import messages from "./src/i18n/messages/pt.json";
import { CURRICULO } from "./src/data/curriculo";
import { JARVIS_PROFILE_PATH, buildJarvisProfile, extractSkillLabels } from "./src/utils/jarvisProfile";
import { posts } from "./src/pages/DevBlog/posts";
import { applySeo, buildRedirects, buildSeoPages, buildSitemap, seoFileFor } from "./src/seo/seoPages";
import { FALLBACK_COUNTS, datasetValues, fillDatasetNumbers, type DatasetCounts } from "./src/data/datasetNumbers";
import { EMPRESAS_STATS_URL, parseDatasetStats } from "./netlify/lib/infraStats";

// O @types do svgo 4.x tem um bug conhecido: o branch "preset-default" da
// union de PluginConfig (mapped type indexado por [keyof ...]) não é
// discriminado corretamente e o TS cai pro branch CustomPlugin (exigindo
// `fn`). Runtime aceita esse shape normalmente (é o próprio exemplo do JSDoc
// do tipo) — cast pontual documentado em vez de reescrever a config.
const svgoPlugins = [
  { name: "preset-default", params: { overrides: { removeViewBox: false } } },
] as PluginConfig[];

// Números do dataset da Grande Vitória lidos da API no build, para os textos do site
// (Home, projetos, perfil do JARVIS e páginas de SEO) saírem sempre atualizados.
async function fetchDatasetCounts(): Promise<DatasetCounts> {
  try {
    const res = await fetch(EMPRESAS_STATS_URL, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`estatisticas respondeu ${res.status}`);
    const stats = parseDatasetStats(await res.json());
    if (!stats) throw new Error("estatisticas em formato inesperado");
    return { empresas: stats.empresas, socios: stats.socios, processos: stats.processosJudiciais };
  } catch (err) {
    console.warn(`[dataset] usando os números guardados no código: ${String(err)}`);
    return FALLBACK_COUNTS;
  }
}

function withDatasetNumbers(source: Record<string, string>, counts: DatasetCounts): Record<string, string> {
  const values = datasetValues("pt", counts);
  return Object.fromEntries(Object.entries(source).map(([key, text]) => [key, fillDatasetNumbers(text, values)]));
}

// Perfil que o workflow do JARVIS no n8n busca em /jarvis/perfil.md para responder.
function jarvisProfile(messages: Record<string, string>): Plugin {
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

// HTML de cada rota e de cada post com título, descrição, prévia e o texto da página,
// para buscadores e prévias de link lerem sem rodar JavaScript; mais o sitemap e os
// redirecionamentos (_redirects) que servem esses arquivos.
function seoPages(messages: Record<string, string>): Plugin {
  let outDir = "dist";
  return {
    name: "seo-pages",
    apply: "build",
    enforce: "post",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const indexPath = join(outDir, "index.html");
      const template = readFileSync(indexPath, "utf8");
      const pages = buildSeoPages({
        messages,
        curriculo: CURRICULO,
        posts,
        ogImageFor: (slug) => (existsSync(`public/og/${slug}.jpg`) ? `/og/${slug}.jpg` : undefined),
      });
      for (const page of pages) {
        const file = seoFileFor(page.path);
        const target = file ? join(outDir, file) : indexPath;
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, applySeo(template, page));
      }
      writeFileSync(join(outDir, "sitemap.xml"), buildSitemap(pages));
      const redirectsPath = join(outDir, "_redirects");
      const existing = existsSync(redirectsPath) ? readFileSync(redirectsPath, "utf8") : "";
      writeFileSync(redirectsPath, buildRedirects(pages) + existing);
    },
  };
}

export default defineConfig(async (): Promise<UserConfig> => {
  const counts = await fetchDatasetCounts();
  const filledMessages = withDatasetNumbers(messages, counts);
  return {
  plugins: [react(), jarvisProfile(filledMessages), seoPages(filledMessages), ViteImageOptimizer({
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
  define: { global: "window", __DATASET_COUNTS__: JSON.stringify(counts) },
  };
});
