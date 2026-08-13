import { test, expect } from "@playwright/test";
import { ar } from "../../../fixtures/mock-data";
import { gotoLocalized, main, ROUTES } from "../../../helpers/navigation";

test.describe("اختبارات التصاريح", () => {
  test.beforeEach(async ({ page }) => {
    await gotoLocalized(page, ROUTES.services.permits);
  });

  test("تعرض العنوان والوصف", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: ar.services.permits.title }),
    ).toBeVisible();
    await expect(page.getByText("شريكك الموثوق في رحلة العمر")).toBeVisible();
  });

  test("تعرض أنواع التصاريح", async ({ page }) => {
    await expect(page.getByText(ar.services.permits.typesTitle)).toBeVisible();
    await expect(page.getByText("تصريح الحج").first()).toBeVisible();
    await expect(page.getByText("تصريح العمرة").first()).toBeVisible();
    await expect(page.getByText("تصاريح موسمية")).toBeVisible();
  });

  test("تعرض المستندات المطلوبة", async ({ page }) => {
    await expect(
      page.getByText(ar.services.permits.documentsTitle),
    ).toBeVisible();
    await expect(
      page.getByText("صورة الهوية الوطنية / الإقامة"),
    ).toBeVisible();
    await expect(
      page.getByText("صورة شخصية حديثة (خلفية بيضاء)"),
    ).toBeVisible();
  });

  test("تعرض خطوات الحصول على التصريح", async ({ page }) => {
    await expect(page.getByText("خطوات الحصول على التصريح")).toBeVisible();
    await expect(main(page).getByText("تقديم الطلب").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "استلام التصريح" }),
    ).toBeVisible();
  });
});
