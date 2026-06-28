import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("carrega sem erros críticos", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Nenhum erro fatal de JS
    const fatalErrors = errors.filter(
      (e) => !e.includes("ResizeObserver") && !e.includes("Non-Error promise rejection")
    );
    expect(fatalErrors).toHaveLength(0);
  });

  test("nav de navegação está visível", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("rota /about renderiza conteúdo", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("domcontentloaded");

    // Aguarda o Suspense resolver
    await page.waitForSelector("body", { state: "visible" });
    const body = await page.locator("body").textContent();
    expect(body?.length).toBeGreaterThan(50);
  });

  test("rota /projects renderiza conteúdo", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("domcontentloaded");

    await page.waitForSelector("body", { state: "visible" });
    const body = await page.locator("body").textContent();
    expect(body?.length).toBeGreaterThan(50);
  });

  test("rota inexistente não quebra o app", async ({ page }) => {
    await page.goto("/rota-que-nao-existe");
    await page.waitForLoadState("domcontentloaded");

    // App ainda deve renderizar (React Router em SPA)
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });
});
