# vamp.sh

The website for VAMP, a visual media protocol for humans and agents, and Vampire, the viewer
client built on it. Pre-alpha.

- `site/`: the site. Static; see `site/README.md` for build, checks and deploy notes.
- `tools/preview-server.mjs`: a dependency-free static server for local previews (not deployed);
  it reads `site/` on every request, so edits show on refresh.
- `shared/BRIEF.md`: the lander brief (facts we may state, palette from the app icon, craft bar).
- `prototypes/<slug>/`: the three original prototypes (kept as references); each opens from
  `file://` and has a `NOTES.md` with concept, references, type/color system and placeholders.
  - `vamp-till-ready`: a Blue Note record sleeve (Reid Miles) as a page.
  - `human-machine`: dithered ASCII bat/moon, a HUMAN | MACHINE switch and `llms.txt`.
  - `lead-sheet`: the protocol as a Real Book chart, with an opt-in Web Audio vamp.

References used by each prototype are filed in the owner's VAMP library under the
exploration `vamp-sh-prototypes` (`vamp explore link vamp-sh-prototypes`).
