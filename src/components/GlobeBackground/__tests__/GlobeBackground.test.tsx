import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import { IntlProvider } from "react-intl";
import GlobeBackground from "../index";

// O carregamento real do ArcGIS (esri-loader) faz fetch de módulos externos e
// monta um SceneView WebGL — inviável e desnecessário num teste de unidade.
// Como o próprio efeito guarda `mountedRef` e só monta a cena depois que a
// Promise de loadModules resolve, uma Promise que nunca resolve é suficiente
// pra testar a parte síncrona (o container renderiza, não quebra ao montar
// nem ao desmontar) sem precisar simular a SDK inteira.
vi.mock("esri-loader", () => ({
  loadModules: vi.fn(() => new Promise(() => {})),
  setDefaultOptions: vi.fn(),
}));

const renderGlobe = () =>
  render(
    <IntlProvider locale="pt" messages={{}}>
      <GlobeBackground />
    </IntlProvider>
  );

afterEach(() => {
  cleanup();
});

describe("GlobeBackground", () => {
  it("renderiza o container do globo sem quebrar", () => {
    const { container } = renderGlobe();
    expect(container.querySelector("#globeBgDiv")).not.toBeNull();
  });

  it("renderiza o canvas de overlay dos pins", () => {
    const { container } = renderGlobe();
    expect(container.querySelector("#globeOverlay")).not.toBeNull();
  });

  it("desmonta sem lançar erro (mesmo com o loadModules ainda pendente)", () => {
    const { unmount } = renderGlobe();
    expect(() => unmount()).not.toThrow();
  });
});
