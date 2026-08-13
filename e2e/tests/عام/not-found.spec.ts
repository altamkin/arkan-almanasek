import { test, expect } from "@playwright/test";
import { ar } from "../../fixtures/mock-data";
import { gotoLocalized } from "../../helpers/navigation";

test.describe("صفحة غير موجودة", () => {
  test("تعرض رسالة 404 للمسارات غير الصالحة", async ({ page }) => {
    await gotoLocalized(page, "/this-page-does-not-exist");

    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByText(ar.notFound.title)).toBeVisible();
    await expect(
      page.getByRole("link", { name: ar.notFound.homeCta }),
    ).toBeVisible();
  });

  test("يعود إلى الصفحة الرئيسية من صفحة 404", async ({ page }) => {
    await gotoLocalized(page, "/invalid-route");

    await page.getByRole("link", { name: ar.notFound.homeCta }).click();

    await expect(page).toHaveURL(/\/ar\/?$/);
    await expect(page.getByText(ar.home.heroTitle)).toBeVisible();
  });
});
