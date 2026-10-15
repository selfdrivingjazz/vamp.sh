# VAMP

> The protocol is the vamp: assets, revisions and events that apps and agents play over.

```text
                              :-:-:-:-:-:-:-::
                         :-:-:----=-=-=-=-=--:-:-:-
                      :-:-:--=-=-=-=-=-=-=-=-=----:-:-
                   :----=-=-==+=04de3d9c82c +==-=-=-=--:-
                 ::-:--=-=-9 82c 940 f99 473 4 8 =-=--:-:-:
                -:--=-==0bf99747384e890c05751591f a =-=--:-:
               -:-:--= 4e890c05751591f1aa27571 b62 2 3-=--:-:
             :-:=-=-+51591f1aa27571bb6202d36d22dfc0504d==-=--:-
             -:-:=-= 571 b6202d3 d22 fc0 04d 3d9 8 c 9 0-=--:-:
            -      d36d22dfc0504de3 9c82ce940bf99747384e8      :
           ::-           9c82ce940  99 4   4e8 0c0            :-:
           :--               7384          591f               -:-
           -:--                                              -:-:
           :--= = 7515                                 d9 8= -=--
           -:--=-2 571                               0 f 9 =-=:-:
           :--=-+ 36d22dfc 504de3          bf9974 384e8 0 0==--:-
           -:-:=-= d 3 9 8 c 9 0 f       4 8 0 0 7 1 9 f  -=--:-:
            -:=-=-+ 0 f99747384e890c0  51 91f aa2 571 b 2==-=--:
             -:--=-= 8 0 0 7 1 9 f a 2 5 1 b 2 2 3 d 2  ==--:-:
             :-:=-=-+ f aa27571bb6202d36d22 fc0 04d 3 9==-=--:-
               -:--=-= 2 2 3 d 2 f 0 0 d 3 9 8 c 9 0  -=--:-:
                -:--=-==0 0 d 3d9 82c 9 0 f 9 4 3 4 =-=--:-:
                 -:-:--=-=-  0 f 9 4 3 4 8 0 0   =-=-=:-:-:
                   :----=-=-==+=0 0 7 1 9 f +==-=-=-=--:-
                      :-:-:-:--=-=-=-=-=-=-=----:-:-::
                         :-:-:----=-=-=-=-=--:-:-:-
                              :-:-:-:-:-:-:-:-
```

## About

```text
NAME ............... VAMP
WHAT ............... media-catalog interoperability protocol
WIRE_VERSION ....... 0.1
STATUS ............. experimental
LICENSE ............ MIT: the contract, Rust types and generated JSON Schemas
SOURCE ............. not public yet (soon); no crates.io or npm package yet
BINDING ............ local CLI; discover operations with vamp commands and types with vamp schema
APP ................ Vampire, Mac/iOS, proprietary, one-time purchase; ships the vamp CLI and server
```

A vamp is a short figure a band repeats so soloists can come in and go out. VAMP is that figure for media: assets, revisions and events that any tool, app or agent can play over.

The catalog is reference-only. Originals stay where they are and are identified by the BLAKE3 digest of their exact bytes. One local authority (SQLite) writes; replicas follow its event stream.

## The figure: four moves

### 1. Asset

A stable UUID, independent of the file’s path or digest. The original is referenced in place: path, BLAKE3, byte size, MIME type.

```json
"id": "bc8b501d-ea5a-4c0d-90a8-5c1d5c296698",
"original": {
  "blake3": "504de3d9c82ce940bf99747384e890c05751591f1aa27571bb6202d36d22dfc0",
  "path": "/tmp/refs/moon-bat.jpg",
  "storage": "local"
}
```

### 2. Revision

Metadata changes advance the asset revision. `--expected-revision` rejects a stale write without changing metadata or emitting an event.

```json
{"error":{"code":"operation_failed","message":"revision conflict: expected 1, current 2"},"protocol_version":"0.1"}
```

### 3. Event

Every change is an ordered event with a monotonic sequence per library. Consumers keep their last sequence and ask for later events (`vamp events --after N`).

```json
{"sequence": 2, "kind": "media_updated", "actor": "agent:lander-human-machine",
 "revision": 2, "payload": {"change": "metadata"}}
```

