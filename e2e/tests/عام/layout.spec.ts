import { test, expect } from "@playwright/test";
import { ar } from "../../fixtures/mock-data";
import {
  gotoLocalized,
  header,
  openServicesMenu,
  ROUTES,
} from "../../helpers/navigation";

test.describe("التخطيط العام - الهيدر والفوتر", () => {
  test.beforeEach(async ({ page }) => {
    await gotoLocalized(page, ROUTES.home);
  });

  test("يعرض روابط التنقل الرئيسية في الهيدر", async ({ page }) => {
    const nav = header(page).getByRole("navigation");

    await expect(nav.getByRole("link", { name: ar.header.home })).toBeVisible();
    await expect(
      nav.getByRole("button", { name: ar.header.services }),
    ).toBeVisible();
    await expect(
      nav.getByRole("link", { name: ar.header.products }),
    ).toBeVisible();
    await expect(nav.getByRole("link", { name: ar.header.about })).toBeVisible();
    await expect(
      header(page).getByRole("link", { name: ar.header.cart, exact: true }),
    ).toBeVisible();
  });

  test("يفتح قائمة الخدمات ويعرض الروابط الفرعية", async ({ page }) => {
    await openServicesMenu(page);

    const menu = page.getByRole("menu", { name: ar.header.servicesMenu });
    await expect(
      menu.getByRole("menuitem", { name: ar.header.hadiAndUdhiyah }),
    ).toBeVisible();
    await expect(
      menu.getByRole("menuitem", { name: ar.header.badal }),
    ).toBeVisible();
    await expect(
      menu.getByRole("menuitem", { name: ar.header.permits }),
    ).toBeVisible();
  });

  test("ينتقل من قائمة الخدمات إلى صفحة الهدي والأضاحي", async ({ page }) => {
    await openServicesMenu(page);
    await page
      .getByRole("menuitem", { name: ar.header.hadiAndUdhiyah })
      .click();

    await expect(page).toHaveURL(/\/ar\/services\/hadi-and-udhiyah/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      ar.services.hadi.titleHighlight,
    );
  });

  test("يعرض أقسام الفوتر وروابط الدعم", async ({ page }) => {
    const footer = page.locator("footer");

    await expect(footer.getByText(ar.footer.quickLinks)).toBeVisible();
    await expect(footer.getByText(ar.footer.support)).toBeVisible();
    await expect(footer.getByText(ar.footer.newsletter)).toBeVisible();
    await expect(
      footer.getByRole("link", { name: ar.footer.about }),
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "الأسئلة الشائعة" }),
    ).toBeVisible();
    await expect(footer.getByRole("link", { name: "اتصل بنا" })).toBeVisible();
  });
});
