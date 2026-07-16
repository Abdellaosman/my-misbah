import bcrypt from "bcryptjs";

// Pure-JS bcrypt (no native build step) — safest choice for Vercel's
// serverless build environment. Cost factor 12 is a reasonable balance of
// security and latency for an interactive login request in 2026.
const BCRYPT_COST_FACTOR = 12;

const MIN_PASSWORD_LENGTH = 10;

export function isPasswordStrongEnough(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST_FACTOR);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
