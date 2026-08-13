import { test, expect } from "@playwright/test";
import { ar } from "../../../fixtures/mock-data";
import { gotoLocalized, ROUTES } from "../../../helpers/navigation";

test.describe("الصفحة الرئيسية", () => {
  test.beforeEach(async ({ page }) => {
    await gotoLocalized(page, ROUTES.home);
  });

  test("تعرض قسم البطل والمحتوى الأساسي", async ({ page }) => {
    await expect(page.getByText(ar.home.heroTitle)).toBeVisible();
    await expect(page.getByText(ar.home.heroHighlight)).toBeVisible();
    await expect(page.getByText(ar.home.productsSection)).toBeVisible();
    await expect(page.getByText(ar.home.servicesSection)).toBeVisible();
  });

  test("تعرض المنتجات المميزة من الـ API", async ({ page }) => {
    await expect(page.getByText(ar.store.productName)).toBeVisible();
  });

  test("ينتقل إلى المتجر من قسم المنتجات", async ({ page }) => {
    await page.getByRole("link", { name: "عرض الكل" }).click();
    await expect(page).toHaveURL(/\/ar\/store/);
  });

  test("ينتقل إلى صفحة الخدمة من قسم الخدمات", async ({ page }) => {
    await page
      .getByRole("link", { name: ar.header.hadiAndUdhiyah })
      .first()
      .click();
    await expect(page).toHaveURL(/\/ar\/services\/hadi-and-udhiyah/);
  });
});
