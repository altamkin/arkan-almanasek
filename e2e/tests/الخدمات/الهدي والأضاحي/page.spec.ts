import { test, expect } from "@playwright/test";
import { ar } from "../../../fixtures/mock-data";
import {
  gotoLocalized,
  heading,
  main,
  ROUTES,
} from "../../../helpers/navigation";

test.describe("اختبارات الهدي والأضاحي", () => {
  test.describe.configure({ retries: 1 });

  test.beforeEach(async ({ page }) => {
    await gotoLocalized(page, ROUTES.services.hadiAndUdhiyah);
    await expect(main(page).getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("تعرض العنوان والتنبيه الشرعي", async ({ page }) => {
    await expect(main(page).getByRole("heading", { level: 1 })).toContainText(
      ar.services.hadi.titleHighlight,
    );
    await expect(heading(page, ar.services.hadi.noticeTitle)).toBeVisible();
  });

  test("تعرض أنواع النسك من الـ API", async ({ page }) => {
    await expect(main(page).getByText("خروف", { exact: true })).toBeVisible();
    await expect(main(page).getByText("بقرة", { exact: true })).toBeVisible();
  });

  test("تعرض خطوات الخدمة", async ({ page }) => {
    await expect(heading(page, "حدد نوع النسك")).toBeVisible();
    await expect(heading(page, "دفع آمن")).toBeVisible();
    await expect(heading(page, "تنفيذ شرعي")).toBeVisible();
    await expect(heading(page, "تأكيد الإنجاز")).toBeVisible();
  });
});
