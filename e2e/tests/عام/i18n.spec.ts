import { test, expect } from "@playwright/test";
import { ar } from "../../fixtures/mock-data";
import {
  gotoLocalized,
  header,
  openLanguageMenu,
  ROUTES,
} from "../../helpers/navigation";

test.describe("تعدد اللغات", () => {
  test("يبدأ الموقع بالعربية كافتراضي", async ({ page }) => {
    await gotoLocalized(page, ROUTES.home);

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(
      header(page).getByRole("link", { name: ar.header.home }),
    ).toBeVisible();
  });

  test("يبدّل اللغة إلى الإنجليزية", async ({ page }) => {
    await gotoLocalized(page, ROUTES.home);
    await openLanguageMenu(page);

    await page.getByRole("menuitem", { name: "English" }).click();

    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(header(page).getByRole("link", { name: "Home" })).toBeVisible();
  });

  test("يحافظ على المسار عند تبديل اللغة", async ({ page }) => {
    await gotoLocalized(page, ROUTES.about);
    await openLanguageMenu(page);

    await page.getByRole("menuitem", { name: "English" }).click();

    await expect(page).toHaveURL(/\/en\/about-us/);
    await expect(
      header(page).getByRole("link", { name: "About Us" }),
    ).toHaveAttribute("aria-current", "page");
  });
});
