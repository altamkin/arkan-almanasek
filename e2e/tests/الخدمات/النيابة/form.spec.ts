import { test, expect, type Locator, type Page } from "@playwright/test";
import { gotoLocalized, ROUTES } from "../../../helpers/navigation";

async function fillDateInput(locator: Locator, value: string) {
  await locator.click();
  await locator.fill(value);
  await locator.blur();
}

async function mockBadalApis(page: Page) {
  await page.route("**/on_behalf/get_request", async (route) => {
    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ error: "Not found" }),
    });
  });

  await page.route("**/on_behalf/request", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "e2e-badel-token" }),
    });
  });

  await page.route("**/on_behalf/update_request", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "e2e-badel-token" }),
    });
  });
}

test.describe("اختبارات النيابة - النموذج", () => {
  test.describe.configure({ retries: 1 });

  test.beforeEach(async ({ page }) => {
    await mockBadalApis(page);
    await gotoLocalized(page, ROUTES.services.badal);
    await page.getByRole("button", { name: "طلب عمرة بدل" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("يفتح المودال ويعرض حقول بيانات المستفيد", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("بيانات المستفيد")).toBeVisible();
    await expect(dialog.getByText("الاسم الكامل")).toBeVisible();
    await expect(dialog.getByPlaceholder("5xxxxxxxx")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "التالي" })).toBeVisible();
  });

  test("يعرض أخطاء التحقق عند الإرسال الفارغ", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "التالي" }).click();

    await expect(dialog.getByText("الاسم الكامل مطلوب")).toBeVisible();
    await expect(dialog.getByText("رقم الجوال مطلوب")).toBeVisible();
    await expect(dialog.getByText("تاريخ الميلاد مطلوب")).toBeVisible();
    await expect(dialog.getByText("هذا الحقل مطلوب")).toBeVisible();
  });

  test("يملأ البيانات وينتقل لخطوة الدفع", async ({ page }) => {
    const dialog = page.getByRole("dialog");

    await dialog.locator('input[type="text"]').first().fill("أحمد العكبري");
    await dialog.getByPlaceholder("5xxxxxxxx").fill("501234567");
    await dialog.locator('input[type="email"]').fill("ahmed@example.com");
    await fillDateInput(dialog.locator('input[type="date"]'), "1990-01-01");
    await dialog.locator('input[type="radio"][value="no"]').check();

    await dialog.getByRole("button", { name: "التالي" }).click();

    await expect(dialog.getByText("الاسم الكامل مطلوب")).toHaveCount(0);
    await expect(dialog.getByText("الدفع").first()).toBeVisible({
      timeout: 25_000,
    });
    await expect(dialog.getByText("بطاقة ائتمان / مدى")).toBeVisible();
  });
});
