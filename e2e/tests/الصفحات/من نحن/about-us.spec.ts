import { test, expect } from "@playwright/test";
import { ar } from "../../../fixtures/mock-data";
import { gotoLocalized, header, ROUTES } from "../../../helpers/navigation";

test.describe("صفحة من نحن", () => {
  test.beforeEach(async ({ page }) => {
    await gotoLocalized(page, ROUTES.about);
  });

  test("تعرض العنوان والقيم", async ({ page }) => {
    await expect(page.getByText(ar.about.heroHighlight).first()).toBeVisible();
    await expect(page.getByText(ar.about.valuesTitle)).toBeVisible();
    await expect(page.getByText("رؤيتنا")).toBeVisible();
    await expect(page.getByText("رسالتنا")).toBeVisible();
  });

  test("تعرض روابط التنقل النشطة", async ({ page }) => {
    await expect(
      header(page).getByRole("link", { name: ar.header.about }),
    ).toHaveAttribute("aria-current", "page");
  });
});
