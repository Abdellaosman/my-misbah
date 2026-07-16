import { config } from "dotenv";

// Tests always run against the dedicated test database / test-mode secrets,
// regardless of what's in the developer's local .env, hence `override: true`.
config({ path: ".env.test", override: true });
