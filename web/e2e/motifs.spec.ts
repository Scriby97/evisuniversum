import { expect, test } from "@playwright/test";
import { mockServices } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockServices(page);
});

test("Shop zeigt ein Raster pro Motiv-Sammlung mit eigenem Titel", async ({ page }) => {
  await page.goto("/shop");
  const section = page.locator("#personalisierung");
  await expect(section.getByRole("heading", { name: "Kleine Motive" })).toBeVisible();
  await expect(section.getByText("Ca. 3 cm – ideal für Socken")).toBeVisible();
  await expect(section.getByRole("heading", { name: "Taschen-Motive" })).toBeVisible();
  await expect(section.getByRole("listitem").filter({ hasText: "Blume" })).toBeVisible();
});

test("Ohne gewählte Sammlung stehen alle Motive zur Auswahl, gruppiert", async ({ page }) => {
  await page.goto("/shop/test-socken");
  const select = page.locator("form#auswahl").getByLabel("Symbol");
  await expect(select.locator("optgroup")).toHaveCount(2);
  await expect(select.locator('optgroup[label="Kleine Motive"] option')).toHaveText(["Herz", "Panda"]);
  await expect(select.locator('optgroup[label="Taschen-Motive"] option')).toHaveText(["Blume"]);
});

test("Mit gewählter Sammlung nur deren Motive", async ({ page }) => {
  await page.goto("/anfrage/test-saeckli");
  const select = page.getByLabel("Symbol");
  await expect(select.locator("optgroup")).toHaveCount(0);
  await expect(select.locator("option")).toHaveText(["Kein Symbol", "Blume"]);
});
