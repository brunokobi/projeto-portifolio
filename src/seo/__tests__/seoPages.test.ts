import { describe, expect, it } from "vitest";
import messages from "../../i18n/messages/pt.json";
import { CURRICULO } from "../../data/curriculo";
import { posts } from "../../pages/DevBlog/posts";
import {
  applySeo,
  blocksToHtml,
  buildRedirects,
  buildSeoPages,
  buildSitemap,
  inlineToHtml,
  seoFileFor,
} from "../seoPages";

const pages = buildSeoPages({ messages, curriculo: CURRICULO, posts });
const TEMPLATE =
  '<html><head><!--seo:start--><title>x</title><!--seo:end--></head><body><div id="root"></div></body></html>';

describe("seoPages", () => {
  it("gera uma página por rota e por post, com título e descrição próprios", () => {
    const paths = pages.map((p) => p.path);
    expect(paths).toEqual(expect.arrayContaining(["/", "/about", "/projects", "/blog", "/curriculo"]));
    for (const post of posts) expect(paths).toContain(`/blog/${post.slug}`);
    expect(new Set(pages.map((p) => p.title)).size).toBe(pages.length);
    for (const p of pages) expect(p.description.length).toBeGreaterThan(50);
  });

  it("coloca título, endereço oficial, prévia e o texto da página no HTML", () => {
    const post = pages.find((p) => p.path === `/blog/${posts[0].slug}`)!;
    const html = applySeo(TEMPLATE, post);
    expect(html).toContain(`<link rel="canonical" href="https://brunokobi.tech/blog/${posts[0].slug}" />`);
    expect(html).toContain('<meta property="og:type" content="article" />');
    expect(html).toContain('"@type":"BlogPosting"');
    expect(html).toContain(`<h1>`);
    expect(html).not.toContain("<title>x</title>");
  });

  it("escapa HTML e converte negrito, código e itálico", () => {
    expect(inlineToHtml("**a** `<b>` *c*")).toBe("<strong>a</strong> <code>&lt;b&gt;</code> <em>c</em>");
    expect(blocksToHtml([{ type: "list", ordered: true, items: ["x"] }])).toBe("<ol><li>x</li></ol>");
  });

  it("não fala em mestrando no texto para buscadores", () => {
    for (const p of pages) expect(`${p.body} ${p.description}`.toLowerCase()).not.toContain("mestrando");
  });

  it("redireciona o netlify.app e serve cada rota pelo HTML gerado", () => {
    const redirects = buildRedirects(pages);
    expect(redirects).toContain("https://brunokobi.netlify.app/* https://brunokobi.tech/:splat 301!");
    expect(redirects).toContain("/about /seo/about.html 200");
    expect(seoFileFor("/")).toBeNull();
  });

  it("lista todas as páginas no sitemap com o domínio oficial", () => {
    const xml = buildSitemap(pages);
    expect(xml.match(/<loc>/g)).toHaveLength(pages.length);
    expect(xml).not.toContain("netlify.app");
  });
});
