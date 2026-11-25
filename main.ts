// Entry packager for the make.fun bounty news-image-20261124.
//
// Reads `entry.png` from the repository root, checks the PNG signature and the
// 1 MiB ceiling, empties the *contents* of the output directory (never the
// directory itself: /output is a mount point, and rmSync on it fails with
// EPERM), then writes entry.png there with mode 0o644.
//
// Node 22+, no dependencies, no network, never launches a browser.
//
//   node main.ts
//   MAKEFUN_OUTPUT_DIR=out1 node main.ts

import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1048576;
const MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

// --- read and validate ------------------------------------------------------
const bytes = readFileSync(src);
const size = bytes.byteLength;

if (size < 8) {
  throw new Error(`entry.png is only ${size} bytes`);
}
for (let i = 0; i < MAGIC.length; i++) {
  if (bytes[i] !== MAGIC[i]) {
    throw new Error(
      `entry.png does not start with the PNG magic bytes (byte ${i} is 0x${bytes[i]
        .toString(16)
        .padStart(2, "0")}, expected 0x${MAGIC[i].toString(16).padStart(2, "0")})`
    );
  }
}
if (size > MAX_BYTES) {
  throw new Error(`entry.png is ${size} bytes, over the ${MAX_BYTES}-byte limit`);
}

// --- prepare the output directory -------------------------------------------
// mkdirSync is a no-op when the mount point already exists. Clearing entries
// individually keeps the directory itself (and its mount) intact.
mkdirSync(outDir, { recursive: true });
for (const name of readdirSync(outDir)) {
  rmSync(join(outDir, name), { recursive: true, force: true });
}

// --- write ------------------------------------------------------------------
const dest = join(outDir, "entry.png");
writeFileSync(dest, bytes, { mode: 0o644 });

console.log(`wrote ${dest}: ${size} bytes, mode 0644, png magic ok, under ${MAX_BYTES}`);
