import { test, expect } from "@playwright/test";
import { ar } from "../../fixtures/mock-data";
import { gotoLocalized, header, ROUTES } from "../../helpers/navigation";

const pages = [
  { name: "الرئيسية", path: ROUTES.home, heading: ar.home.heroTitle },
  { name: "من نحن", path: ROUTES.about, heading: ar.about.heroHighlight },
  { name: "تواصل معنا", path: ROUTES.contact, heading: ar.contact.title },
  { name: "الأسئلة الشائعة", path: ROUTES.faq, heading: ar.faq.titleHighlight },
  { name: "المتجر", path: ROUTES.store, heading: ar.store.productName },
  { name: "السلة", path: ROUTES.cart, heading: ar.cart.title },
  {
    name: "الهدي والأضاحي",
    path: ROUTES.services.hadiAndUdhiyah,
    heading: ar.services.hadi.titleHighlight,
  },
  {
    name: "نيابة عن",
    path: ROUTES.services.badal,
    heading: ar.services.badal.titleHighlight,
  },
  {
    name: "التصاريح",
    path: ROUTES.services.permits,
    heading: ar.services.permits.title,
  },
] as const;

test.describe("جولة شاملة على جميع الصفحات", () => {
  for (const pageInfo of pages) {
    test(`تحمّل صفحة ${pageInfo.name} بنجاح`, async ({ page }) => {
      const response = await page.goto(
        `/ar${pageInfo.path === "/" ? "" : pageInfo.path}`,
        { waitUntil: "domcontentloaded" },
      );

      expect(response?.ok()).toBeTruthy();
      await expect(
        page.getByText(pageInfo.heading, { exact: false }).first(),
      ).toBeVisible();
    });
  }

  test("جميع روابط الهيدر تعمل", async ({ page }) => {
    await gotoLocalized(page, ROUTES.home);

    await header(page).getByRole("link", { name: ar.header.about }).click();
    await expect(page).toHaveURL(/\/ar\/about-us/);

    await header(page).getByRole("link", { name: ar.header.products }).click();
    await expect(page).toHaveURL(/\/ar\/store/);

    await header(page).getByRole("link", { name: ar.header.home }).click();
    await expect(page).toHaveURL(/\/ar\/?$/);
  });
});
