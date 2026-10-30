import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/cli.ts"],
    format: ["esm"],
    platform: "node",
    clean: true,
    dts: false,
    deps: {
      resolveDepSubpath: true,
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
  lint: {
    ignorePatterns: ["dist/**"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    ignorePatterns: ["dist/**", "pnpm-lock.yaml", "CHANGELOG.md"],
  },
});
