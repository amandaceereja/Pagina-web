// tests/home.spec.js
const { test, expect } = require("@playwright/test");

test("index carga y tiene título", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page).toHaveTitle(/Amanda Cereja/i);
  await expect(page.locator("header .navbar__logo")).toBeVisible();
});

test("checklist existe y muestra el h1", async ({ page }) => {
  await page.goto("/checklist.html");
  await expect(page.getByRole("heading", { name: /Checklist/i })).toBeVisible();
});
