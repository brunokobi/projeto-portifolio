import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";
import NewsPage from "../index";

// translateArticles chamaria a API de tradução do Google via proxy — sem
// sentido num teste de unidade. Mantém o resto do módulo real (parseRSS,
// PROXY, CACHE_TTL) e só troca a tradução por um passthrough.
vi.mock("../../../utils/rss", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../utils/rss")>();
  return {
    ...actual,
    translateArticles: vi.fn((raw: unknown[]) => Promise.resolve(raw)),
  };
});

const MINIMAL_RSS = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Novidade de inteligência artificial de teste</title>
      <link>https://example.com/artigo-teste</link>
      <pubDate>Sun, 13 Sep 2026 12:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

vi.stubGlobal(
  "fetch",
  vi.fn(() => Promise.resolve({ text: () => Promise.resolve(MINIMAL_RSS) }))
);

// CategorySection usa useInView (IntersectionObserver) pra revelar os cards
// com fade-in — não existe no jsdom por padrão.
vi.stubGlobal(
  "IntersectionObserver",
  // Precisa ser function regular (não arrow) pra funcionar com `new`
  vi.fn().mockImplementation(function () {
    return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
  })
);

afterEach(() => {
  cleanup();
});

describe("NewsPage", () => {
  it("carrega os feeds e sai do estado de loading sem quebrar", async () => {
    render(
      <MemoryRouter>
        <ChakraProvider>
          <NewsPage />
        </ChakraProvider>
      </MemoryRouter>
    );

    // Header fixo, renderiza independente do estado de loading
    expect(screen.getByText("IA NEWS")).toBeInTheDocument();

    // Espera o fetch de todos os feeds mockados + o "translate" passthrough
    // resolverem e o spinner (MatrixLoader) sumir.
    await waitFor(() => expect(screen.queryByText(/CARREGANDO FEEDS/)).toBeNull(), {
      timeout: 10000,
    });
  });
});
