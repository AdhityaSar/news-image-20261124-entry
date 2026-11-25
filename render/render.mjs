// render/render.mjs — the build-time renderer for this entry.
//
// Launches local headless Chrome over src/page.html at window size 1024x1024,
// writes entry.png in the repository root, then reads the PNG's own IHDR to
// check it is exactly 1024x1024 and under 1 MiB. No dependencies, no network.
// main.ts never runs Chrome; this file exists for the build only.
//
//   node render/render.mjs
//   node render/render.mjs --size=1024x1400 --out=measure/auto.png --auto-height
//   node render/render.mjs --size=300x300   --out=measure/thumb.png --auto-height
//
// --auto-height re-renders the same page with only the fixed body height
// relaxed to auto, so the full document can be measured for overflow.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const MAX_BYTES = 1048576;

const has = (name) => process.argv.includes(`--${name}`);
const opt = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const srcPage = resolve(ROOT, opt("src", "src/page.html"));
const outPath = resolve(ROOT, opt("out", "entry.png"));
const [width, height] = opt("size", "1024x1024")
  .split("x")
  .map((n) => Number.parseInt(n, 10));

function pngInfo(buf) {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const magic = sig.every((b, i) => buf[i] === b);
  const isPng = magic && buf.subarray(12, 16).toString("latin1") === "IHDR";
  return {
    isPng,
    width: isPng ? buf.readUInt32BE(16) : 0,
    height: isPng ? buf.readUInt32BE(20) : 0,
  };
}

// Chrome's scratch page and profile live outside the repository, so a render
// never leaves stray files in the tree (the only ignore entry is out/).
const work = join(tmpdir(), "makefun-render-work");
mkdirSync(work, { recursive: true });
const pageCopy = resolve(work, "page.html");

let html = readFileSync(srcPage, "utf8");
if (has("auto-height")) {
  // Only the page box rule (the one carrying height: 1024px) is relaxed; every
  // element keeps its own box, so the document height equals the real ink extent.
  const relaxed = html.replace(/height:\s*1024px;/, "height: auto;");
  if (relaxed === html) throw new Error("--auto-height: could not relax the body height");
  html = relaxed;
}
writeFileSync(pageCopy, html, "utf8");

mkdirSync(dirname(outPath), { recursive: true });
rmSync(outPath, { force: true });

execFileSync(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--force-color-profile=srgb",
    "--virtual-time-budget=2000",
    `--user-data-dir=${resolve(work, "profile")}`,
    `--window-size=${width},${height}`,
    `--screenshot=${outPath}`,
    pathToFileURL(pageCopy).href,
  ],
  { stdio: "ignore", timeout: 180000 }
);

const buf = readFileSync(outPath);
const info = pngInfo(buf);
console.log(
  `rendered ${srcPage} at ${width}x${height} -> ${outPath}: ` +
    `${buf.length} bytes, ${info.width}x${info.height}, png=${info.isPng}`
);

if (!info.isPng) throw new Error("output is not a PNG");
if (info.width !== width || info.height !== height) {
  throw new Error(`expected ${width}x${height}, got ${info.width}x${info.height}`);
}
if (buf.length > MAX_BYTES) {
  throw new Error(`PNG is ${buf.length} bytes, over the ${MAX_BYTES} limit`);
}
writeFileSync(outPath, buf, { mode: 0o644 });
console.log(`ok: ${info.width}x${info.height}, ${buf.length} bytes, under 1 MiB`);
