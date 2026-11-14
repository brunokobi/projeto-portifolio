import { describe, expect, it } from "vitest";
import { formatPostDate } from "../formatPostDate";

describe("formatPostDate", () => {
  it("mostra o mesmo dia da data do post, sem voltar um dia pelo fuso", () => {
    expect(formatPostDate("2026-11-14")).toBe("14 de novembro de 2026");
  });
});
