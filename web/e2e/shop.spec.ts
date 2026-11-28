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
  await expect(card("Testanfertigung").getByRole("link", { name: "Auf Anfrage" })).toBeVisible();

  // Preisangabe: fix, ab-Preis oder ohne Betrag
  await expect(card("Testtasche")).toContainText("CHF 39.00");
  await expect(card("Testsäckli")).toContainText("ab CHF 19.00");
  await expect(card("Testanfertigung")).toContainText("Preis auf Anfrage");
  await expect(card("Testanfertigung")).not.toContainText("CHF");
  // Lager 0 ohne ausdrückliches «Auf Anfrage»: bleibt beim festen Preis
  await expect(card("Leeres Lagerprodukt")).toContainText("CHF 15.00");
  await expect(card("Leeres Lagerprodukt")).not.toContainText("ab CHF");

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

test("Produktseiten liefern Preis, Verfügbarkeit und Versand für Google (unsichtbar)", async ({ page }) => {
  const jsonLd = async (slug: string) => {
    await page.goto(`/shop/${slug}`);
    const scripts = page.locator('script[type="application/ld+json"]');
    return (await scripts.count()) ? JSON.parse((await scripts.first().textContent()) ?? "") : null;
  };

  // Personalisiert: fester Preis, an Lager, Versandtasche, vom Umtausch ausgeschlossen
  const socken = await jsonLd("test-socken");
  expect(socken).toMatchObject({ "@type": "Product", name: "Testsocken", brand: { name: expect.any(String) } });
  expect(socken.offers).toMatchObject({
    priceCurrency: "CHF",
    price: "25.00",
    availability: "https://schema.org/InStock",
    shippingDetails: { shippingRate: { value: "2.50", currency: "CHF" }, shippingDestination: { addressCountry: "CH" } },
    hasMerchantReturnPolicy: { returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted" },
  });

  // Digital: kein Versand, keine Rückgaberegel angegeben
  const vorlage = await jsonLd("test-vorlage");
  expect(vorlage.offers.shippingDetails.shippingRate.value).toBe("0.00");
  expect(vorlage.offers.hasMerchantReturnPolicy).toBeUndefined();

  // Ausgeschaltet → ausverkauft
  expect((await jsonLd("test-weg")).offers.availability).toBe("https://schema.org/OutOfStock");

  // Auf Anfrage, Ab-Preis, Preis auf Anfrage oder Lager 0: nicht direkt kaufbar → keine Produktdaten
  for (const slug of ["test-saeckli", "test-anfertigung", "test-leer"]) expect(await jsonLd(slug)).toBeNull();
});

test("Instagram-Kasten zeigt alle im Studio gewählten Bilder (auch nur 2) und verlinkt aufs Profil", async ({ page }) => {
  await page.goto("/");
  const card = page.locator('a[href="https://www.instagram.com/example/"]', { hasText: "Folge mir auf Instagram" });
  await expect(card).toBeVisible();
  const images = card.locator("img");
  await expect(images).toHaveCount(2);
  for (const n of [1, 2]) await expect(images.nth(n - 1)).toHaveAttribute("src", new RegExp(`e2einsta${n}`));
});
