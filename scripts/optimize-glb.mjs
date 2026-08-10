#!/usr/bin/env node
/**
 * Optimise Renaker tower GLBs for web.
 *
 * Drop originals into:  public/models/renaker/source/
 * Optimised output to:  public/models/renaker/
 *
 *   npm run optimize:models
 *   npm run optimize:models -- --file crownst.glb
 *   npm run optimize:models:heavy
 */

import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sourceDir = path.join(root, "public/models/renaker/source");
const outDir = path.join(root, "public/models/renaker");
const bin = path.join(root, "node_modules/.bin/gltf-transform");

const args = process.argv.slice(2);
const forceHeavy = args.includes("--heavy");
const fileIdx = args.indexOf("--file");
const onlyFile = fileIdx >= 0 ? args[fileIdx + 1] : null;

mkdirSync(sourceDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

function mb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function run(cmdArgs) {
  console.log(`\n> gltf-transform ${cmdArgs.join(" ")}`);
  const result = spawnSync(bin, cmdArgs, {
    cwd: root,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`gltf-transform failed: ${cmdArgs[0]}`);
  }
}

function optimizeOne(filename) {
  const input = path.join(sourceDir, filename);
  const base = path.basename(filename, path.extname(filename));
  const output = path.join(outDir, `${base}.glb`);
  const before = statSync(input).size;
  const heavy = forceHeavy || before > 25 * 1024 * 1024;
  const textureSize = heavy ? "1024" : "2048";

  console.log(
    `\n=== ${filename} (${mb(before)}) — ${heavy ? "HEAVY" : "standard"} · textures ≤${textureSize} ===`,
  );

  run([
    "optimize",
    input,
    output,
    "--texture-compress",
    "webp",
    "--texture-size",
    textureSize,
    "--compress",
    "draco",
    "--simplify",
    "false",
    "--join-named",
    "false",
  ]);

  const after = statSync(output).size;
  const ratio = (((before - after) / before) * 100).toFixed(1);
  console.log(`✓ ${base}.glb  ${mb(before)} → ${mb(after)}  (−${ratio}%)`);
}

const files = readdirSync(sourceDir).filter(
  (f) => f.toLowerCase().endsWith(".glb") && !f.startsWith("."),
);

const targets = onlyFile
  ? files.filter((f) => f === onlyFile || f === path.basename(onlyFile))
  : files;

if (targets.length === 0) {
  console.log(`No GLBs in ${sourceDir}`);
  process.exit(0);
}

targets.sort(
  (a, b) =>
    statSync(path.join(sourceDir, a)).size -
    statSync(path.join(sourceDir, b)).size,
);

console.log(`Optimising ${targets.length} file(s)`);
for (const file of targets) {
  optimizeOne(file);
}
console.log("\nDone. Optimised → public/models/renaker/");
