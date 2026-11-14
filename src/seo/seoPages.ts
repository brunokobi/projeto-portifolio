import type { Block, Post } from "../pages/DevBlog/posts";
import { EXPERIENCE_ORDER } from "../utils/jarvisProfile";
import { ROUTE_META, SITE_URL, canonicalUrl, postTitle } from "./routeMeta";

export { SITE_URL, canonicalUrl };
export const SITE_NAME = "Bruno Kobi";
export const PERSON_NAME = "Bruno Kobi Valadares de Amorim";
export const DEFAULT_OG_IMAGE = "/og/default.jpg";
export const SEO_DIR = "seo";

export interface SeoPage {
  path: string;
  title: string;
  description: string;
  image: string;
  type: "website" | "article" | "profile";
  jsonLd: Record<string, unknown>[];
  body: string;
  lastmod?: string;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}

interface CurriculoLike {
  headline: string;
  resumo: string;
  destaques: string[];
  formacao: string[];
  competencias: Record<string, string[]>;
}

export interface SeoInput {
  messages: Record<string, string>;
  curriculo: CurriculoLike;
  posts: Post[];
  ogImageFor?: (slug: string) => string | undefined;
}

const NAV_LINKS: [string, string][] = [
  ["/", "Início"],
  ["/about", "Sobre"],
  ["/projects", "Projetos"],
  ["/curriculo", "Currículo"],
  ["/blog", "Blog"],
  ["/news", "Notícias de IA"],
  ["/chat", "JARVIS"],
];

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const INLINE_TOKEN = /\*\*(.+?)\*\*|`(.+?)`|\*(.+?)\*/g;

export function inlineToHtml(text: string): string {
  let out = "";
  let last = 0;
  for (const match of text.matchAll(INLINE_TOKEN)) {
    const start = match.index ?? 0;
    out += escapeHtml(text.slice(last, start));
    const [, bold, code, italic] = match;
    if (bold !== undefined) out += `<strong>${escapeHtml(bold)}</strong>`;
    else if (code !== undefined) out += `<code>${escapeHtml(code)}</code>`;
    else if (italic !== undefined) out += `<em>${escapeHtml(italic)}</em>`;
    last = start + match[0].length;
  }
  return out + escapeHtml(text.slice(last));
}

export function plainText(text: string): string {
  return text.replace(INLINE_TOKEN, (_m, bold, code, italic) => bold ?? code ?? italic ?? "");
}

export function blocksToHtml(blocks: Block[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading":
          return `<h${block.level}>${escapeHtml(block.text)}</h${block.level}>`;
        case "paragraph":
          return `<p>${inlineToHtml(block.text)}</p>`;
        case "list": {
          const tag = block.ordered ? "ol" : "ul";
          return `<${tag}>${block.items.map((item) => `<li>${inlineToHtml(item)}</li>`).join("")}</${tag}>`;
        }
        case "code":
          return `<pre><code>${escapeHtml(block.code)}</code></pre>`;
        case "image":
          return `<figure><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" loading="lazy" />${
            block.caption ? `<figcaption>${inlineToHtml(block.caption)}</figcaption>` : ""
          }</figure>`;
        case "hr":
          return "<hr />";
        default:
          return "";
      }
    })
    .join("\n");
}

