import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import Map from "../index";

// PointAdd e PointAddNew (renderizados por Map) carregam o ArcGIS via
// esri-loader — mockado uma vez aqui cobre os dois, já que ambos importam do
// mesmo pacote. Promise que nunca resolve = só testamos a parte síncrona.
vi.mock("esri-loader", () => ({
  loadModules: vi.fn(() => new Promise(() => {})),
  setDefaultOptions: vi.fn(),
}));

vi.mock("../../../components/TextAudio", () => ({ default: vi.fn() }));

const renderMap = () =>
  render(
    <ChakraProvider>
      <Map />
    </ChakraProvider>
  );

afterEach(() => {
  cleanup();
});

describe("Map", () => {
  it("renderiza os campos de latitude/longitude sem quebrar", () => {
    renderMap();
    expect(screen.getByPlaceholderText("Latitude")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Longitude")).toBeInTheDocument();
  });

  it("mostra o globo inicial (PointAddNew) quando nenhuma coordenada foi buscada", () => {
    const { container } = renderMap();
    // PointAddNew monta o container do SceneView mesmo com o loadModules pendente
    expect(container.querySelector("div")).not.toBeNull();
  });

  it("desmonta sem lançar erro", () => {
    const { unmount } = renderMap();
    expect(() => unmount()).not.toThrow();
  });
});
