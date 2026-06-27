import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import ErrorBoundary from "../index";

// Componente que lança erro para testar o ErrorBoundary
const BrokenComponent = () => {
  throw new Error("Erro de teste");
};

const HealthyComponent = () => <p>Componente saudável</p>;

beforeEach(() => {
  // Suprime o console.error do React durante testes de ErrorBoundary
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("ErrorBoundary", () => {
  it("renderiza filhos normalmente quando não há erro", () => {
    render(
      <ErrorBoundary>
        <HealthyComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("Componente saudável")).toBeInTheDocument();
  });

  it("exibe mensagem de erro quando filho lança exceção", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("Algo deu errado")).toBeInTheDocument();
    expect(screen.getByText(/Ocorreu um erro inesperado/)).toBeInTheDocument();
  });

  it("exibe botão 'Tentar novamente'", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });

  it("reseta o estado de erro ao clicar em 'Tentar novamente'", () => {
    let shouldThrow = true;
    const ConditionalBreaker = () => {
      if (shouldThrow) throw new Error("Erro condicional");
      return <p>Recuperado com sucesso</p>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalBreaker />
      </ErrorBoundary>
    );

    expect(screen.getByText("Algo deu errado")).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: /tentar novamente/i }));

    rerender(
      <ErrorBoundary>
        <ConditionalBreaker />
      </ErrorBoundary>
    );

    expect(screen.getByText("Recuperado com sucesso")).toBeInTheDocument();
  });
});
