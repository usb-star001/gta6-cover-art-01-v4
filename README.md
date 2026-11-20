# Leonida Nights — Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/usb-star001/gta6-cover-art-01-v4/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/usb-star001/gta6-cover-art-01-v4/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Turn your crew's photos into a GTA-style movie poster. Upload up to 8 photos,
give each one a role, pick a layout and a colour grade, caption it, and export
real PNGs at 1080×1080, 1080×1350 and 1920×1080.

## How it works

1. **Add photos** — upload, drag onto the preview, or paste. Click a panel to
   select it, drag a number chip to swap two panels. Per-panel pan, zoom and
   flip. "Try samples" loads an 8-person illustrated demo cast.
2. **Caption** — title (3 styles), script subtitle, tagline ribbon, review
   quote, billing block, seal, release line and edition. 4 layouts
   (Cast Mosaic, Diagonal Strips, Six Grid, Vertical Stack), 5 colour grades
   (Sunset Gold, Neon Night, Tropic Teal, Ultraviolet, Retro Print) and 3
   aspect ratios, all with a live preview.
3. **Export PNG** — current size, or all three sizes at once. Undo/redo
   included. Photos never leave the device: everything runs offline in the
   browser.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json`.

All artwork is original: the demo cast is drawn in code (`app/src/portraits.js`),
no Rockstar logo, artwork or font is used, and no network request is made.
