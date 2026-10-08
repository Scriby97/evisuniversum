import { expect, test } from "@playwright/test";
import { mockServices } from "./helpers";

test("Anfrage: Namenwunsch und Name der Kundin bleiben getrennt", async ({ page }) => {
  const { forms, stock } = await mockServices(page);
  await page.goto("/shop");
  await page.locator("article", { hasText: "Testsäckli" }).getByRole("link", { name: "Auf Anfrage" }).click();
  await expect(page).toHaveURL(/\/anfrage\/test-saeckli/);

  await page.getByLabel(/Namenwunsch/).fill("Mia");
  await page.getByLabel("Menge").fill("2");
  await page.getByLabel("Bemerkung oder Wunsch").fill("Zwei Stück bitte");
  await page.getByLabel("Name", { exact: true }).fill("Test Kundin");
  await page.getByLabel("E-Mail", { exact: true }).fill("kundin@example.ch");
  await page.getByRole("button", { name: "Anfrage senden" }).click();
  await expect(page.getByRole("heading", { name: /Danke für deine Anfrage/ })).toBeVisible();

  expect(forms).toHaveLength(1);
  const mail = forms[0];
  expect(mail.subject).toMatch(/^Anfrage AN-\d{6}-\d{4} für «Testsäckli» von Test Kundin$/);
  expect(mail.Name).toBe("Test Kundin");
  expect(mail.Auswahl).toContain("Namenwunsch: «Mia»");
  expect(mail.Menge).toBe("2");
  expect(mail["Bemerkung / Wunsch"]).toBe("Zwei Stück bitte");
  expect(mail.Telefon).toBe("–");
  // Anfragen ziehen keinen Lagerbestand ab
  expect(stock).toHaveLength(0);

  await expect(page.getByText(`Anfragenummer: ${mail.Anfragenummer}`)).toBeVisible();
  await expect(page.getByRole("link", { name: "Bestätigung an mich mailen" })).toHaveAttribute(
    "href",
    /^mailto:kundin%40example\.ch\?/,
  );
});

test("Anfrage für Produkt mit Lager 0: alles freiwillig", async ({ page }) => {
  const { forms } = await mockServices(page);
  await page.goto("/anfrage/test-leer");
  await page.getByLabel("Name", { exact: true }).fill("Test");
  await page.getByLabel("E-Mail", { exact: true }).fill("t@example.ch");
  await page.getByRole("button", { name: "Anfrage senden" }).click();
  await expect(page.getByRole("heading", { name: /Danke für deine Anfrage/ })).toBeVisible();
  expect(forms[0].Auswahl).toBe("–");
});
