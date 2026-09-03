import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// `.mts`, damit Vite die Datei als ESM lädt statt sie durch den
// CommonJS-Umweg zu schicken — der ist in Vite 8 nur noch geduldet.
const hier = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": hier },
  },
})
