import { test, expect } from "@playwright/test";
import { ar } from "../../../fixtures/mock-data";
import {
  gotoLocalized,
  heading,
  main,
  ROUTES,
} from "../../../helpers/navigation";

test.describe("اختبارات النيابة", () => {
  test.describe.configure({ retries: 1 });

  test.beforeEach(async ({ page }) => {
    await gotoLocalized(page, ROUTES.services.badal);
    await expect(main(page).getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("تعرض العنوان والوصف", async ({ page }) => {
    await expect(main(page).getByRole("heading", { level: 1 })).toContainText(
      ar.services.badal.titleHighlight,
    );
    await expect(heading(page, ar.services.badal.aboutTitle)).toBeVisible();
  });

  test("تعرض باقات الخدمة من الـ API", async ({ page }) => {
    await expect(
      main(page).getByText("حج عن الغير", { exact: true }),
    ).toBeVisible();
    await expect(
      main(page).getByText("عمرة عن الغير", { exact: true }),
    ).toBeVisible();
  });

  test("تعرض شروط الخدمة والأسئلة الشائعة", async ({ page }) => {
    await expect(heading(page, ar.services.badal.aboutTitle)).toBeVisible();
    await expect(heading(page, "المتوفى")).toBeVisible();
    await expect(heading(page, "العاجز عجزاً دائماً")).toBeVisible();
    await expect(heading(page, "ثقة وشفافية مطلقة")).toBeVisible();
  });

  test("يعرض زر بدء الطلب", async ({ page }) => {
    await expect(
      main(page).getByRole("link", { name: ar.services.badal.primaryCta }),
    ).toBeVisible();
  });
});
