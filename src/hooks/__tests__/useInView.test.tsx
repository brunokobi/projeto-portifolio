import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { useInView } from "../useInView";

type ObsCb = (entries: Partial<IntersectionObserverEntry>[]) => void;
let observerCallback: ObsCb = () => {};
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  mockObserve.mockClear();
  mockDisconnect.mockClear();
  // Precisa ser function regular (não arrow) para funcionar com `new`
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn().mockImplementation(function (cb: ObsCb) {
      observerCallback = cb;
      return { observe: mockObserve, disconnect: mockDisconnect };
    })
  );
});

const TestEl = ({ threshold }: { threshold?: number }) => {
  const [ref, inView] = useInView(threshold);
  return <div ref={ref} data-testid="target" data-inview={String(inView)} />;
};

describe("useInView", () => {
  it("inView começa como false", () => {
    render(<TestEl />);
    expect(screen.getByTestId("target")).toHaveAttribute("data-inview", "false");
  });

  it("fica true quando IntersectionObserver dispara com isIntersecting: true", () => {
    render(<TestEl />);
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });
    expect(screen.getByTestId("target")).toHaveAttribute("data-inview", "true");
  });

  it("permanece false quando isIntersecting é false", () => {
    render(<TestEl />);
    act(() => {
      observerCallback([{ isIntersecting: false }]);
    });
    expect(screen.getByTestId("target")).toHaveAttribute("data-inview", "false");
  });

  it("desconecta o observer após a primeira intersecção (observe-once)", () => {
    render(<TestEl />);
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });
    expect(mockDisconnect).toHaveBeenCalledOnce();
  });

  it("usa o threshold padrão 0.12", () => {
    render(<TestEl />);
    expect(IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), { threshold: 0.12 });
  });

  it("usa threshold customizado passado como argumento", () => {
    render(<TestEl threshold={0.5} />);
    expect(IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), { threshold: 0.5 });
  });
});
