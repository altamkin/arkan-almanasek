import { test, expect } from "@playwright/test";
import { ar } from "../../../fixtures/mock-data";
import { gotoLocalized, ROUTES } from "../../../helpers/navigation";

test.describe("صفحة تواصل معنا", () => {
  test.beforeEach(async ({ page }) => {
    await gotoLocalized(page, ROUTES.contact);
  });

  test("تعرض نموذج التواصل ومعلومات الاتصال", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: ar.contact.title }),
    ).toBeVisible();
    await expect(page.getByText(ar.contact.formTitle)).toBeVisible();
    await expect(page.getByPlaceholder("أدخل اسمك الكريم")).toBeVisible();
    await expect(page.getByPlaceholder("example@email.com")).toBeVisible();
    await expect(page.getByPlaceholder("+9xxxxxxxxx")).toBeVisible();
    await expect(page.getByPlaceholder("اكتب رسالتك هنا...")).toBeVisible();
    await expect(
      page.getByRole("button", { name: ar.contact.submit }),
    ).toBeVisible();
  });

  test("يعرض أخطاء التحقق عند إرسال نموذج فارغ", async ({ page }) => {
    await page.getByRole("button", { name: ar.contact.submit }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
  });

  test("يقبل إدخال البيانات في حقول النموذج", async ({ page }) => {
    await page.getByPlaceholder("أدخل اسمك الكريم").fill("أحمد محمد");
    await page.getByPlaceholder("example@email.com").fill("ahmed@example.com");
    await page.getByPlaceholder("+9xxxxxxxxx").fill("501234567");
    await page.locator("select").selectOption("haj");
    await page
      .getByPlaceholder("اكتب رسالتك هنا...")
      .fill("أرغب في الاستفسار عن خدمات الحج المتاحة لديكم.");

    await expect(page.getByPlaceholder("أدخل اسمك الكريم")).toHaveValue(
      "أحمد محمد",
    );
    await expect(page.getByPlaceholder("example@email.com")).toHaveValue(
      "ahmed@example.com",
    );
  });
});
