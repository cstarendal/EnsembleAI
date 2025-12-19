import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import os from "os";

const isCI = Boolean(process.env.CI);
const maxThreads = Math.max(1, Math.floor(os.cpus().length * 0.75));

export default defineConfig({
  plugins: [react()],
  cacheDir: "./node_modules/.vite",
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    pool: "threads",
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: isCI ? 2 : maxThreads,
      },
    },
    // Prevent Playwright specs (frontend/e2e) and generated artifacts from being picked up by Vitest.
    // Vitest's default include pattern can match *.spec.ts anywhere in the project.
    exclude: ["node_modules/**", "dist/**", "e2e/**", "playwright-report/**", "test-results/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "e2e/",
        "playwright-report/",
        "test-results/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData*",
        "**/fixtures*",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
