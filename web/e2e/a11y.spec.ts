import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { addTasche, mockServices } from "./helpers";

// Barrierefreiheit (WCAG 2.1 AA) der wichtigsten Seiten
const pages = ["/", "/shop", "/shop/test-socken", "/anfrage/test-saeckli", "/kontakt", "/datenschutz"];

for (const path of pages) {
  test(`Barrierefreiheit ${path}`, async ({ page }) => {
    await mockServices(page);
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
  });
}

test("Barrierefreiheit Warenkorb", async ({ page }) => {
  await mockServices(page);
  await addTasche(page);
  await page.goto("/bestellen");
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
});
