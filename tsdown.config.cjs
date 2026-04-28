const { defineConfig } = require("tsdown");

module.exports = defineConfig({
  entry: {
    cli: "src/cli.ts",
  },
  platform: "node",
  format: ["cjs"],
  outDir: "dist",
  clean: true,
});
