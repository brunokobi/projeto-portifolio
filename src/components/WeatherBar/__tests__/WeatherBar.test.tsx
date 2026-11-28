import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import WeatherBar from "../index";
import { markGlobeReady, resetGlobeReady } from "../../../utils/globeReady";

vi.mock("../../../utils/geoip", () => ({
  getGeoIP: vi.fn(() =>
    Promise.resolve({
      city: "Curitiba",
      country_code: "BR",
      latitude: -25.4,
      longitude: -49.27,
    })
  ),
}));

vi.mock("../../TextAudio", () => ({ default: vi.fn() }));

const METEO_OK = {
  current: { temperature_2m: 22, weather_code: 0 },
};

const renderBar = (waitForGlobe = false) =>
  render(
    <ChakraProvider>
      <WeatherBar waitForGlobe={waitForGlobe} />
    </ChakraProvider>
  );

afterEach(() => {
  vi.unstubAllGlobals();
  resetGlobeReady();
});

describe("WeatherBar", () => {
  it("não mostra o clima enquanto o fetch está pendente", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    renderBar();
    expect(screen.queryByText(/°C/)).toBeNull();
  });

  it("renderiza a temperatura após fetch resolver", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: () => Promise.resolve(METEO_OK) })
    );
    renderBar();
    await waitFor(() => expect(screen.getByText(/22°C/)).toBeInTheDocument());
  });

  it("renderiza o nome da cidade", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: () => Promise.resolve(METEO_OK) })
    );
    renderBar();
    await waitFor(() => expect(screen.getByText(/Curitiba/)).toBeInTheDocument());
  });

  it("não mostra o clima quando o fetch falha", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    renderBar();
    await waitFor(() => expect(screen.queryByText(/°C/)).toBeNull());
  });

  it("não mostra o clima quando a API retorna sem temperature_2m", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: () => Promise.resolve({ current: {} }) })
    );
    renderBar();
    await waitFor(() => expect(screen.queryByText(/°C/)).toBeNull());
  });

  it("renderiza corretamente com código WMO de chuva (63)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ current: { temperature_2m: 18, weather_code: 63 } }),
      })
    );
    renderBar();
    await waitFor(() => expect(screen.getByText(/18°C/)).toBeInTheDocument());
  });

  it("mostra os botões das camadas mesmo quando o clima falha", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    renderBar();
    expect(screen.getByTitle("Desativar satélites")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/°C/)).toBeNull());
  });

  it("na Home espera o globo carregar e então aparece sem esperar o clima", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    renderBar(true);
    expect(screen.queryByTitle("Desativar satélites")).toBeNull();

    act(() => markGlobeReady());

    expect(screen.getByTitle("Desativar satélites")).toBeInTheDocument();
    expect(screen.queryByText(/°C/)).toBeNull();
  });

  describe("no celular", () => {
    const original = window.matchMedia;
    const mobileMatchMedia = (query: string) => ({
      ...original(query),
      matches: /min-width:\s*0/.test(query),
    });

    afterEach(() => {
      window.matchMedia = original;
    });

    it("fora da Home mostra só o clima, sem as camadas do globo", async () => {
      window.matchMedia = mobileMatchMedia;
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: () => Promise.resolve(METEO_OK) }));
      renderBar();
      await waitFor(() => expect(screen.getByText(/22°C/)).toBeInTheDocument());
      expect(screen.queryByLabelText("Camadas do globo")).toBeNull();
      expect(screen.queryByTitle("Desativar satélites")).toBeNull();
    });

    it("fora da Home não deixa caixa vazia quando o clima falha", async () => {
      window.matchMedia = mobileMatchMedia;
      const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
      vi.stubGlobal("fetch", fetchMock);
      const { container } = renderBar();
      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      await act(async () => {});
      expect(container.querySelector('[style*="weatherFadeIn"]')).toBeNull();
      expect(screen.queryByText(/°C/)).toBeNull();
    });

    it("na Home junta as camadas num botão que abre a lista", async () => {
      window.matchMedia = mobileMatchMedia;
      vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
      renderBar(true);
      act(() => markGlobeReady());

      const button = screen.getByLabelText("Camadas do globo");
      expect(screen.queryByTitle("Desativar satélites")).toBeNull();

      act(() => button.click());

      const satellites = await screen.findByRole("button", { name: /Satélites/ });
      expect(satellites).toHaveAttribute("aria-pressed", "true");
      act(() => satellites.click());
      expect(satellites).toHaveAttribute("aria-pressed", "false");
    });
  });
});
