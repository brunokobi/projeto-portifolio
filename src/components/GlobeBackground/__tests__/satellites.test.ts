import { afterEach, describe, expect, it, vi } from "vitest";
import { loadSatellites } from "../satellites";

const TLE_DMSP = `DMSP 5D-3 F16 (USA 172)
1 28054U 03048A   26306.16730757  .00000015  00000+0  31486-4 0  9998
2 28054  98.9802 330.8560 0008021 114.1419 288.2151 14.14498377188994
`;

describe("loadSatellites", () => {
  afterEach(() => {
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
});
