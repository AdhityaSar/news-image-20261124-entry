// main.ts — validate entry.png and copy it into the make.fun output directory.
// Node 22, no dependencies, no network, no browser.
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX_BYTES = 1048576;
const PNG_SIGNATURE = "89 50 4E 47 0D 0A 1A 0A";
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const bytes = readFileSync("entry.png");

if (bytes.length > MAX_BYTES) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the ${MAX_BYTES} byte limit`);
}
if (!bytes.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error(`entry.png does not start with the PNG signature ${PNG_SIGNATURE}`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });

// /output is a mount point: empty its contents, never remove the directory itself.
for (const entry of readdirSync(outDir)) {
  rmSync(join(outDir, entry), { recursive: true, force: true });
}

const target = join(outDir, "entry.png");
writeFileSync(target, bytes);
console.log(`wrote ${target} (${statSync(target).size} bytes)`);
