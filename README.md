# The World in One Day — Tuesday 24 November 2026

A 1024x1024 front page that sums up Tuesday 24 November 2026's world news in a single
image: the date, twelve drawn news cards, a labelled map of where it happened, and
twelve further one-line briefs. Entry for the make.fun bounty
[news-image-20261124](https://make.fun/bounty/news-image-20261124).

[![make.fun · news-image-20261124](https://make.fun/badge/news-image-20261124.svg)](https://make.fun/bounty/news-image-20261124)
[![rank](https://make.fun/badge/news-image-20261124/AdhityaSar/news-image-20261124-entry/rank.svg)](https://make.fun/bounty/news-image-20261124/leaderboard)
[![reward](https://make.fun/badge/news-image-20261124/AdhityaSar/news-image-20261124-entry/reward.svg)](https://make.fun/bounty/news-image-20261124/leaderboard)

## What is in the picture

- **Header** — the date, a four-story deck line, and five numbers (`2` killed in
  Zaporizhzhia, `13` dead in the UAE bus crash, `$41bn` Sanofi buys Insmed, `5,258` UK
  heat deaths, `481` garment factories halted).
- **Twelve cards**, four across by three down, each with a flat 222x96 SVG drawing that
  carries the place name and the event inside it, then a kicker, a headline and a deck:
  Shanghai's party chief investigated, 481 Bangladeshi garment factories halted, a New
  York jury convicting Huawei, the Dow back above 50,000, Russian glide bombs in
  Zaporizhzhia, Sanofi buying Insmed, Britain's 5,258 heat deaths, a strike killing
  Hamas's security chief, Houthi forces near Aden, Iran's seven demands, Senegal's
  Africa Cup title restored, and Amnesty on Tigray shelling.
- **Bottom band** — a simplified world map with eleven named dots, and twelve more
  briefs from the day in three columns.

Everything is drawn in HTML and inline SVG: no images, no web fonts, no network calls,
no JavaScript at render time.

## Files

| Path | What it is |
| --- | --- |
| `src/page.html` | The whole page, self-contained: inline CSS and inline SVG only. |
| `render/render.mjs` | Build-time renderer: headless Chrome over `src/page.html` at 1024x1024, writes `entry.png`, verifies its size. |
| `main.ts` | The packager: validates `entry.png` and copies it to the output directory. |
| `entry.png` | The 1024x1024 submission image. |
| `LICENSE` | MIT. |

## How to run it

Requires Node 22 or newer and a local Google Chrome at
`C:\Program Files\Google\Chrome\Application\chrome.exe`. There are no dependencies to
install and nothing is fetched from the network.

Render the page to `entry.png`:

```sh
node render/render.mjs
```

That prints the byte count and reads the width and height back from the PNG header. It
fails if the result is not exactly 1024x1024, not a PNG, or over 1 MiB.

Package the entry (this never runs Chrome):

```sh
node main.ts                                   # writes /output/entry.png
MAKEFUN_OUTPUT_DIR=out1 node main.ts           # writes out1/entry.png
```

`main.ts` reads `entry.png`, checks the PNG magic bytes and the 1 MiB ceiling, creates
the output directory, empties its contents — without removing the directory itself,
because `/output` is a mount point — and writes the bytes with mode `0644`. Running it
twice produces byte-identical files.

Useful checks while editing the layout:

```sh
# the same page with the fixed height relaxed, to measure the true ink extent
node render/render.mjs --size=1024x1400 --out=measure/auto.png --auto-height

# how it reads at thumbnail size
node render/render.mjs --size=300x300 --out=measure/thumb.png --auto-height
```

## Sources

Each card names its sources in the brief it was drawn from: AP, Reuters, CNN, CNBC,
Trading Economics, The Business Standard, Sanofi, UKHSA, AFP and Amnesty International.
Every story in the picture happened, or was first reported, on Tuesday 24 November 2026.
