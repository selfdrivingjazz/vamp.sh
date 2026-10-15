# vamp.sh site

Static, no framework, no runtime CDNs. Opens from `file://` or any static host. Deploy every file here except
`tools/` and this README. The design reference is `../prototypes/human-machine/`.

## Files

- `index.html`, `styles.css`, `app.js`: the Human page, the HUMAN | MACHINE switch, the terminal replay and the schema tabs.
- `field.js` + `bat-mask.js`: the ASCII bat and moon on one 4-beat loop at 92 BPM. The canvas pauses offscreen, in
  hidden tabs and in the Machine view; with reduced motion it shows a single still frame.
- `content.js`: the complete plain reference (session, schema notes, agents, contract index). It renders the Machine
  view (`#machine`) and produces `llms.txt` and `index.md`. Detail lives here, not on the Human page.
- `data.js`: generated from the protocol repo (schema bundle, `contract.json`) and `vamp commands`.
- `session.log`: the raw take the terminal is cut from (vamp 0.1.0, scratch `VAMP_HOME`).
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
