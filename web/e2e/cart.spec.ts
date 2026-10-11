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

test("Versand: bis 3 Produkte Versandtasche, ab 4 oder mit Geschenkverpackung Paket", async ({ page }) => {
  await addTasche(page);
  await page.goto("/bestellen");
  const shippingChoice = page.getByRole("group", { name: "Versandart" });

  // 1 Produkt: Versandtasche, keine Auswahl nötig
  await expect(total(page)).toHaveText("CHF 41.50"); // 39 + 2.50
  await expect(shippingChoice).toHaveCount(0);

  // Geschenkverpackung → immer Paket: Economy vorausgewählt, Priority wählbar
  await page.getByLabel(/Als Geschenk verpacken/).check();
  await expect(total(page)).toHaveText("CHF 53.00"); // 39 + Economy 9 + Verpackung 5
  await expect(page.getByLabel("Versandtasche")).toHaveCount(0);
  await page.getByLabel("Priority").check();
  await expect(total(page)).toHaveText("CHF 54.50");

  // Ohne Verpackung wieder Versandtasche
  await page.getByLabel(/Als Geschenk verpacken/).uncheck();
  await expect(total(page)).toHaveText("CHF 41.50");

  // 2 Stück: noch Versandtasche
  await page.getByRole("button", { name: "Testtasche: eins mehr" }).click();
  await expect(total(page)).toHaveText("CHF 80.50"); // 78 + 2.50

  // 3 Stück (mehr als an Lager → auf Anfrage, kein TWINT); ab CHF 100 ist die Standard-Versandart gratis
  await page.getByRole("button", { name: "Testtasche: eins mehr" }).click();
  await expect(page.getByText("Nur noch 2 an Lager")).toBeVisible();
  await expect(page.getByLabel(/TWINT – direkt/)).toBeDisabled();
  await expect(total(page)).toHaveText("CHF 117.00");

  // 4 Stück → Paket; die vorher gewählte Priority bleibt gewählt, Economy ist gratis (ab CHF 100)
  await page.getByRole("button", { name: "Testtasche: eins mehr" }).click();
  await expect(shippingChoice).toBeVisible();
  await expect(total(page)).toHaveText("CHF 166.50"); // 156 + Priority 10.50
  await page.getByLabel("Economy").check();
  await expect(total(page)).toHaveText("CHF 156.00");

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
