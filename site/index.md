# VAMP

> A visual media protocol for humans and agents.

```text
                              :-:-:-:-:-:-:-::
                         :-:-:----=-=-=-=-=--:-:-:-
                      :-:-:--=-=-=-=-=-=-=-=-=----:-:-
                   :----=-=-==+=04de3d9c82c +==-=-=-=--:-
                 ::-:--=-=-9 82c 940 f99 473 4 8 =-=--:-:-:
                -:--=-==0bf99747384e890c05751591f a =-=--:-:
               -:-:--= 4e890c05751591f1aa27571 b62 2 3-=--:-:
                  =-+51591f1aa27571bb6202d36d22dfc0504d==-=
             -       571 b6202d3 d22 fc0 04d 3d9 8 c 9        :
            -:=         2dfc0504de3 9c82  940bf99747          -:
           ::-:            82ce940  99 4   4e8 0c            -:-:
           :--=-+2c                                       2==--:-
           -:--=-4 3 4                                 2 f =--:-:
           :--=-= 75159                               3d9 8==-=--
           -:--=-2 571 b6                          9 0 f 9 =-=:-:
           :--=-+ 36d22dfc0504de3d        0bf99747384e8 0 0==--:-
           -:-:=-= d 3 9 8 c 9 0 f       4 8 0 0 7 1 9 f  -=--:-:
            -:=-=-+ 0 f99747384e890c05 51 91f aa2 571 b 2==-=--:
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
WHAT ............... visual media protocol for humans and agents
WIRE_VERSION ....... 0.1
STATUS ............. experimental
LICENSE ............ MIT: the operation contract, Rust types and generated JSON Schemas
SOURCE ............. not public yet (soon); no crates.io or npm package yet
BINDING ............ local CLI; discover operations with vamp commands and types with vamp schema
VIEWER ............. Vampire, Mac/iOS, proprietary, one-time purchase (soon); ships the vamp CLI and vamp-server
```

VAMP keeps a catalog of your media without taking the media: files stay where they are, the catalog holds ids, revisions, metadata and what your tools observe. One authority writes; replicas on other machines and the agents on them follow its ordered event stream.

## Keep

Originals stay where they are, identified by their exact bytes. Never duplicated, never locked in.

The catalog is reference-only. An asset has a stable UUID independent of its path; its original is the file in place, identified by the BLAKE3 digest of its exact bytes. Adding the same file at the same path again returns the same asset. Changed bytes need an explicit `vamp media refresh`, which keeps the asset id and advances its revision. Removing moves an asset to the trash; VAMP never modifies or deletes an original, with one opt-in exception: evicting the local copy after a verified cloud upload (`--delete-local-after-upload`). Bytes that arrive without a file (browser clips, uploads, exploration findings) are stored in the library inbox. Optional cloud storage (S3 or a folder) holds a copy of originals only when you configure it. `vamp export` writes metadata and locators.

```sh
$ vamp media add moon-bat.jpg
{
  "id": "7c36410c-bdcb-425f-958b-de92e9e29d66",
  "name": "moon-bat.jpg",
  "original": {
    "blake3": "504de3d9c82ce940bf99747384e890c05751591f1aa27571bb6202d36d22dfc0",
    "byte_size": 30552,
    "path": "/tmp/vamp-site/media/moon-bat.jpg",
    "storage": "local",
    …
  },
  "revision": 1,
  …
}
$ vamp media add moon-bat.jpg
{
  "id": "7c36410c-bdcb-425f-958b-de92e9e29d66",
  …
  "revision": 1,
  …
}
```

## Deliver

One authority, replicas on your other machines, agents on all of them, following one event stream.

One local authority (SQLite) owns each library and orders every change into a monotonic event stream. `vamp-server` serves it over HTTP (`/v1`), to replicas on other machines (`vamp contexts remote` with a bearer token, or `vamp join` over Tailscale without one), browser clippers and remote GPU workers. A replica keeps a full mirror, reads offline and follows the stream (`vamp sync`, `vamp sync --watch`, or `GET /v1/events/stream`). The CLI on a replica is read-only: writes go to the authority, through its CLI or HTTP API, or through the Vampire app, which forwards them. Agents use the same CLI and API (`vamp guide` is their manual); `--expected-revision` rejects stale writes.

### 1. Serve (authority)

```sh
authority $ vamp-server --home /tmp/vamp-site/authority serve --bind 127.0.0.1:7791 --auth token --no-jobs
vamp-server: serving context studio on http://127.0.0.1:7791 (token: vamp-server token --context studio)
```

### 2. Attach (replica)

```sh
replica $ vamp contexts remote studio --url http://127.0.0.1:7791 --token $TOKEN
{
  "library_id": "a0df847b-4413-4e3f-b823-fa2b7ff0df25",
  "name": "studio",
  "remote_url": "http://127.0.0.1:7791",
  "sync": { "applied": 2, "cursor": 5, "snapshot": true, … },
  …
}
replica $ vamp media search wing
[{ "id": "563ebe0c-0f68-4301-a58e-efcf9de6610d", "name": "wing-study.png", … }]
```

### 3. Change (authority)

