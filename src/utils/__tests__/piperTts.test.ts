import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildPiperUrl,
  piperLang,
  playPiper,
  prepareText,
  splitIntoChunks,
  stopPiper,
} from "../piperTts";

type Outcome = "ends" | "fails" | "blocked" | "hangs";

class FakeAudio {
  static outcome: Outcome = "ends";
  static played: string[] = [];
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  preload = "";
  crossOrigin: string | null = null;
  constructor(public src = "") {}
  play() {
    FakeAudio.played.push(this.src);
    if (FakeAudio.outcome === "blocked") return Promise.reject(new Error("NotAllowedError"));
    if (FakeAudio.outcome === "ends") queueMicrotask(() => this.onended?.());
    if (FakeAudio.outcome === "fails") queueMicrotask(() => this.onerror?.());
    return Promise.resolve();
  }
  pause() {}
  removeAttribute() {}
}

beforeEach(() => {
  FakeAudio.outcome = "ends";
  FakeAudio.played = [];
  vi.stubGlobal("Audio", FakeAudio);
});

afterEach(() => {
  stopPiper();
  vi.unstubAllGlobals();
});

describe("piperLang", () => {
  it("aceita só os idiomas com voz no Piper", () => {
    expect(piperLang("pt-BR")).toBe("pt");
    expect(piperLang("ar")).toBe("ar");
    expect(piperLang("zh-CN")).toBeNull();
    expect(piperLang("kl")).toBeNull();
  });
});

describe("prepareText", () => {
  it("tira markdown e links e ajusta a pronúncia", () => {
    expect(
      prepareText("Sou o **JARVIS**. Veja [o GitHub](https://github.com/x) em `Github`", "pt")
    ).toBe("Sou o Járvis. Veja o Git Hub em Git Hub");
  });

  it("fala endereços sem soletrar o link", () => {
    expect(prepareText("O GitHub dele é github.com/brunokobi.", "pt")).toBe(
      "O Git Hub dele é bruno cóbi."
    );
    expect(prepareText("LinkedIn: linkedin.com/in/brunokobi", "pt")).toBe("LinkedIn: bruno cóbi");
    expect(prepareText("O e-mail é brunokobi2@hotmail.com.", "pt")).toBe(
      "O e-mail é bruno cóbi 2 arroba hotmail ponto com."
    );
    expect(prepareText("O site é brunokobi.tech", "pt")).toBe("O site é bruno cóbi ponto tech");
    expect(prepareText("Usa Node.js e Next.js", "pt")).toBe("Usa Node.js e Next.js");
  });

  it("pronuncia Kobi como Cóbi e Vennx como Vénix em português", () => {
    expect(prepareText("Bruno Kobi e brunokobi", "pt")).toBe("Bruno Cóbi e bruno cóbi");
    expect(prepareText("Trabalha na Vennx.", "pt")).toBe("Trabalha na Vénix.");
    expect(prepareText("Bruno Kobi", "en")).toBe("Bruno Kobi");
  });
});

describe("splitIntoChunks", () => {
  it("junta frases até o limite e não corta no meio de uma frase curta", () => {
    expect(splitIntoChunks("Primeira frase. Segunda frase! Terceira?", 30)).toEqual([
      "Primeira frase. Segunda frase!",
      "Terceira?",
    ]);
  });

  it("deixa o primeiro trecho mais curto para a fala começar logo", () => {
    expect(
      splitIntoChunks("Oi, tudo bem? Hoje vou contar sobre os projetos. E sobre a infra.", 60, 15)
    ).toEqual(["Oi, tudo bem?", "Hoje vou contar sobre os projetos. E sobre a infra."]);
  });

  it("quebra frase longa no último espaço, sem cortar palavra", () => {
    expect(splitIntoChunks("um dois tres quatro cinco seis", 12)).toEqual([
      "um dois tres",
      "quatro cinco",
      "seis",
    ]);
  });

  it("quebra frase maior que o limite", () => {
    expect(splitIntoChunks("a".repeat(25), 10)).toEqual([
      "a".repeat(10),
      "a".repeat(10),
      "a".repeat(5),
    ]);
  });
});

describe("buildPiperUrl", () => {
  it("monta a URL com velocidade arredondada", () => {
    expect(buildPiperUrl("Olá mundo", "pt", 1.43)).toBe(
      "https://tts.brunokobi.tech/tts.mp3?text=Ol%C3%A1+mundo&lang=pt&speed=1.4&v=2"
    );
  });
});

describe("playPiper", () => {
  it("toca cada trecho em sequência", async () => {
    await expect(playPiper("Primeira frase. Segunda frase.", "pt-BR", 1)).resolves.toBe("done");
    expect(FakeAudio.played).toHaveLength(1);
    expect(FakeAudio.played[0]).toContain("lang=pt");
  });

  it("rejeita quando nada tocou, para o chamador usar a voz do navegador", async () => {
    FakeAudio.outcome = "fails";
    await expect(playPiper("Oi", "pt-BR", 1)).rejects.toThrow();
    FakeAudio.outcome = "blocked";
    await expect(playPiper("Oi", "pt-BR", 1)).rejects.toThrow();
  });

  it("rejeita idioma sem voz no Piper", async () => {
    await expect(playPiper("你好", "zh-CN", 1)).rejects.toThrow();
  });

  it("termina como 'stopped' quando outra fala interrompe", async () => {
    FakeAudio.outcome = "hangs";
    const first = playPiper("Fala longa", "pt-BR", 1);
    await Promise.resolve();
    stopPiper();
    await expect(first).resolves.toBe("stopped");
  });
});
