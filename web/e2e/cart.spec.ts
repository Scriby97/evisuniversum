import { expect, test, type Page } from "@playwright/test";
import { addSocken, addTasche, cartCount, mockServices } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockServices(page);
});

const total = (page: Page) => page.locator("dl dd").last();

test("Pflichtauswahl muss gewählt sein, Zusatzoption kostet extra", async ({ page }) => {
  await page.goto("/shop/test-socken");
  await page.locator("form#auswahl").getByRole("button", { name: "In den Warenkorb" }).click();
  await expect(page.getByText("✓ Hinzugefügt")).toHaveCount(0);
  await expect(cartCount(page)).toHaveAccessibleName("Warenkorb (0)");

  await addSocken(page, { name: "Alina" });
  await expect(cartCount(page)).toHaveAccessibleName("Warenkorb (1)");
  await page.goto("/bestellen");
  const line = page.getByRole("listitem").filter({ hasText: "Testsocken" });
  // 25 + 5 Aufpreis
  await expect(line).toContainText("CHF 30.00");
  await expect(line).toContainText("Weiss");
  await expect(line).toContainText("Grösse 39–42");
  await expect(line).toContainText("Beidseitig");
  await expect(line).toContainText("Name «Alina»");
});

test("Mengen, Versandarten, Gratisversand und Geschenkverpackung", async ({ page }) => {
  await addTasche(page);
  await page.goto("/bestellen");
  await expect(total(page)).toHaveText("CHF 48.00"); // 39 + Economy 9

  await page.getByRole("button", { name: "Testtasche: eins mehr" }).click();
  await expect(total(page)).toHaveText("CHF 87.00"); // 78 + 9

  await page.getByLabel("Priority").check();
  await expect(total(page)).toHaveText("CHF 88.50");

  await page.getByLabel(/Als Geschenk verpacken/).check();
  await expect(total(page)).toHaveText("CHF 93.50");

  // Ab CHF 100 ist Economy gratis
  await page.getByLabel("Economy").check();
  await page.getByRole("button", { name: "Testtasche: eins mehr" }).click();
  await expect(page.getByText("Nur noch 2 an Lager")).toBeVisible(); // 3 bestellt, 2 an Lager
  await expect(total(page)).toHaveText("CHF 122.00"); // 117 + Verpackung 5, Versand gratis

  // Mehr als an Lager → auf Anfrage → kein TWINT
  await expect(page.getByLabel(/TWINT – direkt/)).toBeDisabled();

  await page.getByRole("button", { name: "Entfernen" }).click();
  await expect(page.getByText("Dein Warenkorb ist noch leer.")).toBeVisible();
});

test("Nur Digitales: keine Adresse, kein Versand", async ({ page }) => {
  await page.goto("/shop");
  await page.locator("article", { hasText: "Testvorlage" }).getByRole("button", { name: "In den Warenkorb" }).click();
  await page.goto("/bestellen");
  await expect(page.getByLabel("Deine Adresse")).toHaveCount(0);
  await expect(page.getByLabel(/Als Geschenk verpacken/)).toHaveCount(0);
  await expect(total(page)).toHaveText("CHF 9.00");
});

test("Warenkorb bleibt nach dem Neuladen erhalten", async ({ page }) => {
  await addTasche(page);
  await page.reload();
  await expect(cartCount(page)).toHaveAccessibleName("Warenkorb (1)");
});