```sh
authority $ export VAMP_ACTOR=agent:night-shift
authority $ vamp media accept-tags 563ebe0c-0f68-4301-a58e-efcf9de6610d --expected-revision 1
{ "id": "563ebe0c-0f68-4301-a58e-efcf9de6610d", "metadata": { "tags": ["study", "wing"], … }, "revision": 2, … }
authority $ export VAMP_ACTOR=owner
authority $ vamp media update 7c36410c-bdcb-425f-958b-de92e9e29d66 --patch rate.json --expected-revision 1
{ "id": "7c36410c-bdcb-425f-958b-de92e9e29d66", "metadata": { "rating": 5, "tags": ["keep"], … }, "revision": 2, … }
```

### 4. Sync (replica)

```sh
replica $ vamp sync
{ "applied": 2, "cursor": 7, "kinds": { "media_updated": 2 }, "snapshot": false, … }
replica $ vamp media search keep
[{ "id": "7c36410c-bdcb-425f-958b-de92e9e29d66", "name": "moon-bat.jpg", "metadata": { "rating": 5, "tags": ["keep"], … }, … }]
```

## Transform

Previews, tags and embeddings from the tools you choose. Originals are never touched.

Representations (thumbnails, previews) are generated by the optional `vamp-media` helper. Processors are local executables you register explicitly: argv only, never a shell; one ToolRequest JSON on stdin, one ToolResponse on stdout. They run as durable jobs on `media_added`, `media_updated` or `representation_ready`, or when enqueued, and return observations (captions, tags, embeddings) or representations. They never edit the catalog or the original. Tags they suggest become metadata only when accepted (`vamp media accept-tags`). Optional bundled models (Florence captions and tags, SigLIP embeddings) install with `vamp setup models --install`; remote machines can run them with `vamp worker`.

A processor registered for this take (`name-tags.json`):

```json
{"name":"name-tags","events":["media_added"],"command":["/tmp/vamp-site/bin/name-tags"],"input":"original","output":"observation"}
```

```python
#!/usr/bin/env python3
# A user-registered processor: tags from the original's file name. One ToolRequest in, one ToolResponse out.
import json, os, re, sys
req = json.load(sys.stdin)
stem = os.path.splitext(os.path.basename(req["asset"]["original"]["path"]))[0]
tags = [t for t in re.split(r"[^a-z0-9]+", stem.lower()) if t]
json.dump({"observation": {"kind": "tags", "model": "name-tags", "value": {"tags": tags}}}, sys.stdout)
```

```sh
$ vamp media inspect 563ebe0c-0f68-4301-a58e-efcf9de6610d
{
  "representations": [
    { "kind": "preview", "width": 680, "height": 340, "mime": "image/jpeg", … },
    { "kind": "thumbnail", "width": 512, "height": 256, "mime": "image/jpeg", … }
  ],
  "observations": [
    { "kind": "tags", "processor": "name-tags", "value": { "tags": ["wing", "study"] }, … }
  ],
  "suggested_tags": ["wing", "study"]
}
```

Palette recorded on the asset (`metadata.colors`): #e13942 33%, #130714 32%, #481128 22%, #f55953 8%, #a22a34 4%, #78212d 1%.

## Share

Let in the people, machines and agents you choose. Every change records who made it.

Today sharing is at the level of a library. An authority admits replicas by bearer token, or by Tailscale identity: users and node tags in an allowlist (`vamp-server allow`). Everyone admitted sees the whole library; there are no per-folder or per-item share links yet. Every event carries an actor: `VAMP_ACTOR` for CLI writes, `tailnet:<login>/<host>` for writes from apps on replicas; writes made with the bearer token carry the server's own actor. Attribution, not authorization. Agents run research missions as explorations (`vamp explore`): findings filed with their source URL, which the owner rates and tags in the app and the agent reads back with `vamp explore feedback`.

```sh
$ vamp-server allow --user collaborator@example.com
{"users":["collaborator@example.com"],"tags":[]}
```

`vamp events --after 0` on the authority after the take:

```text
  1  media_added           owner               moon-bat.jpg
  2  media_added           owner               wing-study.png
  3  observation_added     owner               wing-study.png
  4  representation_ready  owner               wing-study.png
  5  representation_ready  owner               wing-study.png
  6  media_updated         agent:night-shift   wing-study.png
  7  media_updated         owner               moon-bat.jpg
```

## Vampire

The viewer for humans, on Mac and iOS. One-time purchase. Soon.

Vampire is the proprietary Mac and iOS app on VAMP: an Eagle-style grid for browsing, rating and tagging, replicas over Tailscale, a browser clipper. It is a one-time purchase and is not needed to use the protocol.

## Spec

Open protocol, MIT: the operation contract (`contract.json`), Rust types and generated JSON Schemas. `vamp schema` and `cargo run -p vamp-protocol --example schema` print the same bundle: 18 roots, 16 JSON Schemas plus `contract` and `protocol_version`.

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

### Event kinds (18)

media_added, media_updated, media_trashed, media_restored, media_removed, media_viewed, media_hashed, representation_ready, observation_added, collection_created, collection_updated, collection_deleted, smart_folder_updated, tag_groups_updated, processing_requested, original_upload_queued, original_stored, original_evicted

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
- [session.log](session.log): the raw take (vamp 0.1.0, scratch homes, 15 Oct 2026)
- Protocol source and packages: soon
- Vampire: soon
