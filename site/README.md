# vamp.sh site

Static, no framework, no runtime CDNs. Opens from `file://` or any static host. Deploy every file here except
`tools/` and this README. The design reference is `../prototypes/human-machine/`.

## Files

- `index.html`, `styles.css`, `app.js`: the Human page (hero with the install one-liner and its copy button, then
  Keep, Deliver, Transform, Share, Vampire, Spec footer), the HUMAN | MACHINE switch and the Deliver terminal replay.
  Copy uses the Clipboard API in secure contexts, otherwise selection + `execCommand('copy')`; if both fail the
  command is left selected.
- `field.js` + `bat-mask.js`: the ASCII bat and moon on the stepped 92 BPM figure (wings lift on 1 and 3, settle on 2 and 4, looping without rests; one ring on the first bar only), with the BAR/beat stepper under the moon. Only changed cells are redrawn. The canvas pauses offscreen, in
  hidden tabs and in the Machine view; with reduced motion it shows a single still frame.
- `content.js`: the tagline, the install one-liner, the five section lines, every artifact and the complete plain
  reference. It renders the Machine view (`#machine`) and produces `llms.txt` and `index.md`. `build.mjs --check`
  fails if the tagline, one-liner or lines in `index.html` drift from it.
- `data.js`: generated from the protocol repo (schema bundle, `contract.json`) and `vamp commands`.
- `session.log`: the raw take every artifact is cut from (vamp 0.1.0, a scratch authority served by `vamp-server` on
  127.0.0.1 and a scratch replica). `assets/wing-study-preview.jpg` is the preview VAMP generated in that take.
- `404.html` uses root-absolute paths, so it only works when served from the site root.
- Fonts (OFL, licences in `fonts/`): Archivo pinned to weight 800 (widths 100–125), Geist Mono 400–500 and
  Departure Mono, each subset to the characters the site uses.

## Build and check (Node 18+)

```sh
python3 tools/gen-data.py            # data.js from ../../vamp (cargo) and `vamp commands`
node tools/build.mjs                 # llms.txt + index.md from content.js
node tools/build.mjs --og            # og.png from tools/og.html (headless Chrome; CHROME=/path overrides)
node tools/build.mjs --check         # stale text, broken local links/anchors, missing alt, transfer weight
uv run --with pillow python tools/icons.py   # favicon.svg/.ico, apple-touch-icon, icon-192/512
```

`tools/fonts.sh` rebuilds the font subsets from upstream; add characters to its `--unicodes` lists if the copy needs them.

## Placeholders

- Vampire: "soon", with no link.
- Protocol source and packages: "soon", with no repository link.
- `og:url` and `og:image` point at `https://vamp.sh/`.