function truncate(text: string, max = 160): string {
  const clean = plainText(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

function numbered(messages: Record<string, string>, pattern: RegExp): number[] {
  return Object.keys(messages)
    .map((key) => pattern.exec(key)?.[1])
    .filter((n): n is string => n !== undefined)
    .map(Number)
    .sort((a, b) => b - a);
}

function navHtml(): string {
  return `<nav><ul>${NAV_LINKS.map(([href, label]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`).join(
    ""
  )}</ul></nav>`;
}

function page(title: string, content: string): string {
  return `<main><h1>${escapeHtml(title)}</h1>\n${content}\n</main>\n${navHtml()}`;
}

function personJsonLd(curriculo: CurriculoLike): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: PERSON_NAME,
    alternateName: "Bruno Kobi",
    jobTitle: "Desenvolvedor Full Stack · IA & Automação",
    description: truncate(curriculo.resumo, 300),
    url: SITE_URL,
    image: `${SITE_URL}/avatar.png`,
    address: { "@type": "PostalAddress", addressLocality: "Serra", addressRegion: "ES", addressCountry: "BR" },
    knowsAbout: Object.values(curriculo.competencias).flat(),
    sameAs: ["https://www.linkedin.com/in/brunokobi/", "https://github.com/brunokobi"],
  };
}

const AUTHOR_REF = { "@type": "Person", "@id": `${SITE_URL}/#person`, name: PERSON_NAME, url: SITE_URL };

export function buildSeoPages({ messages, curriculo, posts, ogImageFor }: SeoInput): SeoPage[] {
  const phrases = numbered(messages, /^frase_(\d+)$/)
    .reverse()
    .map((n) => messages[`frase_${n}`]);
  const projects = numbered(messages, /^project(\d+)t$/).map((n) => ({
    title: messages[`project${n}t`].trim(),
    description: (messages[`project${n}d`] ?? "").trim(),
  }));
  const experiences = EXPERIENCE_ORDER.filter((n) => messages[`experiencia${n}t`]).map((n) => ({
    title: messages[`experiencia${n}t`],
    company: messages[`experiencia${n}e`] ?? "",
    description: messages[`experiencia${n}d`] ?? "",
  }));
  const latestPost = posts.reduce<string | undefined>((max, p) => (!max || p.date > max ? p.date : max), undefined);
  const about = ["sobre1", "sobre2", "sobre3"].map((k) => messages[k]).filter(Boolean);

  const pages: SeoPage[] = [
    {
      path: "/",
      ...ROUTE_META["/"],
      image: DEFAULT_OG_IMAGE,
      type: "profile",
      jsonLd: [
        personJsonLd(curriculo),
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          name: SITE_NAME,
          url: SITE_URL,
          inLanguage: "pt-BR",
          author: AUTHOR_REF,
        },
      ],
      body: page(
        PERSON_NAME,
        `<p>${escapeHtml(curriculo.headline)}</p>\n<ul>${phrases.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>\n<p>${escapeHtml(curriculo.resumo)}</p>`
      ),
      lastmod: latestPost,
      changefreq: "weekly",
      priority: 1,
    },
    {
      path: "/about",
      ...ROUTE_META["/about"],
      image: DEFAULT_OG_IMAGE,
      type: "profile",
      jsonLd: [personJsonLd(curriculo)],
      body: page(
        "Sobre",
        [
          ...about.map((t) => `<p>${escapeHtml(t)}</p>`),
          "<h2>Experiência</h2>",
          ...experiences.map(
            (e) => `<h3>${escapeHtml(e.title)}</h3><p>${escapeHtml(e.company)}</p><p>${escapeHtml(e.description)}</p>`
          ),
          "<h2>Formação</h2>",
          `<ul>${curriculo.formacao.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>`,
        ].join("\n")
      ),
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      path: "/projects",
      ...ROUTE_META["/projects"],
      image: DEFAULT_OG_IMAGE,
      type: "website",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Projetos de Bruno Kobi",
          url: `${SITE_URL}/projects`,
          author: AUTHOR_REF,
        },
      ],
      body: page(
        "Projetos",
        projects.map((p) => `<article><h2>${escapeHtml(p.title)}</h2><p>${escapeHtml(p.description)}</p></article>`).join("\n")
      ),
      changefreq: "monthly",
      priority: 0.9,
    },
    {
      path: "/curriculo",
      ...ROUTE_META["/curriculo"],
      image: DEFAULT_OG_IMAGE,
      type: "profile",
      jsonLd: [personJsonLd(curriculo)],
      body: page(
        "Currículo",
        [
          `<p>${escapeHtml(curriculo.headline)}</p>`,
          `<p>${escapeHtml(curriculo.resumo)}</p>`,
          `<ul>${curriculo.destaques.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>`,
          "<h2>Competências</h2>",
          `<ul>${Object.entries(curriculo.competencias)
            .map(([group, items]) => `<li>${escapeHtml(group)}: ${escapeHtml(items.join(", "))}</li>`)
            .join("")}</ul>`,
          "<h2>Formação</h2>",
          `<ul>${curriculo.formacao.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>`,
        ].join("\n")
      ),
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      path: "/blog",
      ...ROUTE_META["/blog"],
      image: DEFAULT_OG_IMAGE,
      type: "website",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Blog Dev de Bruno Kobi",
          url: `${SITE_URL}/blog`,
          inLanguage: "pt-BR",
          author: AUTHOR_REF,
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `${SITE_URL}/blog/${p.slug}`,
            datePublished: p.date,
          })),
        },
      ],
      body: page(
        "Blog Dev",
        posts
          .map(
            (p) =>
              `<article><h2><a href="/blog/${p.slug}">${escapeHtml(p.title)}</a></h2><p><time datetime="${p.date}">${p.date}</time></p><p>${escapeHtml(p.excerpt)}</p></article>`
          )
          .join("\n")
      ),
      lastmod: latestPost,
      changefreq: "weekly",
      priority: 0.8,
    },
    {
      path: "/news",
      ...ROUTE_META["/news"],
      image: DEFAULT_OG_IMAGE,
      type: "website",
      jsonLd: [],
      body: page(
        "Notícias de IA em tempo real",
        "<p>Agregador de 54 feeds RSS sobre inteligência artificial, com pontuação de relevância, filtro de spam, tradução automática e um carrossel com as notícias mais importantes do momento.</p>"
      ),
      changefreq: "daily",
      priority: 0.6,
    },
    {
      path: "/chat",
      ...ROUTE_META["/chat"],
      image: "/og/jarvis-whisper-piper.jpg",
      type: "website",
      jsonLd: [],
      body: page(
        "JARVIS — assistente virtual com voz",
        "<p>Pergunte sobre a carreira, os projetos e as tecnologias de Bruno Kobi. O microfone é transcrito pelo Whisper e a resposta é falada pelo Piper, os dois rodando numa VPS própria; o agente roda no n8n.</p>"
      ),
      changefreq: "monthly",
      priority: 0.6,
    },
    {
      path: "/map",
      ...ROUTE_META["/map"],
      image: DEFAULT_OG_IMAGE,
      type: "website",
      jsonLd: [],
      body: page(
        "Mapa 3D",
        "<p>Mapa 3D interativo com o ArcGIS Maps SDK em WebGL: terreno, nuvens, geolocalização e fotos próprias nos marcadores.</p>"
      ),
      changefreq: "yearly",
      priority: 0.4,
    },
  ];

  for (const post of posts) {
    const image = ogImageFor?.(post.slug) ?? DEFAULT_OG_IMAGE;
    pages.push({
      path: `/blog/${post.slug}`,
      title: postTitle(post.title),
      description: truncate(post.excerpt),
      image,
      type: "article",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: plainText(post.excerpt),
          datePublished: post.date,
          dateModified: post.date,
          inLanguage: "pt-BR",
          keywords: post.tags.join(", "),
          url: `${SITE_URL}/blog/${post.slug}`,
          mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
          image: absoluteUrl(image),
          author: AUTHOR_REF,
          publisher: AUTHOR_REF,
        },
      ],
      body: page(
        post.title,
        `<p><time datetime="${post.date}">${post.date}</time> · ${escapeHtml(post.tags.join(", "))}</p>\n${blocksToHtml(
          post.blocks
        )}\n<p><a href="/blog">Todos os posts</a></p>`
      ),
      lastmod: post.date,
      changefreq: "monthly",
      priority: 0.7,
    });
  }

  return pages;
}

