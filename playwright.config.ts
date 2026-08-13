import { defineConfig, devices } from "@playwright/test";

const MOCK_API_PORT = process.env.MOCK_API_PORT ?? "3099";
const MOCK_API_BASE_URL = `http://127.0.0.1:${MOCK_API_PORT}/api/v1`;
const APP_PORT = process.env.PORT ?? "3000";
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${APP_PORT}`;

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: BASE_URL,
    locale: "ar-SA",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
      },
    },
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 7"],
        channel: "chrome",
      },
    },
  ],
  webServer: [
    {
      command: "node e2e/mock-api-server.mjs",
      url: `http://127.0.0.1:${MOCK_API_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        MOCK_API_PORT,
      },
    },
    {
      command: "npm run dev",
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        PORT: APP_PORT,
        NEXT_PUBLIC_API_BASE_URL: MOCK_API_BASE_URL,
      },
    },
  ],
});
