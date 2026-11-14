export const SITE_URL = "https://brunokobi.tech";

export interface RouteMeta {
  title: string;
  description: string;
}

export const ROUTE_META: Record<string, RouteMeta> = {
  "/": {
    title: "Bruno Kobi — Desenvolvedor Full Stack, Agentes de IA e Automação",
    description:
      "Portfólio de Bruno Kobi, desenvolvedor full stack em Serra (ES): agentes de IA, automação com n8n, React, TypeScript e Node.js. Globo 3D ao vivo, o assistente JARVIS com voz e projetos em produção.",
  },
  "/about": {
    title: "Sobre Bruno Kobi — experiência, formação e habilidades",
    description:
      "Quem é Bruno Kobi: desenvolvedor full stack com foco em IA aplicada e automação de processos, experiência na Vennx, formação, habilidades e certificados.",
  },
  "/projects": {
    title: "Projetos de Bruno Kobi — IA, dados abertos, jogos e web",
    description:
      "Projetos em produção: dataset aberto das empresas da Grande Vitória (ES), o assistente JARVIS com voz, o jogo Copa Aspirador em Python, apps React, PWA offline e mais.",
  },
  "/curriculo": {
    title: "Currículo — Bruno Kobi Valadares de Amorim",
    description:
      "Currículo de Bruno Kobi: desenvolvedor full stack com 6+ anos de experiência, IA aplicada, agentes com n8n e LangChain, React, TypeScript e Node.js.",
  },
  "/blog": {
    title: "Blog Dev de Bruno Kobi — bastidores técnicos",
    description:
      "Bastidores técnicos dos meus projetos: o que eu construí, o que quebrou e como resolvi. IA com voz, dados abertos, jogos em Python, globo 3D e infraestrutura própria.",
  },
  "/news": {
    title: "Notícias de IA em tempo real — 54 fontes globais | Bruno Kobi",
    description:
      "Painel com notícias de inteligência artificial de 54 fontes globais (OpenAI, Anthropic, DeepMind, NVIDIA, pesquisa e Brasil), pontuadas por relevância e traduzidas para o português.",
  },
  "/chat": {
    title: "JARVIS — assistente virtual com voz | Bruno Kobi",
    description:
      "Converse com o JARVIS, o assistente do portfólio: responde sobre a carreira e os projetos de Bruno Kobi por texto ou voz, com Whisper e Piper rodando numa VPS própria.",
  },
  "/map": {
    title: "Mapa 3D com ArcGIS | Bruno Kobi",
    description: "Mapa 3D interativo feito com o ArcGIS Maps SDK, com terreno, nuvens e fotos próprias nos marcadores.",
  },
};

export function postTitle(title: string): string {
  return `${title} | Blog Dev Bruno Kobi`;
}

export function canonicalUrl(path: string): string {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

function setMeta(selector: string, attr: string, value: string) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

export function applyRouteMeta(path: string, meta: RouteMeta) {
  document.title = meta.title;
  const url = canonicalUrl(path);
  setMeta('meta[name="description"]', "content", meta.description);
  setMeta('link[rel="canonical"]', "href", url);
  setMeta('meta[property="og:title"]', "content", meta.title);
  setMeta('meta[property="og:description"]', "content", meta.description);
  setMeta('meta[property="og:url"]', "content", url);
  setMeta('meta[name="twitter:title"]', "content", meta.title);
  setMeta('meta[name="twitter:description"]', "content", meta.description);
}
