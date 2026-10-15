# vamp-till-ready

A Blue Note record sleeve as a web page.

## Concept

The page is laid out like an LP. The front cover sets VAMP huge and cropped, the way Reid Miles set UNITY and *blue*, with the icon's coral moon reworked as the record label: a black disc, a coral label, the bat printed on it. Below the cover, a "Side A" track list holds the five real parts of the protocol, with each running time replaced by a count you can check (16 contract sections, 33 types, 18 schema roots, 18 event kinds, 3 processor triggers). After that come the Personnel (who plays over the vamp), the liner notes on paper stock (the protocol's ideas in prose), and a back-cover colophon.

"Vamp till ready" is how the page moves. A single clock at 96 bpm counts four bars of four. On each beat the record steps 1/16 of a turn, the band's bar counter ticks, and the event ticker moves on by one event. An event that leaves the strip comes back at the end with the next sequence number: the figure repeats, but the stream never does. One full phrase (one turn of the record) takes 10 s.

## Structure

1. **Front cover**: catalog mark (`VAMP 0.1`, bat in a box), the lineup `contract / types / schemas / events / processors` (it doubles as navigation), an `EXPERIMENTAL` box where Blue Note printed `STEREO`, the one-sentence hero, the CTA *Read the contract* (`#`), the record, and the wordmark.
2. **The band**: `Vamp till ready`, a 16-tick bar counter, a looping ticker of the 18 real event kinds with sequence numbers, and a *Stop the vamp* button (WCAG 2.2.2 pause).
3. **Side A**: A1 Contract, A2 Types, A3 Schemas, A4 Events, A5 Processors. Each track has a description and a "lyric" line listing the actual names (contract sections, type names, schema roots, event kinds, triggers/job states/limits).
4. **Personnel**: a coral block with five credits (Library, Processors, Agents, Replicas, and Vampire as the guest, printed in black). This is the page's one pricing line: "Proprietary, and a one-time purchase."
5. **Back cover**: the masthead *Vamp till ready*, three columns of liner notes (reference-only, BLAKE3 identity, revisions and `--expected-revision`, ordered events and atomic commits, one local authority, processors), a pull quote taken verbatim from `contract.json`, a ProcessorSpec exhibit, a colophon, the CTA again, and an address line.

## References (registered in VAMP: `vamp-sh-prototypes` → `vamp-till-ready/references`)

- Larry Young, *Unity* (Blue Note 4221, 1965), design by Reid Miles. The front cover's structure: a word set as the picture, flat discs as the only colour, and the personnel strung across the top. https://en.wikipedia.org/wiki/Unity_(Larry_Young_album)
- Kenny Burrell, *Midnight Blue* (Blue Note 4123, 1963), Reid Miles. A condensed grotesque in one colour on a dark ground, bleeding off the bottom edge. https://en.wikipedia.org/wiki/Midnight_Blue_(Kenny_Burrell_album)
- Freddie Hubbard, *Hub-Tones* (Blue Note 4115, 1962), Reid Miles. Repeating bars with one dropped, which became the 16-tick bar counter. https://www.moma.org/collection/works/185424
- Jackie McLean, *It's Time!* (Blue Note 4179, 1964), Reid Miles. Type repeated into texture, which became the event ticker. https://en.wikipedia.org/wiki/It%27s_Time!_(Jackie_McLean_album)
- *A Date with Jimmy Smith, Vol. 1* (Blue Note 1547, 1957). A hard colour band holding the whole personnel, which became the Personnel block. https://archive.org/details/lp_a-date-with-jimmy-smith-volume-one_lou-donaldson-donald-bryd-hank-mobley-eddi
- John Coltrane, *Blue Train* (Blue Note 1577, 1957), Reid Miles. The catalogue number set into the title, which became `VAMP 0.1`. https://en.wikipedia.org/wiki/Blue_Train_(album)
- Bakers, homepage hero (owner's favourite `eeb061fe`). A single oversized sentence as the hero. https://bakers.studio/
- Behind the Covers, "Blue Note: The Design Language of Modern Jazz". The two-colour printing constraint as a style. https://www.behindthecovers.com/guides/blue-note-cover-design

## Type

All fonts are self-hosted WOFF2, subset to Latin, under the SIL Open Font License (licences in `fonts/`).

- **Archivo** (variable: width 62–125, weight 100–900; Omnibus-Type). The display voice at 62% width and 900 weight, for VAMP, SIDE A, PERSONNEL and *Vamp till ready*, in the condensed-grotesque spirit of Miles' Franklin/Trade Gothic covers. At 70–85% width it sets the labels and track names, and at 100% width and 430 weight the hero sentence and body copy on dark.
- **Newsreader** (Production Type). Liner notes on paper only, so the back of the sleeve reads like printed notes.
- **IBM Plex Mono**. Real identifiers: event kinds, schema roots, commands, the exhibit.

## Colour

Taken from the icon, plus one paper stock.

| role | hex |
| --- | --- |
| ground (near-black violet) | `#0d0614` |
| band / rules (aubergine) | `#3f0d28`, `#59142d`, `#290922` |
| coral (the moon, the type, the Personnel block) | `#ef514f` |
| crimson (label rim, pull-quote rules) | `#ce2b39`; `#a31d2a` for small text on paper |
| ink (bat, vinyl) | `#000000` |
| paper (back cover) | `#efe4d6` on ink `#1a0b16` |

Measured contrast: cream on ground 15.9:1, muted text on ground 8.6:1, coral on ground 5.7:1, black on coral 6.0:1, crimson-ink on paper 6.0:1, muted on paper 6.9:1.

## Motion

- One `requestAnimationFrame` clock at 96 bpm. Each beat the record makes a quick eased step (32% of the beat) and then holds, so it reads as a metronome rather than a turntable. The run-out groove is etched with `VAMP 0.1 · SIDE A · REFERENCE-ONLY · BLAKE3 · ORDERED EVENTS · MIT`.
- The ticker advances one event per beat using WAAPI. The bar counter marks the current beat.
- With `prefers-reduced-motion`, nothing moves until the visitor presses *Vamp till ready*. The motion pauses whenever neither the cover nor the band is on screen, and *Stop the vamp* pauses it by hand.
- No frameworks. There are about 4 KB of JS; the page works without it (static record, static ticker). It runs from `file://` and from any static server.

## Accuracy

Every count and name was checked against `../vamp/` on 2026-10-15:

- 16 top-level sections in `crates/vamp-protocol/protocol/contract.json`
- 33 public types in `crates/vamp-protocol/src/lib.rs` (32 structs and 1 enum)
- 18 roots from `cargo run -p vamp-protocol --example schema`
- 18 event kinds, 3 processor triggers and 4 job states in the contract
- processor limits of 1 MiB request, 4 MiB response and a 1–3600 s timeout

The pull quote ("Stable UUID independent of original path or byte digest.") is `identity.asset`, verbatim. Note that the README says the bundle has "15 generated schema roots plus the semantic contract"; the example emits 18 keys (including `contract` and `protocol_version`). The page says 18 roots, per the brief.

## Placeholder

- Both *Read the contract* links point to `#`; the repository is private. The cover says "Source is private for now; it opens soon."
- The sequence numbers in the ticker (#4181…) are illustrative. The event kinds are real.
- The ProcessorSpec exhibit uses real field names with example values (`caption`, `./caption --max-words 24`), and is labelled as an example.
- There are no photographs. Blue Note's duotone photography is replaced by the record and type, because there are no licensed images to use.
- The lineup navigation disappears below 1080 px. There is no other navigation.
