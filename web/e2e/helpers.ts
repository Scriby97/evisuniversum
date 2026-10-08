import type { Page } from "@playwright/test";

type Form = Record<string, string>;
type StockRequest = { items: { slug: string; quantity: number }[] };

// 1×1-PNG für Bilder vom (Fantasie-)Sanity-CDN der Testdaten
const pixel = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

/**
 * Fängt alles ab, was die Seite nach aussen schickt: Formulare (Web3Forms), Lagerabzug (/api/stock)
 * und Bilder. Die Tests prüfen dann, was tatsächlich an Evi gegangen wäre.
 */
export async function mockServices(page: Page, { formsFail = false } = {}) {
  const forms: Form[] = [];
  const stock: StockRequest[] = [];
  // Alles, was nicht zur Testseite gehört, wird blockiert (z. B. Statistik), damit nichts nach aussen geht
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
  await page.route("https://api.web3forms.com/**", async (route) => {
    // Preise enthalten ein geschütztes Leerzeichen («CHF 9.00») – für die Vergleiche normalisieren
    forms.push(JSON.parse(route.request().postData()!.replace(/\u00a0/g, " ")));
    await route.fulfill({ json: formsFail ? { success: false, message: "Testfehler" } : { success: true } });
  });
  await page.route("**/api/stock", async (route) => {
    stock.push(route.request().postDataJSON());
    await route.fulfill({ json: { ok: true } });
  });
  await page.route("https://cdn.sanity.io/**", (route) => route.fulfill({ body: pixel, contentType: "image/png" }));
  return { forms, stock };
}

export const cartCount = (page: Page) => page.getByRole("link", { name: /^Warenkorb \(\d+\)$/ }).first();

export async function addSocken(page: Page, { name }: { name?: string } = {}) {
  await page.goto("/shop/test-socken");
  const form = page.locator("form#auswahl");
  await form.getByLabel("Farbe").selectOption("Weiss");
  await form.getByLabel("Grösse").selectOption("39–42");
  await form.getByLabel(/Beidseitig/).check();
  await form.getByLabel("Symbol").selectOption("Panda");
  if (name) await form.getByLabel(/Namenwunsch/).fill(name);
  await form.getByLabel(/Bemerkung oder Wunsch/).fill("Bitte in Rosa");
  await form.getByRole("button", { name: "In den Warenkorb" }).click();
  await page.getByText("✓ Hinzugefügt").waitFor();
}

export async function addTasche(page: Page) {
  await page.goto("/shop/test-tasche");
  await page.locator("form#auswahl").getByRole("button", { name: "In den Warenkorb" }).click();
  await page.getByText("✓ Hinzugefügt").waitFor();
}

export async function fillCustomer(page: Page, { address = true } = {}) {
  await page.getByLabel("Name", { exact: true }).fill("Test Kundin");
  await page.getByLabel("E-Mail", { exact: true }).fill("kundin@example.ch");
  if (address) await page.getByLabel("Deine Adresse").fill("Weg 1\n3600 Thun");
}
