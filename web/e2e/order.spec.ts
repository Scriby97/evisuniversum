import { expect, test } from "@playwright/test";
import { addSocken, addTasche, cartCount, fillCustomer, mockServices } from "./helpers";

test("Bestellung mit QR-Rechnung: Mail an Evi, Lagerabzug, Bestätigung", async ({ page }) => {
  const { forms, stock } = await mockServices(page);
  await addSocken(page, { name: "Alina" });
  await addTasche(page);
  await page.goto("/bestellen");
  await fillCustomer(page);
  await page.getByLabel(/Nachricht/).fill("Freue mich!");
  await page.getByRole("button", { name: "Verbindlich bestellen" }).click();
  await expect(page.getByRole("heading", { name: /Vielen Dank für deine Bestellung/ })).toBeVisible();

  // Was Evi per Mail bekommt
  expect(forms).toHaveLength(1);
  const mail = forms[0];
  expect(mail.subject).toMatch(/^Neue Bestellung EU-\d{6}-\d{4} von Test Kundin$/);
  expect(mail.Name).toBe("Test Kundin");
  expect(mail.email).toBe("kundin@example.ch");
  expect(mail.Zahlungsart).toBe("QR-Rechnung per E-Mail");
  expect(mail.Bestellung).toContain("1 × Testsocken à CHF 30.00");
  expect(mail.Bestellung).toContain("Farbe Weiss");
  expect(mail.Bestellung).toContain("Symbol Panda");
  expect(mail.Bestellung).toContain("Namenwunsch: «Alina»");
  expect(mail.Bestellung).toContain("Bemerkung/Wunsch: «Bitte in Rosa»");
  expect(mail.Bestellung).toContain("1 × Testtasche à CHF 39.00");
  expect(mail.Versand).toBe("Economy: CHF 9.00");
  expect(mail.Total).toBe("CHF 78.00");
  expect(mail.Nachricht).toBe("Freue mich!");

  // Lagerabzug nur für Produkte mit gezähltem Bestand (Socken: Lagerfeld leer)
  await expect.poll(() => stock.length).toBe(1);
  expect(stock[0].items).toEqual([{ slug: "test-tasche", quantity: 1 }]);

  // Bestätigung für die Kundin
  await expect(page.getByText(`Bestellnummer: ${mail.Bestellnummer}`)).toBeVisible();
  const mailto = await page.getByRole("link", { name: "Bestätigung an mich mailen" }).getAttribute("href");
  const url = new URL(mailto!);
  expect(decodeURIComponent(url.pathname)).toBe("kundin@example.ch");
  expect(url.searchParams.get("body")!.replace(/\u00a0/g, " ")).toContain("Total: CHF 78.00");
  await expect(cartCount(page)).toHaveAccessibleName("Warenkorb (0)");
});

test("Bestellung mit TWINT zeigt QR-Code und Betrag", async ({ page }) => {
  const { forms } = await mockServices(page);
  await addTasche(page);
  await page.goto("/bestellen");
  await fillCustomer(page);
  await page.getByLabel(/TWINT – direkt/).check();
  await page.getByRole("button", { name: "Verbindlich bestellen" }).click();
  await expect(page.getByText("jetzt nur noch mit TWINT bezahlen")).toBeVisible();
  await expect(page.getByRole("img", { name: /TWINT-QR-Code/ })).toBeVisible();
  await expect(page.locator("ol")).toContainText("CHF 48.00");
  expect(forms[0].Zahlungsart).toMatch(/^TWINT/);
});

test("Fehler beim Senden: Meldung, Warenkorb bleibt", async ({ page }) => {
  const { stock } = await mockServices(page, { formsFail: true });
  await addTasche(page);
  await page.goto("/bestellen");
  await fillCustomer(page);
  await page.getByRole("button", { name: "Verbindlich bestellen" }).click();
  await expect(page.getByText("Die Bestellung konnte nicht gesendet werden.", { exact: false })).toBeVisible();
  await expect(cartCount(page)).toHaveAccessibleName("Warenkorb (1)");
  expect(stock).toHaveLength(0);
});
