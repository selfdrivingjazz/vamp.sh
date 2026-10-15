# vamp.sh

The website for VAMP (the open media-catalog protocol) and, secondarily, Vampire (the paid
Mac/iOS app built on it). Private for now.

- `site/`: the site (the owner's chosen human-machine direction, built out). Static; see
  `site/README.md` for build, checks and deploy notes.
- `tools/preview-server.mjs`: the private live preview (not deployed). Infra runs it always-on as
  `bin/sdj vamp-site` at `https://jmill-desktop.tail587341.ts.net:8475` (tailnet only); it reads
  `site/` on every request, so edits show on refresh.
- `shared/BRIEF.md`: the lander brief (facts we may state, palette from the app icon, craft bar).
- `prototypes/<slug>/`: the three original prototypes (kept as references); each opens from
  `file://` and has a `NOTES.md` with concept, references, type/color system and placeholders.
  - `vamp-till-ready`: a Blue Note record sleeve (Reid Miles) as a page.
  - `human-machine`: dithered ASCII bat/moon, a HUMAN | MACHINE switch and `llms.txt`.
  - `lead-sheet`: the protocol as a Real Book chart, with an opt-in Web Audio vamp.

References used by each prototype are filed in the owner's VAMP library under the
exploration `vamp-sh-prototypes` (`vamp explore link vamp-sh-prototypes`).
