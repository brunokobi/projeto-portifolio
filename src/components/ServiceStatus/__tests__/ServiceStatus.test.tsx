import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import ServiceStatus from "..";

vi.mock("../../TextAudio", () => ({ default: vi.fn() }));

type ImgOutcome = "load" | "error" | "pending";
let imgOutcome: ImgOutcome = "pending";

class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private _src = "";
  set src(value: string) {
    this._src = value;
    if (imgOutcome === "load") queueMicrotask(() => this.onload?.());
    if (imgOutcome === "error") queueMicrotask(() => this.onerror?.());
    // "pending": nunca chama nenhum dos dois — simula timeout/travado
  }
  get src() {
    return this._src;
  }
}

const STATS = { empresas: 366995, municipios: 7, processosJudiciais: 4356702, socios: 231890, empresasComPendencia: 114254 };

beforeEach(() => {
  vi.stubGlobal("Image", MockImage);
  vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new TypeError("offline"))));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const renderStatus = () =>
  render(
    <ChakraProvider>
      <ServiceStatus />
    </ChakraProvider>
  );

describe("ServiceStatus", () => {
  it("mostra 'verificando...' antes da imagem carregar", () => {
    imgOutcome = "pending";
    renderStatus();
    expect(screen.getAllByText("verificando...")).toHaveLength(2);
  });

  it("mostra 'online' quando a imagem de ping carrega (onload)", async () => {
    imgOutcome = "load";
    renderStatus();
    await waitFor(() => expect(screen.getAllByText("online")).toHaveLength(2));
  });

  it("mostra 'offline' quando a imagem de ping falha (onerror)", async () => {
    imgOutcome = "error";
    renderStatus();
    await waitFor(() => expect(screen.getAllByText("offline")).toHaveLength(2));
  });

  it("mostra a latência medida e o horário da última checagem", async () => {
    imgOutcome = "load";
    renderStatus();
    await waitFor(() => expect(screen.getAllByText(/^\d+ ms$/)).toHaveLength(2));
    expect(screen.getByText(/Última checagem: \d{2}:\d{2}:\d{2}/)).toBeInTheDocument();
  });

  it("mostra os números do dataset vindos da API", async () => {
    imgOutcome = "load";
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(JSON.stringify(STATS), { status: 200 }))));
    renderStatus();
    expect(await screen.findByText("366.995")).toBeInTheDocument();
    expect(screen.getByText("empresas em 7 municípios")).toBeInTheDocument();
    expect(screen.getByText("4.356.702")).toBeInTheDocument();
  });

  it("não mostra o bloco do dataset quando a API falha", async () => {
    imgOutcome = "load";
    renderStatus();
    await waitFor(() => expect(screen.getAllByText("online")).toHaveLength(2));
    expect(screen.queryByText("Dataset agora, lido da API")).not.toBeInTheDocument();
  });
});
