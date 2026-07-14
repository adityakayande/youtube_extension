// scripts/build.mjs
//
// Build pipeline for the extension. Bundles each TypeScript entry point with
// esbuild and copies static assets (manifest, HTML, CSS, icons) into dist/.
//
// Usage:
//   node scripts/build.mjs          -> one-off production build
//   node scripts/build.mjs --watch  -> rebuild on file change

import * as esbuild from "esbuild";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const watch = process.argv.includes("--watch");

/** Entry points: [source file, output file relative to dist/] */
const entryPoints = [
  { in: "src/background/service-worker.ts", out: "background/service-worker.js" },
  { in: "src/content/content-script.ts", out: "content/content-script.js" },
  { in: "src/popup/popup.ts", out: "popup/popup.js" },
];

/** Static files copied as-is into dist/ (source path -> dest path, both relative to root/dist) */
const staticFiles = [
  ["manifest.json", "manifest.json"],
  ["src/popup/popup.html", "popup/popup.html"],
  ["src/popup/popup.css", "popup/popup.css"],
  ["src/content/styles/focus-mode.css", "content/focus-mode.css"],
];

const iconFiles = ["icon16.png", "icon32.png", "icon48.png", "icon128.png"];

async function copyStatic() {
  for (const [src, dest] of staticFiles) {
    const destPath = path.join(dist, dest);
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.copyFile(path.join(root, src), destPath);
  }
  await fs.mkdir(path.join(dist, "icons"), { recursive: true });
  for (const icon of iconFiles) {
    await fs.copyFile(path.join(root, "icons", icon), path.join(dist, "icons", icon));
  }
  console.log(`[build] copied ${staticFiles.length + iconFiles.length} static files`);
}

async function run() {
  await fs.rm(dist, { recursive: true, force: true });
  await fs.mkdir(dist, { recursive: true });
  await copyStatic();

  const buildOptions = {
    entryPoints: entryPoints.map((e) => path.join(root, e.in)),
    bundle: true,
    outdir: dist,
    outbase: path.join(root, "src"),
    format: "iife",
    target: "chrome110",
    sourcemap: watch ? "inline" : false,
    minify: !watch,
    logLevel: "info",
  };

  // esbuild's outbase/outdir mapping mirrors src/<module>/<file>.ts -> dist/<module>/<file>.js
  // which matches the `out` paths declared in entryPoints above.

  if (watch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log("[build] watching for changes...");
  } else {
    await esbuild.build(buildOptions);
    console.log("[build] production build complete -> dist/");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
