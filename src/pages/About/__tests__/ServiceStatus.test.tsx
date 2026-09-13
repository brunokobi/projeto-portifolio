import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import ServiceStatus from "../ServiceStatus";

vi.mock("../../../components/TextAudio", () => ({ default: vi.fn() }));

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
  it("mostra 'verificando...' antes do fetch resolver", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    renderStatus();
    expect(screen.getAllByText("verificando...")).toHaveLength(2);
  });

  it("mostra 'online' quando o serviço responde", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({}));
    renderStatus();
    await waitFor(() => expect(screen.getAllByText("online")).toHaveLength(2));
  });

  it("mostra 'offline' quando o fetch falha (rede/timeout)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    renderStatus();
    await waitFor(() => expect(screen.getAllByText("offline")).toHaveLength(2));
  });
});
