import { test, expect } from "@playwright/test";
import { gotoLocalized, ROUTES } from "../../../helpers/navigation";

test.describe("اختبارات التصاريح - النموذج", () => {
  test.describe.configure({ retries: 1 });

  test.beforeEach(async ({ page }) => {
    await gotoLocalized(page, ROUTES.services.permits);
    await page.getByRole("button", { name: "طلب خدمة التصاريح" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("يفتح المودال ويعرض اختيار نوع التصريح", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("اختر نوع التصريح المطلوب")).toBeVisible();
    await expect(dialog.getByText("تصريح حج")).toBeVisible();
    await expect(dialog.getByText("تصريح عمرة")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "التالي" })).toBeVisible();
  });

  test("ينتقل لخطوة البيانات بعد اختيار النوع", async ({ page }) => {
    const dialog = page.getByRole("dialog");

    await dialog.getByText("تصريح حج", { exact: true }).click();
    await dialog.getByRole("button", { name: "التالي" }).click();

    await expect(dialog.getByText("المعلومات الشخصية")).toBeVisible({
      timeout: 15_000,
    });
    await expect(dialog.getByPlaceholder("أدخل اسمك الرباعي")).toBeVisible();
    await expect(dialog.getByText("رقم الهوية / جواز السفر")).toBeVisible();
  });

  test("يعرض أخطاء التحقق في خطوة البيانات عند الإرسال الفارغ", async ({
    page,
  }) => {
    const dialog = page.getByRole("dialog");

    await dialog.getByText("تصريح عمرة", { exact: true }).click();
    await dialog.getByRole("button", { name: "التالي" }).click();
    await expect(dialog.getByText("المعلومات الشخصية")).toBeVisible();

    await dialog.getByRole("button", { name: "التالي" }).click();

    await expect(dialog.getByText(/مطلوب|غير صحيح/).first()).toBeVisible();
  });
});
