import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useTypewriter from "../useTypewriter";

describe("useTypewriter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("começa com string vazia", () => {
    const { result } = renderHook(() => useTypewriter(["Olá"]));
    expect(result.current).toBe("");
  });

  it("digita o primeiro caractere após o delay inicial", async () => {
    const { result } = renderHook(() => useTypewriter(["Olá"], 70));
    await act(() => {
      vi.advanceTimersByTime(70);
    });
    expect(result.current).toBe("O");
  });

  it("digita a string completa", async () => {
    const text = "Oi";
    const { result } = renderHook(() => useTypewriter([text], 10, 10, 100));
    await act(() => {
      vi.advanceTimersByTime(10 * text.length + 50);
    });
    expect(result.current).toBe(text);
  });

  it("retorna vazio para array de strings vazio", () => {
    const { result } = renderHook(() => useTypewriter([]));
    expect(result.current).toBe("");
  });

  it("funciona com múltiplas strings", async () => {
    const { result } = renderHook(() => useTypewriter(["Ab", "Cd"], 10, 10, 50));
    // avança por caracter para garantir flush de estado entre ticks
    await act(() => {
      vi.advanceTimersByTime(10);
    }); // "A"
    await act(() => {
      vi.advanceTimersByTime(10);
    }); // "Ab"
    expect(result.current).toBe("Ab");
  });
});
