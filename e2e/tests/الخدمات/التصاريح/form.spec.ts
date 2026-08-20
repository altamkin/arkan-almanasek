import { test, expect, type Locator, type Page } from "@playwright/test";
import { gotoLocalized, ROUTES } from "../../../helpers/navigation";

const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function fillDateInput(locator: Locator, value: string) {
  await locator.click();
  await locator.fill(value);
  await locator.blur();
}

async function mockPermitApis(page: Page) {
  await page.route("**/permit/get_request", async (route) => {
    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ error: "Not found" }),
    });
  });

  await page.route("**/permit/request", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "e2e-permit-token" }),
    });
  });

  await page.route("**/permit/update_request", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "e2e-permit-token" }),
    });
  });
}

async function uploadTinyImage(locator: Locator, name: string) {
  await locator.setInputFiles({
    name,
    mimeType: "image/png",
    buffer: TINY_PNG,
  });
}

test.describe("اختبارات التصاريح - النموذج", () => {
  test.describe.configure({ retries: 1 });

  test.beforeEach(async ({ page }) => {
    await mockPermitApis(page);
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

  test("يكمل مسار الطلب حتى المراجعة والإرسال", async ({ page }) => {
    const dialog = page.getByRole("dialog");

    await dialog.getByText("تصريح حج", { exact: true }).click();
    await dialog.getByRole("button", { name: "التالي" }).click();
    await expect(dialog.getByText("المعلومات الشخصية")).toBeVisible();

    await dialog.getByPlaceholder("أدخل اسمك الرباعي").fill("أحمد العكبري");
    await dialog.getByPlaceholder("5xxxxxxxx").fill("501234567");
    await dialog.getByPlaceholder("name@example.com").fill("ahmed@example.com");
    await dialog.getByPlaceholder("1234567890").fill("1234567890");
    await fillDateInput(dialog.locator('input[type="date"]'), "1990-01-01");
    await dialog.locator("select").selectOption("المملكة العربية السعودية");

    const fileInputs = dialog.locator('input[type="file"]');
    await uploadTinyImage(fileInputs.nth(0), "id-photo.png");
    await uploadTinyImage(fileInputs.nth(1), "personal-photo.png");

    await dialog.getByRole("button", { name: "التالي" }).click();
    await expect(dialog.getByRole("heading", { name: "الدفع" })).toBeVisible({
      timeout: 25_000,
    });

    await dialog.getByLabel("اسم حامل البطاقة").fill("Ahmed Alakbari");
    await dialog.getByPlaceholder("0000 0000 0000 0000").fill("4242424242424242");
    await dialog.getByPlaceholder("MM/YY").fill("12/30");
    await dialog.getByPlaceholder("123").fill("123");

    await dialog.getByRole("button", { name: "التالي" }).click();
    await expect(dialog.getByText("ملخص الطلب")).toBeVisible({
      timeout: 15_000,
    });
    await expect(dialog.getByText("تصريح حج").first()).toBeVisible();
    await expect(dialog.getByText("أحمد العكبري")).toBeVisible();
    await expect(dialog.getByText("1234567890")).toBeVisible();
    await expect(dialog.getByText("مكتملة")).toBeVisible();

    await dialog.getByRole("button", { name: "إرسال الطلب" }).click();
    await expect(page.getByRole("dialog")).toBeHidden({ timeout: 15_000 });
  });
});
