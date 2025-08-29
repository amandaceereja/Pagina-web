import { test, expect } from "@playwright/test";

test("Home carga y título correcto", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page).toHaveTitle(/Amanda Cereja/i);
});

test("Hero y CTA visibles", async ({ page }) => {
  await page.goto("/index.html#hero");
  await expect(page.locator(".hero__title")).toBeVisible();

  // CTA del héroe *específico* (evita el del menú)
  const heroCta = page.locator(".hero").getByRole("link", { name: /Checklist Online/i });
  await expect(heroCta).toBeVisible();
});

test("Navegación a Checklist funciona", async ({ page }) => {
  await page.goto("/index.html");

  // Clic sólo en el CTA del héroe
  const heroCta = page.locator(".hero").getByRole("link", { name: /Checklist Online/i });
  await heroCta.click();

  await expect(page.locator("#checklist")).toBeVisible();
  // opcional: confirma que terminó con el hash
  await expect(page).toHaveURL(/#checklist$/i);
});
