# vamp.sh

The website for VAMP, a visual media protocol for humans and agents, and Vampire, the viewer
client built on it. Pre-alpha.

- `site/`: the site. Static; see `site/README.md` for build and checks.
- `tools/preview-server.mjs`: a dependency-free static server for local previews (not deployed);
  it reads `site/` on every request, so edits show on refresh.
- `wrangler.jsonc`, `www/`, `tools/deploy.sh`: the Cloudflare deploy (below).
- `shared/BRIEF.md`: the lander brief (facts we may state, palette from the app icon, craft bar).
- `prototypes/<slug>/`: the three original prototypes (kept as references); each opens from
  `file://` and has a `NOTES.md` with concept, references, type/color system and placeholders.
  - `vamp-till-ready`: a Blue Note record sleeve (Reid Miles) as a page.
  - `human-machine`: dithered ASCII bat/moon, a HUMAN | MACHINE switch and `llms.txt`.
  - `lead-sheet`: the protocol as a Real Book chart, with an opt-in Web Audio vamp.

References used by each prototype are filed in the owner's VAMP library under the
exploration `vamp-sh-prototypes` (`vamp explore link vamp-sh-prototypes`).

## Deploy

```sh
tools/deploy.sh
```

https://vamp.sh is Cloudflare Workers static assets (Worker `vamp-sh`, `wrangler.jsonc`, custom domain
`vamp.sh`); `www.vamp.sh` is a one-line Worker (`vamp-sh-www`, `www/`) that 301s to the apex.
The script deploys the committed `HEAD` (commit first): it extracts `site/`, runs `build.mjs --check`, assembles
`.deploy/site` (symlinks resolved, `tools/` and `site/README.md` dropped; `site/_headers` serves `/install` and
`/install.sh` as `text/plain`, `404.html` answers unknown paths with a 404) and runs `wrangler deploy` for both
Workers. Needs wrangler auth for the account holding the `vamp.sh` zone (`npx wrangler login`, or
`CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`); the custom domains own their DNS records and certificates.

`.github/workflows/pages.yml` still mirrors `site/` to https://selfdrivingjazz.github.io/vamp.sh/ on every push to
`main`; the page declares `https://vamp.sh/` as canonical.
