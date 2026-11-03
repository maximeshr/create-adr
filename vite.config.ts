import { qualityGate } from "quality-gate/vite";
import { defineConfig } from "vite-plus";

// OKQ base config (lint, fmt, test coverage, staged); only create-adr's structure is added here.
export default defineConfig({
  ...qualityGate,
  pack: {
    entry: ["src/cli.ts"],
    deps: {
      resolveDepSubpath: true,
    },
    dts: {
      generator: "tsgo",
    },
  },
  test: {
    ...qualityGate.test,
    include: ["src/**/*.test.ts"],
  },
});