export function absoluteUrl(path: string): string {
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}

export function headTags(p: SeoPage): string {
  const url = canonicalUrl(p.path);
  const image = absoluteUrl(p.image);
  const title = escapeHtml(p.title);
  const description = escapeHtml(p.description);
  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:type" content="${p.type}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ];
  if (p.type === "article" && p.lastmod) tags.push(`<meta property="article:published_time" content="${p.lastmod}" />`);
  for (const data of p.jsonLd) {
    tags.push(`<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`);
  }
  return tags.join("\n    ");
}

const SEO_BLOCK = /<!--seo:start-->[\s\S]*?<!--seo:end-->/;
const ROOT_DIV = /<div id="root"><\/div>/;

export function applySeo(html: string, p: SeoPage): string {
  if (!SEO_BLOCK.test(html) || !ROOT_DIV.test(html)) throw new Error("index.html sem os marcadores de SEO");
  return html
    .replace(SEO_BLOCK, () => `<!--seo:start-->\n    ${headTags(p)}\n    <!--seo:end-->`)
    .replace(ROOT_DIV, () => `<div id="root">${p.body}</div>`);
}

export function seoFileFor(path: string): string | null {
  if (path === "/") return null;
  return `${SEO_DIR}${path}.html`;
}

export function buildRedirects(pages: SeoPage[]): string {
  const lines = [
    "# Endereço oficial: brunokobi.tech",
    `https://brunokobi.netlify.app/* ${SITE_URL}/:splat 301!`,
    "",
    "# Páginas com o HTML de SEO gerado no build",
  ];
  for (const p of pages) {
    const file = seoFileFor(p.path);
    if (file) lines.push(`${p.path} /${file} 200`);
  }
  return `${lines.join("\n")}\n\n`;
}

export function buildSitemap(pages: SeoPage[]): string {
  const urls = pages.map((p) =>
    [
      "  <url>",
      `    <loc>${canonicalUrl(p.path)}</loc>`,
      p.lastmod ? `    <lastmod>${p.lastmod}</lastmod>` : null,
      `    <changefreq>${p.changefreq}</changefreq>`,
      `    <priority>${p.priority.toFixed(1)}</priority>`,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n")
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join(
    "\n"
  )}\n</urlset>\n`;
}
