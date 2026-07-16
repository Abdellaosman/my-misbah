import "./load-env";

import { existsSync, readFileSync, unlinkSync } from "fs";
import path from "path";
import { cleanupE2EFixture, type E2EFixture } from "./fixtures";
import { closeDbClient } from "./db";

const FIXTURE_PATH = path.join(__dirname, ".fixture.json");

export default async function globalTeardown(): Promise<void> {
  if (!existsSync(FIXTURE_PATH)) return;
  const fixture = JSON.parse(readFileSync(FIXTURE_PATH, "utf-8")) as E2EFixture;
  await cleanupE2EFixture(fixture);
  unlinkSync(FIXTURE_PATH);
  await closeDbClient();
}