### 4. Observation

Processors are explicitly registered local executables, run with argv and never through a shell. One ToolRequest JSON on stdin, one ToolResponse on stdout. They add observations (captions, tags, embeddings) and never edit originals.

```text
ProcessorSpec required: name, events, command, input, output
triggers: media_added, media_updated, representation_ready
```

### Event kinds (18)

- media_added
- media_updated
- media_trashed
- media_restored
- media_removed
- media_viewed
- media_hashed
- representation_ready
- observation_added
- collection_created
- collection_updated
- collection_deleted
- smart_folder_updated
- tag_groups_updated
- processing_requested
- original_upload_queued
- original_stored
- original_evicted

## Session

Recorded on 15 Oct 2026 with `vamp 0.1.0` against a scratch library (`VAMP_HOME=/tmp/vamp-lander`). The `vamp` CLI ships with Vampire. JSON on stdout; errors as JSON on stderr with a nonzero exit. Output is pretty-printed and shortened where marked `…`, never rewritten. Raw take: [session.log](session.log).

### 1. Init

A scratch home; the real library is never touched.

```sh
$ export VAMP_HOME=/tmp/vamp-lander VAMP_ACTOR=agent:lander-human-machine
$ vamp init --name lander
{
  "context": {
    "library_id": "405a94fd-ce2b-4d2e-ab48-085bb725b595",
    "original_root": null,
    "state_dir": "/tmp/vamp-lander/libraries/405a94fd-…"
  },
  "name": "lander"
}
```

### 2. Add

Read once, hash with BLAKE3, reference in place.

```sh
$ vamp media add moon-bat.jpg
{
  "id": "bc8b501d-ea5a-4c0d-90a8-5c1d5c296698",
  "name": "moon-bat.jpg",
  "original": {
    "blake3": "504de3d9c82ce940bf99747384e890c05751591f1aa27571bb6202d36d22dfc0",
    "byte_size": 30552,
    "hash_state": "hashed",
    "mime": "image/jpeg",
    "path": "/tmp/refs/moon-bat.jpg",
    "storage": "local",
    …
  },
  "revision": 1,
  …
}
```

### 3. Patch

A MetadataPatch, guarded by the revision that was read.

```sh
$ ID=bc8b501d-ea5a-4c0d-90a8-5c1d5c296698
$ cat patch.json
{"tags":["moon","bat","night"],"description":"the icon, at night"}
$ vamp media update $ID --patch patch.json --expected-revision 1
{
  "id": "bc8b501d-ea5a-4c0d-90a8-5c1d5c296698",
  "metadata": {
    "description": "the icon, at night",
    "tags": ["bat", "moon", "night"],
    …
  },
  "revision": 2,
  …
}
```

### 4. Stale write

The same expected revision again: refused, nothing written.

```sh
$ cat stale.json
{"add_tags":["coral"]}
$ vamp media update $ID --patch stale.json --expected-revision 1
{"error":{"code":"operation_failed","message":"revision conflict: expected 1, current 2"},"protocol_version":"0.1"}
[exit 1]
```

### 5. Events

Everything after cursor 1. The refused write left no event.

```sh
$ vamp events --after 1
[
  {
    "actor": "agent:lander-human-machine",
    "asset_id": "bc8b501d-ea5a-4c0d-90a8-5c1d5c296698",
    "kind": "media_updated",
    "payload": { "change": "metadata" },
    "revision": 2,
    "sequence": 2,
    …
  }
]
```

### 6. Schema

Every root of the schema bundle, printed by the binary.

```sh
$ vamp schema | jq -r 'keys[]'
asset
asset_view
collection
context
contract
duplicate_candidate
error
event
job
metadata_patch
processor
protocol_version
smart_folder
store_request
store_response
tag_group
tool_request
tool_response
```

## Schema

`vamp schema` and `cargo run -p vamp-protocol --example schema` print the same bundle: 18 roots, 16 JSON Schemas plus `contract` and `protocol_version`.

