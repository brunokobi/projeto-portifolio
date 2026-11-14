import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useTypewriter from "../useTypewriter";

const advance = async (ms: number) => {
  await act(() => {
    vi.advanceTimersByTime(ms);
  });
};

const advanceSteps = async (steps: number, ms: number) => {
  for (let i = 0; i < steps; i++) await advance(ms);
};

describe("useTypewriter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("começa com string vazia", () => {
    const { result } = renderHook(() => useTypewriter(["Olá"]));
    expect(result.current).toEqual({ text: "", index: 0 });
  });

  it("digita o primeiro caractere após o delay inicial", async () => {
    const { result } = renderHook(() => useTypewriter(["Olá"], { speed: 70 }));
    await advance(70);
    expect(result.current.text).toBe("O");
  });

  it("retorna vazio para array de strings vazio", () => {
    const { result } = renderHook(() => useTypewriter([]));
    expect(result.current.text).toBe("");
  });

  it("segura a frase inteira pelo tempo de pausa antes de apagar", async () => {
    const { result } = renderHook(() =>
      useTypewriter(["Ab", "Cd"], { speed: 10, deleteSpeed: 10, pauseMs: 100, gapMs: 50 })
    );
    await advanceSteps(2, 10);
    expect(result.current.text).toBe("Ab");
    await advance(90);
    expect(result.current.text).toBe("Ab");
    await advance(10);
    expect(result.current.text).toBe("A");
  });

  it("deixa a linha vazia pelo intervalo antes de digitar a próxima frase", async () => {
    const { result } = renderHook(() =>
      useTypewriter(["Ab", "Cd"], { speed: 10, deleteSpeed: 10, pauseMs: 100, gapMs: 50 })
    );
    await advanceSteps(2, 10);
    await advance(100);
    await advance(10);
    expect(result.current.text).toBe("");
    await advance(40);
    expect(result.current.text).toBe("");
    await advance(10);
    expect(result.current).toEqual({ text: "C", index: 1 });
  });

  it("não apaga a frase enquanto estiver pausado", async () => {
    const { result, rerender } = renderHook(
      ({ paused }) => useTypewriter(["Ab"], { speed: 10, deleteSpeed: 10, pauseMs: 100, paused }),
      { initialProps: { paused: true } }
    );
    await advanceSteps(2, 10);
    await advance(2000);
    expect(result.current.text).toBe("Ab");
    rerender({ paused: false });
    await advance(300);
    expect(result.current.text).not.toBe("Ab");
  });
});
