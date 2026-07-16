import { randomBytes, createHash, timingSafeEqual } from "crypto";

/**
 * Random, opaque bearer tokens for sessions / magic links / password resets.
 * We only ever store the SHA-256 hash of a token in the database — the raw
 * token exists only in the cookie / URL / email sent to the user, so a
 * database read (or backup leak) alone can never be used to impersonate a
 * session or forge a magic link.
 */
export function generateToken(byteLength = 32): string {
  return randomBytes(byteLength).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function safeCompareHashes(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Short, human-friendly reference code shown to clients/practitioners, e.g. "MM-7F3K2Q". */
export function generatePublicReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  const bytes = randomBytes(6);
  let code = "";
  for (const byte of bytes) {
    code += alphabet[byte % alphabet.length];
  }
  return `MM-${code}`;
}
