import { test, expect, type Page } from "@playwright/test";
import {
  gotoLocalized,
  ROUTES,
  seedCartStorage,
} from "../../../helpers/navigation";

async function mockCheckoutApis(page: Page) {
  await page.route("**/carts/items", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        products: [
          {
            id: 1,
            name: "مسبحة فاخرة",
            price: 150,
            discount_price: 120,
            image: "https://placehold.co/400x400/png",
            description: "مسبحة عالية الجودة للحج والعمرة",
            quantity: 25,
          },
        ],
      }),
    });
  });

  await page.route("**/requests/create", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "e2e-cart-token" }),
    });
  });

  await page.route("**/requests/update", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "e2e-cart-token" }),
    });
  });

  await page.route("**/requests/cart", async (route) => {
    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ error: "Not found" }),
    });
  });
}

test.describe("نموذج السلة - بيانات العميل", () => {
  test.describe.configure({ retries: 1 });

  test.beforeEach(async ({ page }) => {
    await mockCheckoutApis(page);
    await seedCartStorage(page);
    await gotoLocalized(page, ROUTES.cart);
    await expect(page.getByText("مسبحة فاخرة").first()).toBeVisible();

    await page
      .getByRole("button", { name: "متابعة لمعلومات العميل" })
      .click();
    await expect(
      page.getByRole("heading", { name: "بيانات العميل" }),
    ).toBeVisible();
  });

  test("يعرض حقول نموذج بيانات العميل", async ({ page }) => {
    await expect(page.getByPlaceholder("محمد أحمد")).toBeVisible();
    await expect(page.getByPlaceholder("55 000 0000")).toBeVisible();
    await expect(page.getByPlaceholder("example@mail.com")).toBeVisible();
    await expect(page.getByPlaceholder("dd/mm/yyyy")).toBeVisible();
    await expect(page.getByText("هل قد حج أو اعتمر من قبل؟")).toBeVisible();
  });

  test("يعرض أخطاء التحقق عند الإرسال الفارغ", async ({ page }) => {
    await page.getByRole("button", { name: "متابعة للدفع" }).click();

    await expect(page.getByText("الاسم الكامل مطلوب")).toBeVisible();
    await expect(page.getByText("رقم الجوال مطلوب")).toBeVisible();
    await expect(page.getByText("البريد الإلكتروني مطلوب")).toBeVisible();
    await expect(page.getByText("الدولة مطلوبة")).toBeVisible();
  });

  test("يملأ النموذج وينتقل لخطوة الدفع", async ({ page }) => {
    await page.unroute("**/requests/cart");
    await page.route("**/requests/cart", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          cart: {
            products: [
              {
                id: 1,
                requested_quantity: 1,
                name: "مسبحة فاخرة",
                price: 120,
                image: "https://placehold.co/400x400/png",
              },
            ],
            services: [],
          },
          customer: {
            name: "أحمد العكبري",
            phone: "+966501234567",
            email: "ahmed@example.com",
            country: "sa",
            dob: "1990-01-01",
            performed_hajj: false,
          },
        }),
      });
    });

    await page.getByPlaceholder("محمد أحمد").fill("أحمد العكبري");
    await page.getByPlaceholder("55 000 0000").fill("501234567");
    await page.getByPlaceholder("example@mail.com").fill("ahmed@example.com");

    await page.getByRole("button", { name: "اختر الدولة" }).click();
    await page.getByRole("option", { name: "السعودية" }).click();

    await page.getByPlaceholder("dd/mm/yyyy").fill("01/01/1990");
    await page.locator('input[type="radio"][value="no"]').check();

    await page
      .locator("#customer-info-form")
      .getByRole("button", { name: "التالي" })
      .click();

    await expect(page.getByText("الاسم الكامل مطلوب")).toHaveCount(0);
    await expect(page.getByPlaceholder("1234 5678 9012 3456")).toBeVisible({
      timeout: 25_000,
    });
  });
});
