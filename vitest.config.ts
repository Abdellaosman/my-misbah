import path from "node:path";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      // The real "server-only" package unconditionally throws when imported
      // outside Next.js's "react-server" bundler condition (which Vite/
      // Vitest doesn't set). Route handlers and server-only libs import it
      // purely as a lint-time marker, so it's safe to no-op under test.
      "server-only": path.resolve(__dirname, "node_modules/server-only/empty.js"),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next", "generated", "tests/e2e/**"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
