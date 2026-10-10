import { expect, test } from "@playwright/test";
import { mockServices } from "./helpers";

test("Event mit Bild und **fett** in der Beschreibung", async ({ page }) => {
  await mockServices(page);
  await page.goto("/maerkte-events");
  const card = page.getByRole("listitem").filter({ hasText: "Testmarkt" });
  const img = card.getByRole("img", { name: "Weihnachtsmarkt am Abend" });
  await expect(img).toBeVisible();
  // Zuschnitt auf dem Server (Bildausschnitt aus dem Studio), nicht nur per CSS
  await expect(img).toHaveAttribute("src", /fit=max/);
  await expect(img).toHaveAttribute("src", /h=900/);
  await expect(card.locator("strong", { hasText: "unbedingt" })).toBeVisible();
  await expect(card).not.toContainText("**");

  // Startseite: nächster Markt mit Bild
  await page.goto("/");
  const next = page.getByRole("link", { name: /Nächster Markt/ });
  await expect(next.locator("img")).toBeVisible();
});
