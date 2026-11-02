import { afterEach, describe, expect, it, vi } from "vitest";
import { loadSatellites, resetSatelliteCache } from "../satellites";

const TLE_DMSP = `DMSP 5D-3 F16 (USA 172)
1 28054U 03048A   26306.16730757  .00000015  00000+0  31486-4 0  9998
2 28054  98.9802 330.8560 0008021 114.1419 288.2151 14.14498377188994
`;

describe("loadSatellites", () => {
  afterEach(() => {
    resetSatelliteCache();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("recalcula a posição a cada chamada usando o TLE em cache", async () => {
    const fetchMock = vi.fn((url: string) =>
      Promise.resolve(new Response(url.includes("GROUP=weather") ? TLE_DMSP : "", { status: 200 }))
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.useFakeTimers({ toFake: ["Date"] });

    vi.setSystemTime(new Date("2026-11-02T12:00:00Z"));
    const [antes] = await loadSatellites();

    vi.setSystemTime(new Date("2026-11-02T12:10:00Z"));
    const [depois] = await loadSatellites();

    expect(antes.name).toBe("DMSP 5D-3 F16 (USA 172)");
    expect(antes.type).toBe("weather");
    expect(antes.altitude).toBeGreaterThan(700);
    expect(antes.altitude).toBeLessThan(900);
    const deslocamento = Math.hypot(depois.lat - antes.lat, depois.lon - antes.lon);
    expect(deslocamento).toBeGreaterThan(10);
    expect(fetchMock.mock.calls.filter(([u]) => u.includes("GROUP=weather"))).toHaveLength(1);
  });

  it("depois de uma falha espera 30 min antes de pedir de novo ao CelesTrak", async () => {
    const fetchMock = vi.fn(() => Promise.reject(new TypeError("Failed to fetch")));
    vi.stubGlobal("fetch", fetchMock);
    vi.useFakeTimers({ toFake: ["Date"] });

    vi.setSystemTime(new Date("2026-11-02T12:00:00Z"));
    expect(await loadSatellites()).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(3);

    vi.setSystemTime(new Date("2026-11-02T12:29:00Z"));
    await loadSatellites();
    expect(fetchMock).toHaveBeenCalledTimes(3);

    vi.setSystemTime(new Date("2026-11-02T12:31:00Z"));
    await loadSatellites();
    expect(fetchMock).toHaveBeenCalledTimes(6);
  });

  it("faz um pedido só por grupo quando há chamadas simultâneas", async () => {
    const fetchMock = vi.fn((url: string) =>
      Promise.resolve(new Response(url.includes("GROUP=weather") ? TLE_DMSP : "", { status: 200 }))
    );
    vi.stubGlobal("fetch", fetchMock);

    await Promise.all([loadSatellites(), loadSatellites(), loadSatellites()]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("reaproveita o TLE salvo no localStorage depois de recarregar a página", async () => {
    const fetchMock = vi.fn((url: string) =>
      Promise.resolve(new Response(url.includes("GROUP=weather") ? TLE_DMSP : "", { status: 200 }))
    );
    vi.stubGlobal("fetch", fetchMock);
    await loadSatellites();
    const salvo = localStorage.getItem("celestrak-tle:weather");
    expect(salvo).toContain("DMSP 5D-3 F16");

    resetSatelliteCache();
    localStorage.setItem("celestrak-tle:weather", salvo!);
    fetchMock.mockClear();

    const [sat] = await loadSatellites();
    expect(sat.name).toBe("DMSP 5D-3 F16 (USA 172)");
    expect(fetchMock.mock.calls.filter(([u]) => u.includes("GROUP=weather"))).toHaveLength(0);
  });
});
