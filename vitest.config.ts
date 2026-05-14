import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": "/src",
      "@domain": "/src/domain",
      "@application": "/src/application",
      "@adapters": "/src/adapters",
      "@di": "/src/di",
      "@shared": "/src/shared",
    },
  },
});
