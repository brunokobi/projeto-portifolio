import { isStaleChunkError, reloadOnceForStaleChunk } from "../staleChunk";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

describe("isStaleChunkError", () => {
  it("reconhece falha de chunk dinâmico no Chrome, Safari e Firefox", () => {
    expect(isStaleChunkError(new TypeError("Failed to fetch dynamically imported module: https://x/assets/a.js"))).toBe(true);
    expect(isStaleChunkError(new TypeError("Importing a module script failed."))).toBe(true);
    expect(isStaleChunkError(new TypeError("error loading dynamically imported module"))).toBe(true);
  });

  it("ignora outros erros", () => {
    expect(isStaleChunkError(new Error("Cannot read properties of undefined"))).toBe(false);
    expect(isStaleChunkError(undefined)).toBe(false);
  });
});

describe("reloadOnceForStaleChunk", () => {
  it("recarrega na primeira falha e não repete dentro de 10s", () => {
    const storage = memoryStorage();
    const reload = vi.fn();

    expect(reloadOnceForStaleChunk({ storage, reload, now: 1_000_000 })).toBe(true);
    expect(reloadOnceForStaleChunk({ storage, reload, now: 1_005_000 })).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);

    expect(reloadOnceForStaleChunk({ storage, reload, now: 1_020_000 })).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it("não recarrega se o storage estiver bloqueado", () => {
    const reload = vi.fn();
    const storage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => undefined,
    };
    expect(reloadOnceForStaleChunk({ storage, reload, now: 1 })).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});
