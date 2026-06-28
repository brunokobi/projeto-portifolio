import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["**/node_modules/**", "**/App.test.js", "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "src/hooks/**",
        "src/utils/**",
        "src/pages/News/newsFunctions.ts",
        "src/contexts/**",
        "src/components/ErrorBoundary/**",
        "src/components/ContatoForm/**",
        "src/components/WeatherBar/**",
      ],
      thresholds: {
        statements: 55,
        branches: 45,
        functions: 55,
        lines: 55,
      },
    },
  },
});
