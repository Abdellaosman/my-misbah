import "./load-env";

import { Client } from "pg";

/**
 * Playwright Test transforms every file to CommonJS internally, but Prisma
 * 7's generated client is ESM-only (`import.meta.url`) and can't be
 * `require()`d through that transform (see the "Cannot require() ES Module"
 * failure this replaced). `pg` has no such constraint, so every e2e file
 * talks to Postgres directly with plain SQL instead of importing
 * `lib/db/prisma`. Table/column names below mirror `prisma/schema.prisma`
 * exactly (Prisma quotes identifiers verbatim; there are no `@@map`s).
 */
let client: Client | null = null;

export async function getDbClient(): Promise<Client> {
  if (client) return client;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set (expected to be loaded from .env.test)");
  }
  client = new Client({ connectionString });
  await client.connect();
  return client;
}

export async function closeDbClient(): Promise<void> {
  if (client) {
    await client.end();
    client = null;
  }
}
