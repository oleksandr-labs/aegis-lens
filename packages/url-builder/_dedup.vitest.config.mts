import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
export default defineConfig({
  resolve: {
    alias: {
      "@aegis/url-builder": path.resolve(root, "packages/url-builder/src/index.ts"),
      "@aegis/i18n-config": path.resolve(root, "packages/i18n-config/src/index.ts"),
      "@aegis/types": path.resolve(root, "packages/types/src/index.ts"),
    },
  },
  test: { root, include: ["apps/web/src/lib/seo/dedup/**/*.test.ts"], environment: "node" },
});
