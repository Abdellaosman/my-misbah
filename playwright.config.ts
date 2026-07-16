import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

// The dev server this config spawns (see `webServer` below) needs the same
// test-database/test-secret env as the integration suite — see .env.test
// and vitest.setup.ts for the sibling Vitest setup.
loadEnv({ path: ".env.test" });

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    // The availability engine and booking wizard both reason in terms of a
    // specific IANA zone; pinning the browser to UTC keeps it aligned with
    // the fully-open UTC schedule global-setup seeds, so day/slot selection
    // in the spec never depends on the host machine's local timezone.
    timezoneId: "UTC",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...(process.env as Record<string, string>),
      // Never real Stripe: the spec confirms payment itself by POSTing a
      // signed webhook event (see lib/payments/fake.ts).
      PAYMENTS_PROVIDER: "fake",
      // .env.test's NEXT_PUBLIC_APP_URL points at Vitest's assumed port;
      // override it so Stripe success/cancel URLs (and anything else built
      // from this) point back at the dev server this config actually spawns.
      NEXT_PUBLIC_APP_URL: BASE_URL,
    },
  },
});
