import { test, expect } from "@playwright/test";
import { ar } from "../../../fixtures/mock-data";
import { gotoLocalized, ROUTES } from "../../../helpers/navigation";

test.describe("صفحة الأسئلة الشائعة", () => {
  test.beforeEach(async ({ page }) => {
    await gotoLocalized(page, ROUTES.faq);
  });

  test("تعرض العنوان وشريط البحث", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      ar.faq.titleHighlight,
    );
    await expect(page.getByPlaceholder(ar.faq.searchPlaceholder)).toBeVisible();
    await expect(page.getByRole("button", { name: "بحث" })).toBeVisible();
  });

  test("تعرض فئات الأسئلة", async ({ page }) => {
    await expect(page.getByRole("button", { name: "الكل" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "إرشادات المناسك" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "الهدي والأضاحي" }),
    ).toBeVisible();
  });

  test("يفتح ويغلق عناصر الأسئلة الشائعة", async ({ page }) => {
    const firstQuestion = page.getByText(ar.faq.pillarsQuestion);
    await expect(firstQuestion).toBeVisible();

    const secondQuestion = page.getByText(
      "كيف يمكنني حجز نسك الهدي والأضاحي إلكترونياً؟",
    );
    await secondQuestion.click();
    await expect(
      page.getByText("يمكنك حجز الهدي والأضاحي", { exact: false }),
    ).toBeVisible();
  });

  test("تعرض قسم الدعم في نهاية الصفحة", async ({ page }) => {
    await expect(page.getByText("لم تجد إجابتك؟")).toBeVisible();
    await expect(page.getByRole("button", { name: "تواصل معنا" })).toBeVisible();
  });
});
