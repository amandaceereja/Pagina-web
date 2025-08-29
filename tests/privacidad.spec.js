const { test, expect } = require("@playwright/test");

test("Política de privacidad carga y muestra el título", async ({ page }) => {
  await page.goto("/privacidad.html");
  await expect(page).toHaveTitle(/Política de privacidad/i);
  await expect(page.getByRole("heading", { name: /Política de privacidad/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Volver al formulario/i })).toBeVisible();
});
