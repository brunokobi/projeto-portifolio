import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import WeatherBar from "../index";

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

const renderBar = () =>
  render(
    <ChakraProvider>
      <WeatherBar />
    </ChakraProvider>
  );

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("WeatherBar", () => {
  it("não renderiza nada enquanto o fetch está pendente", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    renderBar();
    // ChakraProvider injeta um span interno — verificamos que o conteúdo do WeatherBar não apareceu
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

  it("não renderiza nada quando o fetch falha", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    renderBar();
    await waitFor(() => expect(screen.queryByText(/°C/)).toBeNull());
  });

  it("não renderiza nada quando a API retorna sem temperature_2m", async () => {
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
});
