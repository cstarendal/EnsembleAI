import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);
const devURL = "http://127.0.0.1:5173";
const previewURL = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "html",
  timeout: 60 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  use: {
    baseURL: isCI ? previewURL : devURL,
    trace: "on-first-retry",
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
  },
  projects: isCI
    ? [
        {
          name: "chromium",
          use: { ...devices["Desktop Chrome"] },
        },
      ]
    : [
        {
          name: "chromium",
          use: { ...devices["Desktop Chrome"] },
        },
        {
          name: "firefox",
          use: { ...devices["Desktop Firefox"] },
        },
        {
          name: "webkit",
          use: { ...devices["Desktop Safari"] },
        },
      ],
  webServer: {
    command: isCI
      ? "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort"
      : "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort",
    url: isCI ? previewURL : devURL,
    reuseExistingServer: !isCI,
    timeout: 180 * 1000,
  },
});
