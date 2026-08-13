import { test, expect } from "@playwright/test";
import { ar } from "../../../fixtures/mock-data";
import { gotoLocalized, header, ROUTES } from "../../../helpers/navigation";

test.describe("صفحة المتجر", () => {
  test.beforeEach(async ({ page }) => {
    await gotoLocalized(page, ROUTES.store);
  });

  test("تعرض المنتجات من الـ API", async ({ page }) => {
    await expect(page.getByText(ar.store.productName).first()).toBeVisible();
    await expect(
      header(page).getByRole("link", { name: ar.header.products }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("تعرض الفئات والتصنيفات", async ({ page }) => {
    await expect(page.getByText("إكسسوارات").first()).toBeVisible();
  });
});

test.describe("صفحة تفاصيل المنتج", () => {
  test("تعرض تفاصيل المنتج", async ({ page }) => {
    await gotoLocalized(page, ROUTES.productDetails(1));

    await expect(page.getByText(ar.store.productName).first()).toBeVisible();
    await expect(
      page.getByText("مسبحة عالية الجودة للحج والعمرة").first(),
    ).toBeVisible();
  });
});
