import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 240_000,
  workers: 1,
  use: {
    actionTimeout: 15_000,
    baseURL: process.env.STUDY_TEST_URL ?? "http://localhost:3000",
    viewport: { width: 1440, height: 1000 },
    userAgent: "DIFLH-browser-verification",
    channel: "chrome",
    screenshot: "only-on-failure",
  },
});
