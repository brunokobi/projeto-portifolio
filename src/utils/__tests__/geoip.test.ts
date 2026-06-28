import { describe, it, expect, vi, beforeEach } from "vitest";

describe("getGeoIP", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("faz fetch para ipapi.co e retorna os dados da resposta", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ city: "São Paulo", country_code: "BR", latitude: -23.5, longitude: -46.6 }),
      })
    );
    const { getGeoIP } = await import("../geoip");
    const result = await getGeoIP();
    expect(result.city).toBe("São Paulo");
    expect(result.country_code).toBe("BR");
    expect(fetch).toHaveBeenCalledWith("https://ipapi.co/json/");
  });

  it("retorna objeto vazio quando a requisição falha", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
    const { getGeoIP } = await import("../geoip");
    const result = await getGeoIP();
    expect(result).toEqual({});
  });

  it("reutiliza a mesma promise em chamadas repetidas (cache de módulo)", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ city: "Belo Horizonte" }),
    });
    vi.stubGlobal("fetch", mockFetch);
    const { getGeoIP } = await import("../geoip");
    const p1 = getGeoIP();
    const p2 = getGeoIP();
    expect(p1).toBe(p2);
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("retorna latitude e longitude corretamente", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ latitude: -15.77, longitude: -47.9, city: "Brasília", country_code: "BR" }),
      })
    );
    const { getGeoIP } = await import("../geoip");
    const result = await getGeoIP();
    expect(result.latitude).toBe(-15.77);
    expect(result.longitude).toBe(-47.9);
  });
});
