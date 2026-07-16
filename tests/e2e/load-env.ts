import { config } from "dotenv";

// Side-effect-only module: importing this *before* anything that reads
// `process.env` (most importantly `lib/db/prisma`, which throws immediately
// if `DATABASE_URL` isn't set) guarantees `.env.test` is loaded first. ES
// module imports are hoisted and evaluated in source order before a file's
// own body runs, so every e2e file makes this its very first import.
config({ path: ".env.test" });
