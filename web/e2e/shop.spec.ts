import { expect, test } from "@playwright/test";
import { mockServices } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockServices(page);
});

test("Shop zeigt je nach Produkt den richtigen Knopf", async ({ page }) => {
  await page.goto("/shop");
  const card = (name: string) => page.locator("article", { hasText: name });

  // Ohne Auswahl: direkt in den Warenkorb
  await expect(card("Testtasche").getByRole("button", { name: "In den Warenkorb" })).toBeVisible();
  // Mit Pflichtauswahl: zur Produktseite
  await expect(card("Testsocken").getByRole("link", { name: "In den Warenkorb" })).toHaveAttribute(
    "href",
    "/shop/test-socken#auswahl",
  );
  // Auf Anfrage (ausdrücklich oder Lager 0): zum Anfrageformular, nie «Ausverkauft»
  for (const [name, slug] of [
    ["Testsäckli", "test-saeckli"],
    ["Leeres Lagerprodukt", "test-leer"],
  ]) {
    await expect(card(name).getByRole("link", { name: "Auf Anfrage" })).toHaveAttribute("href", `/anfrage/${slug}`);
    await expect(card(name).getByText("Ausverkauft")).toHaveCount(0);
  }
  // Ausgeschaltet: ausverkauft, kein Knopf
  await expect(card("Ausverkauftes Produkt").getByText("Ausverkauft", { exact: true })).toBeVisible();
  await expect(card("Ausverkauftes Produkt").getByRole("button")).toHaveCount(0);
});

test("Lageranzeige auf der Produktseite", async ({ page }) => {
  await page.goto("/shop/test-tasche");
  await expect(page.getByText("Noch 2 an Lager")).toBeVisible();

  // Leeres Lagerfeld (null) = Bestand wird nicht gezählt: keine Anzeige, ganz normal bestellbar
  await page.goto("/shop/test-socken");
  await expect(page.getByText(/an Lager/)).toHaveCount(0);
  await expect(page.locator("form#auswahl")).toBeVisible();

  // Lager 0 → auf Anfrage
  await page.goto("/shop/test-leer");
  await expect(page.getByText("Zurzeit nicht an Lager – gerne auf Anfrage")).toBeVisible();
  await expect(page.getByRole("link", { name: "Anfrage stellen" })).toHaveAttribute("href", "/anfrage/test-leer");
  await expect(page.locator("form#auswahl")).toHaveCount(0);

  await page.goto("/shop/test-weg");
  await expect(page.getByText("Dieses Produkt ist im Moment leider ausverkauft.")).toBeVisible();
});
