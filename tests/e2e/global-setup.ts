import "./load-env";

import { writeFileSync } from "fs";
import path from "path";
import { seedE2EFixture } from "./fixtures";
import { closeDbClient } from "./db";

const FIXTURE_PATH = path.join(__dirname, ".fixture.json");

export default async function globalSetup(): Promise<void> {
  const fixture = await seedE2EFixture();
  writeFileSync(FIXTURE_PATH, JSON.stringify(fixture, null, 2), "utf-8");
  await closeDbClient();
}
