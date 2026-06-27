import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { LanguageProvider, useLanguage } from "../LanguageContext";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe("useLanguage", () => {
  beforeEach(() => { localStorage.clear(); });

  it("retorna locale padrão 'pt' quando não há nada no localStorage", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.locale).toBe("pt");
  });

  it("lê o idioma salvo no localStorage", () => {
    localStorage.setItem("i18nConfig", JSON.stringify({ selectedLang: "en" }));
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.locale).toBe("en");
  });

  it("atualiza o locale ao chamar setLanguage", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => { result.current.setLanguage("fr"); });
    expect(result.current.locale).toBe("fr");
  });

  it("persiste o novo idioma no localStorage", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => { result.current.setLanguage("de"); });
    const stored = JSON.parse(localStorage.getItem("i18nConfig") || "{}");
    expect(stored.selectedLang).toBe("de");
  });

  it("lança erro se usado fora do LanguageProvider", () => {
    // Suprime o log de erro do React para o caso de erro esperado
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useLanguage())).toThrow(
      "useLanguage must be used within LanguageProvider"
    );
  });
});
