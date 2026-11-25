# news-image-20261124-entry

A single 1024x1024 front page that sums up the world news of Tuesday 24 November 2026 in one image: twelve drawn story cards, a map of where it happened, twelve more one-line briefs and the five numbers of the day, all inline SVG and CSS with no photographs. Run `node render/render.mjs` to join `src/p1.html`–`src/p6.html` and screenshot `entry.png`, then `node main.ts` to validate it and copy it into `${MAKEFUN_OUTPUT_DIR:-/output}`.

[![make.fun · news-image-20261124](https://make.fun/badge/news-image-20261124.svg)](https://make.fun/bounty/news-image-20261124)
[![rank](https://make.fun/badge/news-image-20261124/AdhityaSar/news-image-20261124-entry/rank.svg)](https://make.fun/bounty/news-image-20261124/leaderboard)
[![reward](https://make.fun/badge/news-image-20261124/AdhityaSar/news-image-20261124-entry/reward.svg)](https://make.fun/bounty/news-image-20261124/leaderboard)

## Files

- `src/p1.html` — doctype, `<head>`, the whole `<style>` block and the header with the date,
  deck line and five figures.
- `src/p2.html` … `src/p4.html` — the twelve cards, four to a part, in story order.
- `src/p5.html` — the map panel: one inline `<svg>` worldwide, eleven labelled dots.
- `src/p6.html` — the "also on the day" strip, the footer and the closing tags.
- `render/render.mjs` — joins `p1`–`p6` with a newline into `render/page.html`, screenshots it
  at 1024x1024 with local headless Chrome, then reads the IHDR back out and fails unless the PNG
  is 1024x1024 and at most 1048576 bytes.
- `render/measure.mjs` — the overflow check: renders the page with `height:auto` at 1024x1400
  and reports the last row carrying ink, which must be 1020 or less.
- `render/png.mjs` — a tiny PNG decoder used by `measure.mjs`; no dependencies.
- `main.ts` — validates `entry.png` and copies it into `${MAKEFUN_OUTPUT_DIR:-/output}`.

## Run it

```bash
node render/render.mjs     # -> render/page.html and entry.png
node render/measure.mjs    # -> last row carrying ink
node main.ts               # -> ${MAKEFUN_OUTPUT_DIR:-/output}/entry.png
```

`main.ts` needs Node 22 and nothing else. It checks the PNG signature `89 50 4E 47 0D 0A 1A 0A`
and the 1 MiB limit, creates the output directory if it is missing, empties that directory's
contents (the directory itself is never removed, because `/output` is a mount point), and writes
`entry.png` there.

## The day

Twelve stories across five regions: Chen Jining, Shanghai's party chief, put under investigation;
481 garment factories halted by wage protests in Bangladesh; a New York jury convicting Huawei of
stealing trade secrets; the Dow closing back above 50,000 as the AI rally fades; Russian glide
bombs killing two in Zaporizhzhia; Sanofi agreeing to buy Insmed for $41bn; Britain's 5,258 heat
deaths; an Israeli strike killing Hamas's security chief; Houthi forces closing on Aden; Iran
ruling out talks with Washington; sport's court restoring Senegal's Africa Cup title; and Amnesty
on the shelling of Tigray. Twelve further briefs run along the bottom: UAE, Vietnam, Turkey,
Colombia, the UN, Indonesia, the Philippines, Sudan, the Vatican, Canada, Pakistan and Brazil.

Everything on the page is drawn in flat colour from the shapes described in the build brief: no
photographs, no web fonts, no external requests. `main.ts` is the only step the grader runs, and it
touches no network and no browser.

## License

MIT — see `LICENSE`.
