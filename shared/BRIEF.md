# vamp.sh lander — prototype brief

## What the page is for
vamp.sh introduces **VAMP**, an open (MIT) media-catalog protocol, and only secondarily
**Vampire**, the paid Mac/iOS app built on it. Lead with the open layer. Pricing: at most one
quiet line ("Vampire is a one-time purchase").

**"Vamp" as in jazz.** A vamp is a short repeating figure the band plays under everything —
"vamp till ready" — so soloists can enter and leave. The protocol is the vamp: a steady,
shared groundwork (assets, revisions, events) that any tool, app or agent can play over.
Use the idea structurally (loops, repeats, call-and-response, cue to enter), not as clip-art
saxophones or music-note emoji.

## Facts you may state (verify anything else in `../vamp/` before claiming it)
- VAMP: experimental media-catalog interoperability protocol, wire version `0.1`, status
  `experimental`. MIT. The repo holds the semantic + operation contract
  (`crates/vamp-protocol/protocol/contract.json`), Rust types, and generated JSON Schemas.
- Schema bundle (from `cargo run -p vamp-protocol --example schema`): 16 JSON Schemas (asset,
  asset_view, collection, context, duplicate_candidate, error, event, job, metadata_patch,
  processor, smart_folder, store_request, store_response, tag_group, tool_request,
  tool_response) plus the semantic `contract` and the `protocol_version` string.
- Reference-only catalog: originals are referenced in place, identified by BLAKE3 of the exact
  bytes; assets have stable UUIDs independent of path; revisions advance on metadata change;
  `--expected-revision` rejects stale writes; every change is an ordered event (kinds include
  media_added, media_updated, media_trashed, representation_ready, observation_added,
  collection_updated, ...). One local authority (SQLite), replicas follow its event stream.
- Processors: explicitly registered local executables, argv only (never a shell), one
  ToolRequest JSON on stdin, one ToolResponse out; they add observations (captions, tags,
  embeddings) without touching originals.
- Agents: agents work in the library with the CLI (`vamp guide` prints the agent manual),
  e.g. research "explorations" that file findings with provenance and read the owner's
  ratings back.
- Vampire (proprietary, one-time purchase): Eagle-style Mac/iOS library app on VAMP;
  replicas over Tailscale; browser clipper.
- NOT true / do not claim: published packages (no crates.io / npm yet), public GitHub repos
  (both are private for now: say "soon" or link `#`), user counts, stars, testimonials,
  benchmarks, "open-source app". The CLI and server are part of Vampire, not the MIT repo.
  No fake logos. No invented customers.

## Visual identity anchor: the app icon
`shared/app-icon-1024.png` (and `-512`): a coral moon with a black bat on a deep aubergine
ground. Quantized palette:
- ground: `#08040f` `#0d0614` (near-black violet), aubergine `#290922` `#3f0d28` `#59142d`
- moon: coral `#ef514f` → crimson `#ce2b39`
- bat / ink: `#000000`
Use this palette (you may add one paper/off-white or one cool neutral if your direction needs
it). Reuse the icon itself sparingly; redraw the bat/moon as a mark if it helps.

## Owner's favorites from the research (VAMP explorations on desktop)
`vamp explore show vamp-sh-aesthetics` and `vamp explore show vamp-sh-basement` (CLI on
desktop) list every finding with notes; `vamp media fetch <id> --kind preview` gives an image
path. The integrator's picks (prefix ids):
- Bakers: `20b90e7a` Keke terminal ASCII bust; `a0facc14` Giza stipple hero + giant stats;
  `eeb061fe` one-oversized-sentence hero; `61bba931` CLI window over landscape;
  `6bd5c3db` wordmark over ASCII field; `d97154cd` Paper Shaders (dither/halftone/grain).
- basement: `4d2a6a62` HUMAN | MACHINE toggle; `24e4809f` machine view (orange-on-black
  text page, llms.txt); `499c5332` pixel-block fill-in loader; `fca68b80` install steps beside
  a live terminal; `6975caab` heavy grotesk mixed with a pixel face; `1f958c99` live cursors.

## Craft bar (not AI slop)
Hard no: gradient blobs/mesh backgrounds, glassmorphism, a 3-up grid of feature cards with
icons, centered hero + two pill buttons as the whole idea, "Unlock / Supercharge / Seamless",
emoji, stock 3D, default Inter everything, fake dashboards, lorem ipsum, rocket ships.
Do: one strong typographic idea and a real grid; real content (actual operation names, real
JSON from the contract, real event kinds); restrained, purposeful motion (respect
`prefers-reduced-motion`); excellent mobile; fast (no heavy frameworks needed; static
HTML/CSS/JS, self-hosted open-licensed fonts under the prototype folder, no runtime CDNs);
accessible contrast for body text. Study real references before designing and cite them.

## Deliverable per prototype
`prototypes/<slug>/index.html` (+ its assets) that works from `file://` and from any static
server; a `NOTES.md` with the concept, references (with URLs), type/color system, and what's
placeholder. Do not commit (the integrator commits).
