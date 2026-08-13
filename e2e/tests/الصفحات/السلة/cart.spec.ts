import { test, expect } from "@playwright/test";
import { ar } from "../../../fixtures/mock-data";
import {
  clearCartStorage,
  gotoLocalized,
  ROUTES,
} from "../../../helpers/navigation";

test.describe("صفحة السلة", () => {
  test.beforeEach(async ({ page }) => {
    await clearCartStorage(page);
    await gotoLocalized(page, ROUTES.cart);
  });

  test("تعرض معالج الدفع والخطوات", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: ar.cart.title }),
    ).toBeVisible();
    await expect(page.getByText(ar.cart.step1)).toBeVisible();
    await expect(page.getByText("معلومات العميل").first()).toBeVisible();
    await expect(page.getByText("طريقة الدفع").first()).toBeVisible();
  });

  test("تعرض رسالة السلة الفارغة", async ({ page }) => {
    await expect(page.getByText(ar.cart.emptyMessage)).toBeVisible();
  });

  test("تعرض ملخص الطلب وقسم المساعدة", async ({ page }) => {
    await expect(page.getByText("ملخص الطلب")).toBeVisible();
    await expect(page.getByText("هل تحتاج مساعدة؟")).toBeVisible();
  });
});