- `asset` (Asset): The catalog record: a stable UUID independent of path, a revision that advances on metadata change, the original referenced in place.
- `asset_view` (AssetView): An asset together with its representations (thumbnail, preview) and the observations processors added.
- `collection` (Collection): A folder. Folders nest via `parent_id` and are ordered among siblings by `sort_order`.
- `context` (Context): Machine-local connection configuration, not a library: which library, where its state lives, an optional remote.
- `contract`: The semantic and operation contract, bundled whole into the schema output.
- `duplicate_candidate` (DuplicateCandidate): One intake candidate checked by native `find_duplicates`: a file, raw bytes or a precomputed digest, and the existing assets it duplicates.
- `error` (ErrorResponse): Every failure is JSON on stderr with a nonzero exit.
- `event` (Event): One ordered change. Monotonic sequence within a library; consumers keep their last sequence and ask for later events.
- `job` (Job): Durable processor work: pending, running, completed or failed.
- `metadata_patch` (MetadataPatch): Omitted or null fields are unchanged. Pair it with --expected-revision to reject stale writes.
- `processor` (ProcessorSpec): An explicitly registered local executable. Arguments go straight to it, never through a shell.
- `protocol_version`: The wire version.
- `smart_folder` (SmartFolder): A saved rule set, evaluated on browse.
- `store_request` (StoreRequest): One JSON request on stdin to the `vamp-store` S3 helper; one `StoreResponse` on stdout. Credentials come from the environment (AWS_ACCESS_K…
- `store_response` (StoreResponse): The vamp-store helper’s one reply on stdout.
- `tag_group` (TagGroup): Named tag group (Eagle `tagsGroups`). Tags remain plain strings on assets.
- `tool_request` (ToolRequest): One JSON request on stdin, one JSON response on stdout; diagnostics use stderr.
- `tool_response` (ToolResponse): What a processor hands back: an observation, a palette, a representation or contact-sheet tiles.

## Agents

Agents work in the library with the same CLI; `vamp guide` prints their manual. A research mission is an exploration: a folder of findings, each filed with its source URL. The owner answers in the app with ratings and tags; the agent reads them back with `vamp explore feedback`.

```sh
# agent opens a mission
$ vamp explore ensure night-shapes --title "Night shapes" --brief "bat silhouettes, moon discs, 1-bit"
"name": "Night shapes", "items": [], "link": "vampire://open?library=405a94fd-…&folder=4fcc26b5-…"

# agent files a finding, with provenance
$ vamp explore add night-shapes --name "Moon, 1-bit" --note "threshold at 90: the bat survives as pure ink" \
    --tags moon,dither --url https://vamp.sh/ --file moon-1bit.png
"status": "created", "kind": "file", "source_url": "https://vamp.sh/", "tags": ["dither", "moon"]

# owner rates it 5 and tags it more-like-this
{"kind": "media_updated", "actor": "local", "payload": {"change": "metadata"}, "sequence": 11}

# agent reads it back
$ vamp explore feedback night-shapes
"counts": {"like": 1, "more_like_this": 1},
"items": [{"name": "Moon, 1-bit", "rating": 5, "signals": ["like", "more_like_this"], …}]
```

In this take the owner’s turn was played from the CLI, so its actor is `local`; from the app it is `tailnet:<login>/<host>`. Ratings 4–5 read as like, 1–2 as dislike; `more-like-this` means go deeper.

## Vampire

The Mac and iOS library app built on VAMP: an Eagle-style grid, replicas over Tailscale, a browser clipper. Proprietary, a one-time purchase. The protocol does not require it.

## Contract index

Names read from `contract.json` and `vamp commands`.

### Processor triggers

media_added, media_updated, representation_ready

### Job states

pending, running, completed, failed

### Error codes

invalid_arguments, operation_failed, output_failed

### Native operations (contract.native)

remote_attach, sync, sync_wait, representation, download_progress, download_priority, cancel_download, fetch_grid, init, browse, layout, items, micro, galaxy, galaxy_search, generate_thumbs, add, ingest, update, remove, restore, empty_trash, touch, collections_ops, collections, smart_folders, sidebar, tags, tag_ops, export, import_eagle, copy_thumbnails, prioritize_thumbnails, thumbnail_updates, import_eagle_start, import_status, hash, palette, inspect, find_duplicates

### HTTP endpoints (vamp-server, part of Vampire)

- `GET /v1/library`
- `GET /v1/hello`
- `GET /v1/health`
- `GET /v1/events?after=0&limit=500`
- `GET /v1/snapshot`
- `POST /v1/assets/batch`
- `POST /v1/thumbnails/pack`
- `GET /v1/events/stream?after=N&wait=30&limit=500`
- `GET /v1/search?q=&offset=0&limit=100`
- `GET /v1/search?q=&limit=100&semantic=1&hybrid=1`
- `GET /v1/assets/{id}/similar?limit=40`
- `GET /v1/embeddings/pack/meta`
- `GET /v1/embeddings/pack`
- `POST /v1/assets/{id}/accept-tags`
- `GET /v1/tags`
- `GET /v1/assets/{id}`
- `GET /v1/assets/{id}/{thumbnail|preview|original}`
- `POST /v1/assets/{id}`
- `DELETE /v1/assets/{id}?expected_revision=`
- `POST /v1/ingest?filename=&name=&source_url=&tags=a,b&note=|description=&collection_id=`
- `POST /v1/clip`
- `POST /v1/clip/batch`
- `GET /v1/collections`
- `POST /v1/collections`
- `POST /v1/collections/{id}`
- `DELETE /v1/collections/{id}`
- `POST /v1/collections/{id}/assets`
- `POST /v1/native`
- `GET /v1/assets/{id}/original?redirect=1`
- `POST /v1/jobs/claim`
- `POST /v1/jobs/{id}/heartbeat`
- `POST /v1/jobs/{id}/complete`
- `POST /v1/jobs/{id}/fail`

### CLI (`vamp commands`)

- `vamp guide`: Print the agent manual (plain text): discovery, search, safety rules
- `vamp schema`: Print protocol JSON schemas
- `vamp commands`: Print the machine-readable command and argument tree
- `vamp init`: Create an empty reference-only catalog
- `vamp contexts` [list|use|add|remote]: Manage named catalog contexts
- `vamp media` [add|list|search|similar|accept-tags|inspect|update|refresh|remove|restore|empty-trash|hash|export|fetch|thumbnail|preview|sheet]: Catalog references, metadata, and explicit local derivatives
- `vamp import` [eagle]: Import references without modifying the source library
- `vamp collections` [create|list|add|remove|rename|describe|delete|move]: Manage catalog collections (nested folders)
- `vamp explore` [ensure|add|summary|show|list|link|feedback]: Agent research missions: an exploration folder (brief, findings summary, sub-folders) under Exp…
- `vamp smart` [list|create|update|delete]: Smart folders: saved rule sets evaluated on browse
- `vamp tags` [list|rename|delete]: Tag usage, groups, rename/merge and delete
- `vamp sidebar`: Sidebar counts (all, uncategorized, untagged, recently used, trash, folders, smart folders)
- `vamp events`: Read ordered catalog events
- `vamp export`: Export metadata and locators, NOT media bytes or a self-contained archive
- `vamp processors` [add|list|remove|placement|enqueue|enqueue-all]: Register trusted local executables and enqueue work. No shell is used
- `vamp jobs` [list|run|watch|retry|cancel]: Inspect and explicitly run durable processor jobs
- `vamp setup`: Inspect optional capabilities; installation requires --install
- `vamp sync` [install-service]: Pull the authority's changes into the current replica context's mirror
- `vamp join`: Attach a replica of a tailnet vamp-server (no token: the server admits this machine by its Tail…
- `vamp embedder` [set|show|remove]: Configure the text embedder used by semantic search (ToolRequest embed_text)
- `vamp storage` [set|show|unset|migrate|uploads]: Cloud storage for originals (authority only). Uploads drain in `jobs run/watch`
- `vamp cache` [prune|policy|stats]: Rehydrated-original cache (pinned until pruned); replica preview/original cache policy
- `vamp thumbs` [regenerate|stats]: Authority thumbnail tiers (micro, 800 px grid WebP, 2048 px preview WebP)
- `vamp galaxy` [layout|search]: Galaxy view: 3-D embedding projection (authority) and its search ranking
- `vamp worker` [install-service]: Run this machine's model processors for a vamp-server authority's jobs (GPU worker)

## Links

- [Human view](index.html)
- [llms.txt](llms.txt)
- [session.log](session.log): the raw recorded session
- Protocol source and packages: soon
