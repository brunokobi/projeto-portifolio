import { isActivePath } from "../isActivePath";

describe("isActivePath", () => {
  it("Home só fica ativa na raiz", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/about", "/")).toBe(false);
  });

  it("marca a seção também nas subpáginas", () => {
    expect(isActivePath("/blog", "/blog")).toBe(true);
    expect(isActivePath("/blog/meu-post", "/blog")).toBe(true);
    expect(isActivePath("/blogroll", "/blog")).toBe(false);
  });

  it("links externos e ações nunca ficam ativos", () => {
    expect(isActivePath("/", "https://github.com/brunokobi")).toBe(false);
    expect(isActivePath("/about")).toBe(false);
  });
});
