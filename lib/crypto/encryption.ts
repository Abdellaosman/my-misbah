import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

/**
 * AES-256-GCM encryption for secrets-at-rest (Zoom OAuth tokens, 2FA
 * secrets). Key comes from `ZOOM_TOKEN_ENCRYPTION_KEY` — a 32-byte value,
 * base64-encoded, that must live outside the repo (see .env.example).
 *
 * Ciphertext format: base64(iv [12 bytes] || authTag [16 bytes] || data).
 * Storing iv+authTag alongside the ciphertext (rather than in separate
 * columns) keeps the schema simple while remaining fully self-describing.
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const raw = process.env.ZOOM_TOKEN_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("ZOOM_TOKEN_ENCRYPTION_KEY is not set");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      "ZOOM_TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes (AES-256)",
    );
  }
  return key;
}

export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptSecret(ciphertext: string): string {
  const key = getKey();
  const buf = Buffer.from(ciphertext, "base64");
  const iv = buf.subarray(0, IV_LENGTH);
  const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
