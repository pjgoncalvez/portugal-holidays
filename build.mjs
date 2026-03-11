import esbuild from "esbuild";
import { execSync } from "child_process";

// Type-check and emit .d.ts declaration files via tsc
execSync("tsc", { stdio: "inherit" });

// Bundle JS for CJS and ESM consumers via esbuild
const shared = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  sourcemap: true,
};

await Promise.all([
  esbuild.build({
    ...shared,
    format: "cjs",
    outfile: "dist/index.cjs",
  }),
  esbuild.build({
    ...shared,
    format: "esm",
    outfile: "dist/index.mjs",
  }),
]);

console.log("Build complete: dist/index.cjs + dist/index.mjs + dist/index.d.ts (with source maps)");
