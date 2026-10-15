# lead-sheet — vamp.sh as a Real Book chart

## Concept

The page is a jazz lead sheet for the protocol. The title block reads like a Real Book page
(“Medium swing”, hand-lettered VAMP, composer slot “Open protocol — MIT”, folio “0.1.”), and
the hero is the vamp itself: four bars between repeat barlines whose chord symbols are the
protocol's primitives (Asset^b3 · Rev^+1 · Event^#11 · Obs^add), with real JSON from the
contract set under each bar like lyrics. Rehearsal marks [A] [B] [C] are the page sections
(the changes, the form, open for solos), the open layer closes as “Score and parts”
(contract.json + the 18 schema roots), and Vampire gets the coda: one line, on the icon's night.

The chord extensions are deliberate double meanings: `b3` = BLAKE3 identity (and a ♭3),
`+1` = the revision bump (and augmented), `#11` = event sequence 11 (and a ♯11), `add` =
`observation_added` (and an add chord). In [B] an asset's event stream is written as eight bars
whose bar numbers are the event sequence numbers (7–14); bar 11 is circled in red pencil for
the stale write that “missed the downbeat”.

## Interaction and motion

- On load and on scroll, chord symbols, titles and rehearsal boxes are “pencilled in”
  left to right (clip-path / stroke-dash). Skipped entirely under `prefers-reduced-motion`.
- **Sound is opt-in.** Nothing plays until “Play the vamp” is pressed. Web Audio, no samples:
  rootless Dm9 → G13 electric-piano comping (Charleston rhythm), walking bass with chromatic
  approach notes, swung ride and hi-hat on 2 and 4, a small generated room. ♩ = 132.
  A red playhead follows the audio clock across the four bars; the current bar's chord and
  lyric light up. Stop button, Esc, or leaving the tab stops it.
- Staves are drawn by `app.js` from SMuFL glyphs; they redraw on resize (4 bars per system on
  desktop, 2 on phones, each system starting with its own clef like a real chart).

## Palette (justification)

Dark-on-paper inversion. A Real Book page is black ink on a warm photocopy, so the chart sits
on one added paper colour, inked in the icon's near-black violet; the bandleader's red pencil
(cue, rehearsal marks, playhead, the late-entrance note) is the icon's crimson. The coda flips
to the icon itself — night ground and a coral moon — so the proprietary app lives “after the
chart”, visually separate from the open layer.

| role | value |
|---|---|
| paper (added) | `#f4efe6` + faint static grain |
| ink / text | `#0d0614` (icon near-black violet) |
| staff lines, secondary text | `#290922`, `#3f0d28`, `#59142d` (icon aubergines) |
| pencil / accents | `#ce2b39` (icon crimson; 4.56:1 on paper) |
| coda ground / moon | `#08040f` / `#ef514f` → `#ce2b39` |

## Type

| face | use | source / licence |
|---|---|---|
| Petaluma Script | title, chord symbols, rehearsal marks, hand notes | Steinberg, SIL OFL 1.1 — official unmodified `PetalumaScript.woff2` from `steinbergmedia/petaluma/redist` |
| LeadSheet Music | clef, common time, repeat barlines, slash noteheads, coda sign | renamed subset of **Petaluma** (Steinberg, OFL 1.1, RFN “Petaluma”) |
| LeadSheet Text | prose, captions, italics | renamed subset of **Edwin** (MuseScore, OFL 1.1, RFN “Edwin”) — the score text face, New Century Schoolbook lineage |
| LeadSheet Mono | JSON lyrics, code, labels | renamed subset of **IBM Plex Mono** (OFL 1.1, RFN “Plex”) |

Subsetting is a Modified Version under the OFL (FAQ 2.6), so subset files carry new family
names and keep the original copyright/licence records; licences are in `fonts/OFL-*.txt`.

## References (registered in VAMP: `vamp-sh-prototypes` → `lead-sheet/references`)

1. The Real Book, 5th ed. — “Blue Bossa” page and “Solos on G- Phrygian” page (scans):
   https://archive.org/details/fakebook_the-real-book---fifth-edition---f---bass-clef
2. Petaluma (Steinberg, OFL): https://github.com/steinbergmedia/petaluma — specimen https://www.smufl.org/fonts/
3. Edwin (MuseScore, OFL): https://github.com/MuseScoreFonts/Edwin
4. Josef Müller-Brockmann, Musica Viva, Tonhalle Zürich, 1957 (coral ground, 4 text columns):
   https://socks-studio.com/2016/11/30/joseph-muller-brockmann-musica-viva-posters-for-the-zurich-tonhalle
5. Josef Müller-Brockmann, Musica Viva, 1958 (MoMA): https://www.moma.org/collection/works/7233
6. ECM 1064/65, Keith Jarrett — The Köln Concert (Barbara Wojirsch): https://ecmrecords.com/product/fine-art-print-koln-concert/
7. ECM: Sleeves of Desire (Lars Müller Publishers): http://page-spread.com/ecm-sleeves-of-desire-a-cover-story
8. Vamp (music) — “vamp till ready”: https://en.wikipedia.org/wiki/Vamp_(music)

What was taken: page anatomy and hand lettering from the Real Book; Swiss column grid and
the coral+black programme layout from Musica Viva (every section snaps to the four bar
columns of the hero vamp); ECM's small type, wide margins and catalogue-number restraint for
the frame.

## Content sources

Every claim and JSON excerpt comes from `../vamp` (`contract.json`, README, the schema bundle
from `cargo run -p vamp-protocol --example schema`) or the CLI (`vamp events --after`, the
`revision conflict: expected 1, current 2` message from vamp-core). Event kinds, payload fields
(`original_deleted`, `operation: add`, `last_viewed_at`), revision rules (observations and
views don't bump it; trash/restore do), processor rules (argv only, stdin/stdout, staleness
check, observation events never trigger processors) are contract facts.

## Placeholder

- All CTAs: “Read the contract” jumps to the Score section; “Source, MIT · soon”, “Source ·
  soon”, “Read the contract” (Score section) and “Vampire” link to `#` (repos are private,
  no store page yet).
- Example IDs/hashes are elided illustrations (`4be1…9c02`, `e7a0…41d3`), the processor
  `tagger` and actor `agent:curator` are made-up names, tags `moon/bat/night` are sample data.
- The coda uses `assets/vampire-icon-512.png` (copied from `shared/`) at 72 px; the moon is CSS.
- No analytics, no meta images, no favicon.
