import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import ServiceStatus from "../ServiceStatus";

vi.mock("../../../components/TextAudio", () => ({ default: vi.fn() }));

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

beforeEach(() => {
  vi.stubGlobal("Image", MockImage);
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
});
