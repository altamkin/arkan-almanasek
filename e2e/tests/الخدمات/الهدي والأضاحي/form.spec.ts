import { test, expect, type Page } from "@playwright/test";
import { gotoLocalized, ROUTES } from "../../../helpers/navigation";

async function mockHadiApis(page: Page) {
  await page.route("**/hadi/get_request", async (route) => {
    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ error: "Not found" }),
    });
  });

  await page.route("**/hadi/request", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "e2e-hadi-token" }),
    });
  });

  await page.route("**/hadi/update_request", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "e2e-hadi-token" }),
    });
  });
}

async function addSheepToOrder(page: Page) {
  await page.getByRole("button", { name: "زيادة كمية خروف" }).click();
  await page.getByRole("button", { name: "إضافة إلى الطلب" }).click();
    await expect(page.getByText("خروف (أضحية)").first()).toBeVisible();
}

async function goToCustomerInfo(page: Page) {
  await addSheepToOrder(page);
  await page.getByRole("button", { name: "متابعة" }).click();
  await expect(
    page.getByRole("heading", { name: "بيانات العميل" }),
  ).toBeVisible();
}

test.describe("اختبارات الهدي والأضاحي - النموذج", () => {
  test.describe.configure({ retries: 1 });

  test.beforeEach(async ({ page }) => {
    await mockHadiApis(page);
    await gotoLocalized(page, ROUTES.services.hadiAndUdhiyah);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("يضيف النسك للطلب ويعرضه في تفاصيل الطلب", async ({ page }) => {
    await expect(page.getByText("لم تقم بإضافة أي عناصر بعد.")).toBeVisible();

    await addSheepToOrder(page);

    await expect(page.getByText("الكمية:")).toBeVisible();
    await expect(page.getByRole("button", { name: "متابعة" })).toBeEnabled();
  });

  test("ينتقل لبيانات العميل بعد المتابعة", async ({ page }) => {
    await goToCustomerInfo(page);

    await expect(page.getByPlaceholder("محمد أحمد")).toBeVisible();
    await expect(page.getByPlaceholder("55 000 0000")).toBeVisible();
    await expect(page.getByPlaceholder("example@mail.com")).toBeVisible();
    await expect(page.getByPlaceholder("dd/mm/yyyy")).toBeVisible();
    await expect(page.getByText("هل قد حج أو اعتمر من قبل؟")).toBeVisible();
    await expect(page.getByRole("button", { name: "التالي" })).toBeVisible();
  });

  test("يعرض أخطاء التحقق عند إرسال بيانات العميل فارغة", async ({ page }) => {
    await goToCustomerInfo(page);

    await page.getByRole("button", { name: "التالي" }).click();

    await expect(page.getByText("الاسم الكامل مطلوب")).toBeVisible();
    await expect(page.getByText("رقم الجوال مطلوب")).toBeVisible();
    await expect(page.getByText("البريد الإلكتروني مطلوب")).toBeVisible();
    await expect(page.getByText("الدولة مطلوبة")).toBeVisible();
    await expect(page.getByText("تاريخ الميلاد مطلوب")).toBeVisible();
    await expect(page.getByText("هذا الحقل مطلوب")).toBeVisible();
  });

  test("يكمل مسار الطلب حتى المراجعة وإتمام الدفع", async ({ page }) => {
    await goToCustomerInfo(page);

    await page.getByPlaceholder("محمد أحمد").fill("أحمد العكبري");
    await page.getByPlaceholder("55 000 0000").fill("501234567");
    await page.getByPlaceholder("example@mail.com").fill("ahmed@example.com");

    await page.getByRole("button", { name: "اختر الدولة" }).click();
    await page.getByRole("option", { name: "إندونيسيا" }).click();

    await page.getByPlaceholder("dd/mm/yyyy").fill("01/01/1990");
    await page.locator('input[type="radio"][value="no"]').check();

    await page.getByRole("button", { name: "التالي" }).click();

    await expect(page.getByText("الاسم الكامل مطلوب")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "طريقة الدفع" }),
    ).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText("بطاقة ائتمان / مدى")).toBeVisible();

    await page.getByLabel("اسم حامل البطاقة").fill("Ahmed Alakbari");
    await page.getByPlaceholder("1234 5678 9012 3456").fill("4242424242424242");
    await page.getByPlaceholder("MM/YY").fill("12/30");
    await page.getByPlaceholder("CVC").fill("123");

    await page.getByRole("button", { name: "تأكيد الدفع" }).click();

    await expect(
      page.getByRole("heading", { name: "مراجعة البيانات وإتمام الدفع" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("أحمد العكبري")).toBeVisible();
    await expect(page.getByText("ahmed@example.com")).toBeVisible();
    await expect(page.getByText("+966501234567")).toBeVisible();
    await expect(page.getByText("خروف (أضحية)").first()).toBeVisible();
    await expect(page.getByText("4242")).toBeVisible();

    await page.getByRole("button", { name: "إتمام الدفع" }).click();
    await expect(
      page.getByRole("heading", { name: "مراجعة البيانات وإتمام الدفع" }),
    ).toBeVisible();
  });
});
