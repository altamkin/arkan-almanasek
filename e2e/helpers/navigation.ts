import { expect, type Locator, type Page } from "@playwright/test";

export const DEFAULT_LOCALE = "ar";

export const ROUTES = {
  home: "/",
  about: "/about-us",
  contact: "/contact-us",
  faq: "/FAQ",
  store: "/store",
  cart: "/cart",
  productDetails: (id = 1) => `/store/${id}/details`,
  services: {
    hadiAndUdhiyah: "/services/hadi-and-udhiyah",
    badal: "/services/badal",
    permits: "/services/permits",
  },
} as const;

export function localePath(path: string, locale = DEFAULT_LOCALE) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

export function header(page: Page) {
  return page.locator("header").first();
}

export function main(page: Page) {
  return page.locator("main");
}

/** Wait until the page shell is interactive after navigation. */
export async function waitForPageReady(page: Page) {
  // Some routes (e.g. cart) do not wrap content in <main>.
  await expect(header(page)).toBeVisible({ timeout: 30_000 });
  await page.waitForLoadState("domcontentloaded");
}

export async function gotoLocalized(
  page: Page,
  path: string,
  locale = DEFAULT_LOCALE,
) {
  await page.goto(localePath(path, locale), {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await waitForPageReady(page);
}

/** Prefer role + exact name; fall back to scoped text when needed. */
export function heading(
  page: Page,
  name: string | RegExp,
  options?: { level?: number; exact?: boolean },
): Locator {
  const roleOptions: { name: string | RegExp; exact?: boolean; level?: number } =
    {
      name,
      exact: options?.exact ?? true,
    };
  if (options?.level) roleOptions.level = options.level;
  return main(page).getByRole("heading", roleOptions).first();
}

export async function clearCartStorage(page: Page) {
  await page.addInitScript(() => {
    localStorage.removeItem("manasik_cart");
  });
}

export async function seedCartStorage(
  page: Page,
  items: Array<{
    id: number;
    quantity: number;
    type?: "product" | "service";
    name?: string;
    price?: number;
  }> = [
    {
      id: 1,
      quantity: 1,
      type: "product",
      name: "مسبحة فاخرة",
      price: 120,
    },
  ],
) {
  await page.addInitScript((cartItems) => {
    localStorage.setItem("manasik_cart", JSON.stringify(cartItems));
  }, items);
}

export async function selectListboxOption(
  page: Page,
  triggerName: string | RegExp,
  optionName: string | RegExp,
) {
  const trigger = page
    .getByRole("button", { name: triggerName })
    .or(page.getByRole("button", { name: triggerName, exact: false }))
    .first();
  await trigger.click();
  await page.getByRole("option", { name: optionName }).first().click();
}

export async function openServicesMenu(page: Page) {
  await header(page).getByRole("button", { name: "الخدمات" }).click();
  await page.getByRole("menu", { name: "قائمة الخدمات" }).waitFor();
}

export async function openLanguageMenu(page: Page) {
  await header(page).getByRole("button", { name: "اللغة" }).click();
  await page.getByRole("menu").waitFor();
}
