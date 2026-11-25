// The verification step from the brief: render a height:auto copy of the page at
// 1024x1400 and report the last row carrying ink. Must be <= 1020.
// The temporary copy is deleted afterwards so it is never committed.
//
//   node render/measure.mjs

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { decodePng, lastInkRow } from "./png.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const LIMIT = 1020;

const joined = readFileSync(join(ROOT, "render", "page.html"), "utf8");
const patched = joined.replace(
  "html,body{width:1024px;height:1024px",
  "html,body{width:1024px;height:auto"
);
if (patched === joined) {
  console.error("could not find the html,body height rule to relax");
  process.exit(1);
}

const tmp = mkdtempSync(join(tmpdir(), "n24-measure-"));
const htmlFile = join(tmp, "auto.html");
const pngFile = join(tmp, "auto.png");
writeFileSync(htmlFile, patched, "utf8");

execFileSync(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=1024,1400",
    "--force-device-scale-factor=1",
    "--default-background-color=ffffffff",
    `--screenshot=${pngFile}`,
    pathToFileURL(htmlFile).href,
  ],
  { stdio: "ignore", windowsHide: true, timeout: 180000 }
);

const img = decodePng(pngFile);
const row = lastInkRow(img);
console.log(`height:auto at 1024x${img.h}: last row carrying ink = ${row} (limit ${LIMIT})`);

rmSync(tmp, { recursive: true, force: true });
process.exit(row <= LIMIT ? 0 : 1);
