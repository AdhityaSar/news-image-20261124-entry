// render/render.mjs — joins src/p1..p6 in order and screenshots entry.png at 1024x1024.
// Node 22, no dependencies, no network; Chrome is local.
//
//   node render/render.mjs

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const MAX_BYTES = 1048576;

// 1. the six parts, in order, joined with a newline
const parts = ["p1.html", "p2.html", "p3.html", "p4.html", "p5.html", "p6.html"];
const html = parts
  .map((p) => readFileSync(join(ROOT, "src", p), "utf8").replace(/\r\n/g, "\n"))
  .join("\n");

const pagePath = join(ROOT, "render", "page.html");
writeFileSync(pagePath, html, "utf8");
console.log(`page.html: ${Buffer.byteLength(html)} bytes from ${parts.length} parts`);

// 2. screenshot it
const outPath = join(ROOT, "entry.png");
mkdirSync(dirname(outPath), { recursive: true });
if (existsSync(outPath)) unlinkSync(outPath);

execFileSync(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=1024,1024",
    "--force-device-scale-factor=1",
    "--default-background-color=ffffffff",
    `--screenshot=${outPath}`,
    pathToFileURL(pagePath).href,
  ],
  { stdio: "ignore", windowsHide: true, timeout: 180000 }
);

// 3. verify from the PNG's own signature and IHDR
const png = readFileSync(outPath);
const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const isPng =
  sig.every((b, i) => png[i] === b) && png.subarray(12, 16).toString("latin1") === "IHDR";
if (!isPng) {
  console.error("entry.png is not a PNG");
  process.exit(1);
}
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
console.log(`entry.png: ${width}x${height}, ${png.length} bytes`);

if (width !== 1024 || height !== 1024) {
  console.error(`expected 1024x1024, got ${width}x${height}`);
  process.exit(1);
}
if (png.length > MAX_BYTES) {
  console.error(`entry.png is ${png.length} bytes, over ${MAX_BYTES}`);
  process.exit(1);
}
