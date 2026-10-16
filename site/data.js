/* Generated from the VAMP schema bundle, contract.json and `vamp commands`. Do not edit by hand. */
window.VAMP_DATA = {
 "protocol_version": "0.1",
 "status": "experimental",
 "binding": "local CLI; discover operations with vamp commands and types with vamp schema",
 "event_kinds": [
  "media_added",
  "media_updated",
  "media_trashed",
  "media_restored",
  "media_removed",
  "media_viewed",
  "media_hashed",
  "representation_ready",
  "observation_added",
  "collection_created",
  "collection_updated",
  "collection_deleted",
  "smart_folder_updated",
  "tag_groups_updated",
  "processing_requested",
  "original_upload_queued",
  "original_stored",
  "original_evicted"
 ],
 "job_states": [
  "pending",
  "running",
  "completed",
  "failed"
 ],
 "triggers": [
  "media_added",
  "media_updated",
  "representation_ready"
 ],
 "error_codes": [
  "invalid_arguments",
  "operation_failed",
  "output_failed"
 ],
 "native_ops": [
  "remote_attach",
  "sync",
  "sync_wait",
  "representation",
  "download_progress",
  "download_priority",
  "cancel_download",
  "fetch_grid",
  "init",
  "browse",
  "layout",
  "items",
  "micro",
  "galaxy",
  "galaxy_search",
  "generate_thumbs",
  "add",
  "ingest",
  "update",
  "remove",
  "restore",
  "empty_trash",
  "touch",
  "collections_ops",
  "collections",
  "smart_folders",
  "sidebar",
  "added_by",
  "tags",
  "tag_ops",
  "export",
  "import_eagle",
  "copy_thumbnails",
  "prioritize_thumbnails",
  "thumbnail_updates",
  "import_eagle_start",
  "import_status",
  "hash",
  "palette",
  "inspect",
  "find_duplicates"
 ],
 "endpoints": [
  "GET /v1/library",
  "GET /v1/hello",
  "GET /v1/health",
  "GET /v1/events?after=0&limit=500",
  "GET /v1/snapshot",
  "POST /v1/assets/batch",
  "POST /v1/thumbnails/pack",
  "GET /v1/events/stream?after=N&wait=30&limit=500",
  "GET /v1/search?q=&offset=0&limit=100",
  "GET /v1/search?q=&limit=100&semantic=1&hybrid=1",
  "GET /v1/assets/{id}/similar?limit=40",
  "GET /v1/embeddings/pack/meta",
  "GET /v1/embeddings/pack",
  "POST /v1/assets/{id}/accept-tags",
  "GET /v1/tags",
  "GET /v1/assets/{id}",
  "GET /v1/assets/{id}/{thumbnail|preview|original}",
  "POST /v1/assets/{id}",
  "DELETE /v1/assets/{id}?expected_revision=",
  "POST /v1/ingest?filename=&name=&source_url=&tags=a,b&note=|description=&collection_id=",
  "POST /v1/clip",
  "POST /v1/clip/batch",
  "POST /v1/assets/{id}/preview",
  "POST /v1/assets/{id}/original?filename=",
  "GET /v1/collections",
  "POST /v1/collections",
  "POST /v1/collections/{id}",
  "DELETE /v1/collections/{id}",
  "POST /v1/collections/{id}/assets",
  "POST /v1/native",
  "GET /v1/assets/{id}/original?redirect=1",
  "POST /v1/jobs/claim",
  "POST /v1/jobs/{id}/heartbeat",
  "POST /v1/jobs/{id}/complete",
  "POST /v1/jobs/{id}/fail"
 ],
 "cli": [
  {
   "name": "guide",
   "about": "Print the agent manual (plain text): discovery, search, safety rules",
   "subs": []
  },
  {
   "name": "schema",
   "about": "Print protocol JSON schemas",
   "subs": []
  },
  {
   "name": "commands",
   "about": "Print the machine-readable command and argument tree",
   "subs": []
  },
  {
   "name": "init",
   "about": "Create an empty reference-only catalog",
   "subs": []
  },
  {
   "name": "contexts",
   "about": "Manage named catalog contexts",
   "subs": [
    "list",
    "use",
    "add",
    "remote",
    "url"
   ]
  },
  {
   "name": "media",
   "about": "Catalog references, metadata, and explicit local derivatives",
   "subs": [
    "add",
    "list",
    "search",
    "similar",
    "accept-tags",
    "inspect",
    "update",
    "refresh",
    "remove",
    "restore",
    "empty-trash",
    "hash",
    "export",
    "fetch",
    "thumbnail",
    "preview",
    "sheet"
   ]
  },
  {
   "name": "import",
   "about": "Import references without modifying the source library",
   "subs": [
    "eagle"
   ]
  },
  {
   "name": "collections",
   "about": "Manage catalog collections (nested folders)",
   "subs": [
    "create",
    "list",
    "add",
    "remove",
    "rename",
    "describe",
    "delete",
    "move"
   ]
  },
  {
   "name": "explore",
   "about": "Agent research missions: an exploration folder (brief, findings summary, sub-folders) under Exp…",
   "subs": [
    "ensure",
    "add",
    "summary",
    "show",
    "list",
    "link",
    "changes"
   ]
  },
  {
   "name": "smart",
   "about": "Smart folders: saved rule sets evaluated on browse",
   "subs": [
    "list",
    "create",
    "update",
    "delete"
   ]
  },
  {
   "name": "tags",
   "about": "Tag usage, groups, rename/merge and delete",
   "subs": [
    "list",
    "rename",
    "delete"
   ]
  },
  {
   "name": "sidebar",
   "about": "Sidebar counts (all, uncategorized, untagged, recently used, trash, folders, smart folders)",
   "subs": []
  },
  {
   "name": "events",
   "about": "Read ordered catalog events",
   "subs": []
  },
  {
   "name": "export",
   "about": "Export metadata and locators, NOT media bytes or a self-contained archive",
   "subs": []
  },
  {
   "name": "processors",
   "about": "Register trusted local executables and enqueue work. No shell is used",
   "subs": [
    "add",
    "list",
    "remove",
    "placement",
    "enqueue",
    "enqueue-all"
   ]
  },
  {
   "name": "jobs",
   "about": "Inspect and explicitly run durable processor jobs",
   "subs": [
    "list",
    "run",
    "watch",
    "retry",
    "cancel"
   ]
  },
  {
   "name": "setup",
   "about": "Inspect optional capabilities; installation requires --install",
   "subs": []
  },
  {
   "name": "sync",
   "about": "Pull the authority's changes into the current replica context's mirror",
   "subs": [
    "install-service"
   ]
  },
  {
   "name": "join",
   "about": "Attach a replica of a vamp-server library (`vamp serve` on another machine) and sync its catalo…",
   "subs": []
  },
  {
   "name": "serve",
   "about": "Serve this authority library (current or --context) to other machines and the Vampire apps: run…",
   "subs": []
  },
  {
   "name": "embedder",
   "about": "Configure the text embedder used by semantic search (ToolRequest embed_text)",
   "subs": [
    "set",
    "show",
    "remove"
   ]
  },
  {
   "name": "storage",
   "about": "Cloud storage for originals (authority only). Uploads drain in `jobs run/watch`",
   "subs": [
    "set",
    "show",
    "unset",
    "migrate",
    "uploads"
   ]
  },
  {
   "name": "cache",
   "about": "Rehydrated-original cache (pinned until pruned); replica preview/original cache policy",
   "subs": [
    "prune",
    "policy",
    "stats"
   ]
  },
  {
   "name": "thumbs",
   "about": "Authority thumbnail tiers (micro, 800 px grid WebP, 2048 px preview WebP)",
   "subs": [
    "regenerate",
    "stats"
   ]
  },
  {
   "name": "galaxy",
   "about": "Galaxy view: 3-D embedding projection (authority) and its search ranking",
   "subs": [
    "layout",
    "search"
   ]
  },
  {
   "name": "worker",
   "about": "Run this machine's model processors for a vamp-server authority's jobs (GPU worker)",
   "subs": [
    "install-service"
   ]
  },
  {
   "name": "self-update",
   "about": "Update this release install (vamp, vamp-media, vamp-server, vamp-store) to the latest release,…",
   "subs": []
  }
 ],
 "facts": {
  "original": "Regular-file bytes with BLAKE3 digest of exact bytes. Original {path, blake3, byte_size, mime, locator?, storage, hash_state, modified_ns?}: path is the authority-local copy ('' once evicted); locator names the verified cloud copy (s3://bucket/key or folder://default/<relpath>); storage is local | uploading | cloud+local | cloud. Catalogs without these fields read as storage local, hash_state has…",
  "asset": "Stable UUID independent of original path or byte digest.",
  "revision": "Asset revision advances on metadata updates, changed-original refresh, trash/restore and tombstoning. Derived representations and observations, derived facts (dimensions, palette), touch (last_viewed_at) and lazy-hash resolution do not advance asset revision.",
  "precondition": "--expected-revision rejects a stale mutation without changing metadata or emitting an event. Without it, the transaction applies to current catalog state.",
  "ordering": "Monotonic sequence within one library; events --after uses an exclusive cursor. UUID event identities are independent of sequence.",
  "authority": "One local catalog authority; SQLite serializes mutations on that machine. Not a multi-device sync protocol.",
  "replay": "Consumers retain their last sequence and request later events. Events are retained; no retention truncation is implemented.",
  "trust": "Explicitly registered local executables; argv passed directly, never through a shell. They run with the user's permissions and are not sandboxed. Imported/shared media cannot register code.",
  "response": "One ToolResponse JSON document on stdout; diagnostics on stderr. Processors return observations or generated representations; they do not edit the catalog directly.",
  "actor": "VAMP_ACTOR or local; vamp-server attributes writes made by a tailnet peer (the owner's apps on replicas) to tailnet:<login>/<host>. Attribution only, not authentication or authorization. The actor of an asset's media_added event is also kept on the asset as metadata.extra.added_by (native.added_by)."
 },
 "schema": [
  {
   "root": "asset",
   "title": "Asset",
   "note": "The catalog record: a stable UUID independent of path, a revision that advances on metadata change, the original referenced in place.",
   "props": 13,
   "required": 7,
   "defs": [
    "ColorSwatch",
    "Metadata",
    "Original"
   ],
   "json": "{\n  \"title\": \"Asset\",\n  \"type\": \"object\",\n  \"required\": [\"id\", \"revision\", \"name\", \"original\", \"metadata\", \"created_at\", \"updated_at\"],\n  \"properties\": {\n    \"id\": { \"type\": \"string\" },\n    \"revision\": { \"type\": \"integer\", \"format\": \"uint64\" },\n    \"original\": { \"$ref\": \"#/$defs/Original\" },\n    \"metadata\": { \"$ref\": \"#/$defs/Metadata\" },\n    … 9 more\n  },\n  \"$defs\": { … 3 more }\n}"
  },
  {
   "root": "asset_view",
   "title": "AssetView",
   "note": "An asset together with its representations (thumbnail, preview) and the observations processors added.",
   "props": 4,
   "required": 3,
   "defs": [
    "Asset",
    "ColorSwatch",
    "Metadata",
    "Observation",
    "Original",
    "Representation"
   ],
   "json": "{\n  \"title\": \"AssetView\",\n  \"type\": \"object\",\n  \"required\": [\"asset\", \"representations\", \"observations\"],\n  \"properties\": {\n    \"asset\": { \"$ref\": \"#/$defs/Asset\" },\n    \"representations\": { \"type\": \"array\" },\n    \"observations\": { \"type\": \"array\" },\n    \"suggested_tags\": {\n      \"type\": \"array\",\n      \"default\": [],\n      \"description\": \"Model-suggested tags for the current original (from `tags` observations), excluding tag…\",\n      \"items\": { \"type\": \"string\" }\n    }\n  },\n  \"$defs\": { … 6 more }\n}"
  },
  {
   "root": "collection",
   "title": "Collection",
   "note": "A folder. Folders nest via `parent_id` and are ordered among siblings by `sort_order`.",
   "props": 9,
   "required": 3,
   "defs": [],
   "json": "{\n  \"title\": \"Collection\",\n  \"description\": \"A folder. Folders nest via `parent_id` and are ordered among siblings by `sort_order`.\",\n  \"type\": \"object\",\n  \"required\": [\"id\", \"name\", \"asset_ids\"],\n  \"properties\": {\n    \"id\": { \"type\": \"string\" },\n    \"name\": { \"type\": \"string\" },\n    \"parent_id\": { \"type\": [\"string\", \"null\"] },\n    \"asset_ids\": {\n      \"type\": \"array\",\n      \"items\": { \"type\": \"string\" }\n    },\n    … 5 more\n  }\n}"
  },
  {
   "root": "context",
   "title": "Context",
   "note": "Machine-local connection configuration, not a library: which library, where its state lives, an optional remote.",
   "props": 4,
   "required": 2,
   "defs": [
    "Remote"
   ],
   "json": "{\n  \"title\": \"Context\",\n  \"type\": \"object\",\n  \"required\": [\"library_id\", \"state_dir\"],\n  \"properties\": {\n    \"library_id\": { \"type\": \"string\" },\n    \"state_dir\": {\n      \"type\": \"string\",\n      \"description\": \"Catalog directory; config files may store a path relative to VAMP home.\"\n    },\n    \"remote\": {\n      \"description\": \"Replica of a remote authority (vamp-server). Absent for local authority catalogs.\",\n      \"anyOf\": [\n        { \"$ref\": \"#/$defs/Remote\" },\n        { \"type\": \"null\" }\n      ]\n    },\n    … 1 more\n  },\n  \"$defs\": { … 1 more }\n}"
  },
  {
   "root": "contract",
   "title": "contract",
   "note": "The semantic and operation contract, bundled whole into the schema output.",
   "props": 16,
   "required": 0,
   "defs": [],
   "json": "{\n  \"protocol_version\": \"0.1\",\n  \"status\": \"experimental\",\n  \"binding\": \"local CLI; discover operations with vamp commands and types with vamp schema\",\n  \"mutations\": {\n    \"precondition\": \"--expected-revision rejects a stale mutation without changing metadata or emitting an event. Withou…\",\n    … 6 more\n  },\n  \"events\": {\n    \"kinds\": [\n      \"media_added\",\n      \"media_updated\",\n      \"media_trashed\",\n      \"media_restored\",\n      \"media_removed\",\n      \"media_viewed\",\n      … 12 more\n    ],\n    \"ordering\": \"Monotonic sequence within one library; events --after uses an exclusive cursor. UUID event identiti…\",\n    … 6 more\n  },\n  … 11 more\n}"
  },
  {
   "root": "duplicate_candidate",
   "title": "DuplicateCandidate",
   "note": "One intake candidate checked by native `find_duplicates`: a file, raw bytes or a precomputed digest, and the existing assets it duplicates.",
   "props": 6,
   "required": 1,
   "defs": [
    "DuplicateMatch"
   ],
   "json": "{\n  \"title\": \"DuplicateCandidate\",\n  \"description\": \"One intake candidate checked by native `find_duplicates`: a file, raw bytes or a precomputed digest…\",\n  \"type\": \"object\",\n  \"required\": [\"matches\"],\n  \"properties\": {\n    \"blake3\": {\n      \"type\": [\"string\", \"null\"],\n      \"description\": \"BLAKE3 of the candidate bytes; absent when they could not be read.\"\n    },\n    \"matches\": { \"type\": \"array\" },\n    … 4 more\n  },\n  \"$defs\": { … 1 more }\n}"
  },
  {
   "root": "error",
   "title": "ErrorResponse",
   "note": "Every failure is JSON on stderr with a nonzero exit.",
   "props": 2,
   "required": 2,
   "defs": [
    "ErrorDetail"
   ],
   "json": "{\n  \"title\": \"ErrorResponse\",\n  \"type\": \"object\",\n  \"required\": [\"protocol_version\", \"error\"],\n  \"properties\": {\n    \"error\": { \"$ref\": \"#/$defs/ErrorDetail\" },\n    \"protocol_version\": { \"type\": \"string\" }\n  },\n  \"$defs\": { … 1 more }\n}"
  },
  {
   "root": "event",
   "title": "Event",
   "note": "One ordered change. Monotonic sequence within a library; consumers keep their last sequence and ask for later events.",
   "props": 9,
   "required": 7,
   "defs": [],
   "json": "{\n  \"title\": \"Event\",\n  \"type\": \"object\",\n  \"required\": [\"sequence\", \"id\", \"library_id\", \"kind\", \"actor\", \"created_at\", \"payload\"],\n  \"properties\": {\n    \"sequence\": { \"type\": \"integer\", \"format\": \"uint64\" },\n    \"kind\": { \"type\": \"string\" },\n    \"actor\": { \"type\": \"string\" },\n    \"revision\": { \"type\": [\"integer\", \"null\"], \"format\": \"uint64\" },\n    \"payload\": true,\n    … 4 more\n  }\n}"
  },
  {
   "root": "job",
   "title": "Job",
   "note": "Durable processor work: pending, running, completed or failed.",
   "props": 10,
   "required": 8,
   "defs": [
    "JobLease",
    "Placement",
    "ProcessorSpec"
   ],
   "json": "{\n  \"title\": \"Job\",\n  \"type\": \"object\",\n  \"required\": [\n    \"id\",\n    \"asset_id\",\n    \"source_hash\",\n    \"processor\",\n    \"event_id\",\n    \"status\",\n    \"attempts\",\n    \"created_at\"\n  ],\n  \"properties\": {\n    \"status\": { \"type\": \"string\" },\n    \"processor\": { \"$ref\": \"#/$defs/ProcessorSpec\" },\n    \"source_hash\": { \"type\": \"string\" },\n    \"lease\": {\n      \"description\": \"Present while (and after) a remote worker holds the job; local runs never set it.\",\n      \"anyOf\": [\n        { \"$ref\": \"#/$defs/JobLease\" },\n        { \"type\": \"null\" }\n      ]\n    },\n    … 6 more\n  },\n  \"$defs\": { … 3 more }\n}"
  },
  {
   "root": "metadata_patch",
   "title": "MetadataPatch",
   "note": "Omitted or null fields are unchanged. Pair it with --expected-revision to reject stale writes.",
   "props": 7,
   "required": 0,
   "defs": [],
   "json": "{\n  \"title\": \"MetadataPatch\",\n  \"type\": \"object\",\n  \"properties\": {\n    \"tags\": {\n      \"type\": [\"array\", \"null\"],\n      \"description\": \"Replaces all tags.\",\n      \"items\": { \"type\": \"string\" }\n    },\n    \"add_tags\": {\n      \"type\": [\"array\", \"null\"],\n      \"default\": null,\n      \"description\": \"Added after `tags` is applied.\",\n      \"items\": { \"type\": \"string\" }\n    },\n    \"rating\": {\n      \"type\": [\"integer\", \"null\"],\n      \"format\": \"uint8\",\n      \"default\": null,\n      \"description\": \"0–5.\"\n    },\n    \"description\": { \"type\": [\"string\", \"null\"] },\n    … 3 more\n  }\n}"
  },
  {
   "root": "processor",
   "title": "ProcessorSpec",
   "note": "An explicitly registered local executable. Arguments go straight to it, never through a shell.",
   "props": 7,
   "required": 5,
   "defs": [
    "Placement"
   ],
   "json": "{\n  \"title\": \"ProcessorSpec\",\n  \"type\": \"object\",\n  \"required\": [\"name\", \"events\", \"command\", \"input\", \"output\"],\n  \"properties\": {\n    \"command\": {\n      \"type\": \"array\",\n      \"description\": \"Executable and arguments, invoked directly without a shell.\",\n      \"items\": { \"type\": \"string\" }\n    },\n    \"events\": {\n      \"type\": \"array\",\n      \"items\": { \"type\": \"string\" }\n    },\n    \"input\": {\n      \"type\": \"string\",\n      \"description\": \"original, thumbnail, or preview. Missing inputs fail; no silent original fallback.\"\n    },\n    \"output\": {\n      \"type\": \"string\",\n      \"description\": \"observation, thumbnail, or preview.\"\n    },\n    \"placement\": {\n      \"$ref\": \"#/$defs/Placement\",\n      \"description\": \"Who may execute jobs: `any` (default; local worker or a remote `vamp worker`), `local`…\"\n    },\n    … 2 more\n  },\n  \"$defs\": { … 1 more }\n}"
  },
  {
   "root": "protocol_version",
   "title": "protocol_version",
   "note": "The wire version.",
   "props": 0,
   "required": 0,
   "defs": [],
   "json": "\"0.1\""
  },
  {
   "root": "smart_folder",
   "title": "SmartFolder",
   "note": "A saved rule set, evaluated on browse.",
   "props": 7,
   "required": 3,
   "defs": [
    "SmartRule",
    "SmartRules"
   ],
   "json": "{\n  \"title\": \"SmartFolder\",\n  \"type\": \"object\",\n  \"required\": [\"id\", \"name\", \"rules\"],\n  \"properties\": {\n    \"id\": { \"type\": \"string\" },\n    \"name\": { \"type\": \"string\" },\n    \"rules\": { \"$ref\": \"#/$defs/SmartRules\" },\n    … 4 more\n  },\n  \"$defs\": { … 2 more }\n}"
  },
  {
   "root": "store_request",
   "title": "StoreRequest",
   "note": "One JSON request on stdin to the `vamp-store` S3 helper; one `StoreResponse` on stdout. Credentials come from the environment (AWS_ACCESS_K…",
   "props": 10,
   "required": 5,
   "defs": [],
   "json": "{\n  \"title\": \"StoreRequest\",\n  \"description\": \"One JSON request on stdin to the `vamp-store` S3 helper; one `StoreResponse` on stdout. Credentials…\",\n  \"type\": \"object\",\n  \"required\": [\"operation\", \"endpoint\", \"region\", \"bucket\", \"key\"],\n  \"properties\": {\n    \"operation\": {\n      \"type\": \"string\",\n      \"description\": \"put, get, head, delete, or presign.\"\n    },\n    \"bucket\": { \"type\": \"string\" },\n    \"key\": { \"type\": \"string\" },\n    \"blake3\": {\n      \"type\": [\"string\", \"null\"],\n      \"description\": \"Stored as object metadata `x-amz-meta-blake3` on put.\"\n    },\n    … 6 more\n  }\n}"
  },
  {
   "root": "store_response",
   "title": "StoreResponse",
   "note": "The vamp-store helper’s one reply on stdout.",
   "props": 4,
   "required": 0,
   "defs": [],
   "json": "{\n  \"title\": \"StoreResponse\",\n  \"type\": \"object\",\n  \"properties\": {\n    \"blake3\": { \"type\": [\"string\", \"null\"] },\n    \"byte_size\": { \"type\": [\"integer\", \"null\"], \"format\": \"uint64\" },\n    \"exists\": {\n      \"type\": \"boolean\",\n      \"default\": false,\n      \"description\": \"head: whether the object exists.\"\n    },\n    \"url\": {\n      \"type\": [\"string\", \"null\"],\n      \"description\": \"presign: time-limited GET URL.\"\n    }\n  }\n}"
  },
  {
   "root": "tag_group",
   "title": "TagGroup",
   "note": "Named tag group (Eagle `tagsGroups`). Tags remain plain strings on assets.",
   "props": 4,
   "required": 2,
   "defs": [],
   "json": "{\n  \"title\": \"TagGroup\",\n  \"description\": \"Named tag group (Eagle `tagsGroups`). Tags remain plain strings on assets.\",\n  \"type\": \"object\",\n  \"required\": [\"id\", \"name\"],\n  \"properties\": {\n    \"id\": { \"type\": \"string\" },\n    \"name\": { \"type\": \"string\" },\n    \"tags\": {\n      \"type\": \"array\",\n      \"default\": [],\n      \"items\": { \"type\": \"string\" }\n    },\n    \"color\": { \"type\": [\"string\", \"null\"] }\n  }\n}"
  },
  {
   "root": "tool_request",
   "title": "ToolRequest",
   "note": "One JSON request on stdin, one JSON response on stdout; diagnostics use stderr.",
   "props": 12,
   "required": 2,
   "defs": [
    "Asset",
    "ColorSwatch",
    "Metadata",
    "Original",
    "SheetItem"
   ],
   "json": "{\n  \"title\": \"ToolRequest\",\n  \"description\": \"One JSON request on stdin, one JSON response on stdout; diagnostics use stderr.\",\n  \"type\": \"object\",\n  \"required\": [\"protocol_version\", \"operation\"],\n  \"properties\": {\n    \"protocol_version\": { \"type\": \"string\" },\n    \"operation\": { \"type\": \"string\" },\n    \"asset\": {\n      \"anyOf\": [\n        { \"$ref\": \"#/$defs/Asset\" },\n        { \"type\": \"null\" }\n      ]\n    },\n    \"input_path\": { \"type\": [\"string\", \"null\"] },\n    … 8 more\n  },\n  \"$defs\": { … 5 more }\n}"
  },
  {
   "root": "tool_response",
   "title": "ToolResponse",
   "note": "What a processor hands back: an observation, a palette, a representation or contact-sheet tiles.",
   "props": 4,
   "required": 0,
   "defs": [
    "ColorSwatch",
    "ObservationOutput",
    "RepresentationOutput",
    "SheetTile"
   ],
   "json": "{\n  \"title\": \"ToolResponse\",\n  \"type\": \"object\",\n  \"properties\": {\n    \"observation\": {\n      \"anyOf\": [\n        { \"$ref\": \"#/$defs/ObservationOutput\" },\n        { \"type\": \"null\" }\n      ]\n    },\n    \"palette\": {\n      \"type\": [\"array\", \"null\"],\n      \"description\": \"Operation `palette`: up to 8 dominant colors of `input_path`, largest first.\"\n    },\n    \"representation\": {\n      \"anyOf\": [\n        { \"$ref\": \"#/$defs/RepresentationOutput\" },\n        { \"type\": \"null\" }\n      ]\n    },\n    \"tiles\": { \"type\": [\"array\", \"null\"] }\n  },\n  \"$defs\": { … 4 more }\n}"
  }
 ]
};
