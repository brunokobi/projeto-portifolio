import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import ContactForm from "../ContactForm";

const mockToast = vi.fn();

vi.mock("@chakra-ui/react", async () => {
  const actual = await vi.importActual<typeof import("@chakra-ui/react")>("@chakra-ui/react");
  return { ...actual, useToast: () => mockToast };
});

const renderForm = (props: { onClose?: () => void } = {}) =>
  render(
    <ChakraProvider>
      <ContactForm {...props} />
    </ChakraProvider>
  );

describe("ContactForm", () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  it("renderiza o campo de nome", () => {
    renderForm();
    expect(screen.getByPlaceholderText(/identificação/i)).toBeInTheDocument();
  });

  it("renderiza o campo de email", () => {
    renderForm();
    expect(screen.getByPlaceholderText(/email\.com/i)).toBeInTheDocument();
  });

  it("renderiza o campo de mensagem", () => {
    renderForm();
    expect(screen.getByPlaceholderText(/conteúdo/i)).toBeInTheDocument();
  });

  it("renderiza o botão de envio", () => {
    renderForm();
    expect(screen.getByRole("button", { name: /transmissão/i })).toBeInTheDocument();
  });

  it("usuário pode preencher o campo nome", () => {
    renderForm();
    const input = screen.getByPlaceholderText(/identificação/i);
    fireEvent.change(input, { target: { name: "nome", value: "Bruno Kobi" } });
    expect(input).toHaveValue("Bruno Kobi");
  });

  it("usuário pode preencher o campo email", () => {
    renderForm();
    const input = screen.getByPlaceholderText(/email\.com/i);
    fireEvent.change(input, { target: { name: "email", value: "bruno@test.com" } });
    expect(input).toHaveValue("bruno@test.com");
  });

  it("usuário pode preencher o campo mensagem", () => {
    renderForm();
    const textarea = screen.getByPlaceholderText(/conteúdo/i);
    fireEvent.change(textarea, { target: { name: "mensagem", value: "Olá, quero conversar!" } });
    expect(textarea).toHaveValue("Olá, quero conversar!");
  });

  it("exibe toast de erro quando supabase não está configurado (sem env vars)", async () => {
    renderForm();
    const form = screen.getByRole("button", { name: /transmissão/i }).closest("form")!;
    fireEvent.submit(form);
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Serviço indisponível", status: "error" })
      );
    });
  });

  it("não lança erro com a prop onClose opcional", () => {
    const onClose = vi.fn();
    expect(() => renderForm({ onClose })).not.toThrow();
  });

  it("renderiza o heading UPLINK DE CONTATO", () => {
    renderForm();
    expect(screen.getByText(/uplink de contato/i)).toBeInTheDocument();
  });
});
