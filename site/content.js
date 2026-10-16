/*
 * vamp.sh content: the Human page's artifacts and the complete plain reference.
 * One source for three renderings: the Machine view (index.html#machine), llms.txt and index.md
 * (written by `node tools/build.mjs`). Runs in the browser and in Node. Needs data.js loaded first.
 *
 * Every command and output below is from session.log (vamp 0.1.0, scratch homes), pretty-printed and
 * shortened at …, never rewritten.
 */
(function (root) {
  'use strict';

  var TAGLINE = 'A visual media protocol for humans and agents.';
  /* The hero's one-liner (index.html#install-cmd must match: build.mjs --check). */
  var INSTALL = 'curl -fsSL https://vamp.sh/install | sh';
  var ID_M = '7c36410c-bdcb-425f-958b-de92e9e29d66';
  var ID_W = '563ebe0c-0f68-4301-a58e-efcf9de6610d';
  var BLAKE_M = '504de3d9c82ce940bf99747384e890c05751591f1aa27571bb6202d36d22dfc0';

  /* Utility sections, in page order. `line` is the one line shown on the Human page. */
  var SECTIONS = [
    { id: 'keep', label: 'Keep', line: 'Originals stay where they are, identified by their exact bytes. Never duplicated, never locked in.' },
    { id: 'deliver', label: 'Deliver', line: 'One authority, replicas on your other machines, agents on all of them, following one event stream.' },
    { id: 'transform', label: 'Transform', line: 'Previews, tags and embeddings from the tools you choose. Originals are never touched.' },
    { id: 'share', label: 'Share', line: 'Let in the people, machines and agents you choose. Every change records who made it.' },
    { id: 'vampire', label: 'Vampire', line: 'The viewer for humans, on Mac and iOS. One-time purchase. Soon.' }
  ];

  /* Keep: the same file added twice. */
  var KEEP = [
    { cmd: 'vamp media add moon-bat.jpg', out: '{\n  "id": "' + ID_M + '",\n  "name": "moon-bat.jpg",\n  "original": {\n    "blake3": "' + BLAKE_M + '",\n    "byte_size": 30552,\n    "path": "/tmp/vamp-site/media/moon-bat.jpg",\n    "storage": "local",\n    …\n  },\n  "revision": 1,\n  …\n}' },
    { cmd: 'vamp media add moon-bat.jpg', out: '{\n  "id": "' + ID_M + '",\n  …\n  "revision": 1,\n  …\n}' }
  ];

  /* Deliver: the terminal replay. host = which machine the prompt is on. */
  var DELIVER = [
    { t: 'Serve', host: 'authority', run: [
      { cmd: 'vamp-server --home /tmp/vamp-site/authority serve --bind 127.0.0.1:7791 --auth token --no-jobs',
        out: 'vamp-server: serving context studio on http://127.0.0.1:7791 (token: vamp-server token --context studio)', plain: true }
    ] },
    { t: 'Attach', host: 'replica', run: [
      { cmd: 'vamp contexts remote studio --url http://127.0.0.1:7791 --token $TOKEN',
        out: '{\n  "library_id": "a0df847b-4413-4e3f-b823-fa2b7ff0df25",\n  "name": "studio",\n  "remote_url": "http://127.0.0.1:7791",\n  "sync": { "applied": 2, "cursor": 5, "snapshot": true, … },\n  …\n}' },
      { cmd: 'vamp media search wing', out: '[{ "id": "' + ID_W + '", "name": "wing-study.png", … }]' }
    ] },
    { t: 'Change', host: 'authority', run: [
      { cmd: 'export VAMP_ACTOR=agent:night-shift' },
      { cmd: 'vamp media accept-tags ' + ID_W + ' --expected-revision 1',
        out: '{ "id": "' + ID_W + '", "metadata": { "tags": ["study", "wing"], … }, "revision": 2, … }' },
      { cmd: 'export VAMP_ACTOR=owner' },
      { cmd: 'vamp media update ' + ID_M + ' --patch rate.json --expected-revision 1',
        out: '{ "id": "' + ID_M + '", "metadata": { "rating": 5, "tags": ["keep"], … }, "revision": 2, … }' }
    ] },
    { t: 'Sync', host: 'replica', run: [
      { cmd: 'vamp sync', out: '{ "applied": 2, "cursor": 7, "kinds": { "media_updated": 2 }, "snapshot": false, … }' },
      { cmd: 'vamp media search keep', out: '[{ "id": "' + ID_M + '", "name": "moon-bat.jpg", "metadata": { "rating": 5, "tags": ["keep"], … }, … }]' }
    ] }
  ];

  /* Transform: a registered processor and what it produced. */
  var PROCESSOR_SPEC = '{"name":"name-tags","events":["media_added"],"command":["/tmp/vamp-site/bin/name-tags"],"input":"original","output":"observation"}';
  var PROCESSOR_SRC = [
    '#!/usr/bin/env python3',
    '# A user-registered processor: tags from the original\'s file name. One ToolRequest in, one ToolResponse out.',
    'import json, os, re, sys',
    'req = json.load(sys.stdin)',
    'stem = os.path.splitext(os.path.basename(req["asset"]["original"]["path"]))[0]',
    'tags = [t for t in re.split(r"[^a-z0-9]+", stem.lower()) if t]',
    'json.dump({"observation": {"kind": "tags", "model": "name-tags", "value": {"tags": tags}}}, sys.stdout)'
  ].join('\n');
  var INSPECT = '{\n  "representations": [\n    { "kind": "preview", "width": 680, "height": 340, "mime": "image/jpeg", … },\n    { "kind": "thumbnail", "width": 512, "height": 256, "mime": "image/jpeg", … }\n  ],\n  "observations": [\n    { "kind": "tags", "processor": "name-tags", "value": { "tags": ["wing", "study"] }, … }\n  ],\n  "suggested_tags": ["wing", "study"]\n}';
  var COLORS = [['#e13942', 0.326], ['#130714', 0.324], ['#481128', 0.224], ['#f55953', 0.076], ['#a22a34', 0.040], ['#78212d', 0.011]];

  /* Share: the authority's event log (vamp events --after 0), and the tailnet allowlist. */
  var EVENTS = [
    [1, 'media_added', 'owner', 'moon-bat.jpg'],
    [2, 'media_added', 'owner', 'wing-study.png'],
    [3, 'observation_added', 'owner', 'wing-study.png'],
    [4, 'representation_ready', 'owner', 'wing-study.png'],
    [5, 'representation_ready', 'owner', 'wing-study.png'],
    [6, 'media_updated', 'agent:night-shift', 'wing-study.png'],
    [7, 'media_updated', 'owner', 'moon-bat.jpg']
  ];
  var ALLOW = { cmd: 'vamp-server allow --user collaborator@example.com', out: '{"users":["collaborator@example.com"],"tags":[]}' };

  function leader(k, v) { return (k + ' ').padEnd(20, '.') + ' ' + v; }
  function fence(lang, body) { return '```' + lang + '\n' + body.replace(/\n+$/, '') + '\n```'; }
  function runs(list, host) {
    return list.map(function (r) {
      return (host ? host + ' ' : '') + '$ ' + r.cmd + (r.out ? '\n' + r.out : '') + (r.exit ? '\n[exit ' + r.exit + ']' : '');
    }).join('\n');
  }
  function sec(id) { for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].id === id) return SECTIONS[i]; }

  /* Markdown body shared by the Machine view, llms.txt and index.md. */
  function body(D) {
    var generated = D.schema.filter(function (s) { return s.root !== 'contract' && s.root !== 'protocol_version'; }).length;
    var L = [];
    var p = function () { for (var i = 0; i < arguments.length; i++) L.push(arguments[i]); };
    var head = function (id) { var s = sec(id); p('## ' + s.label, '', s.line, ''); };

    p('## About', '', fence('text', [
      leader('NAME', 'VAMP'),
      leader('WHAT', 'visual media protocol for humans and agents'),
      leader('WIRE_VERSION', D.protocol_version),
      leader('STATUS', D.status),
      leader('LICENSE', 'MIT: the protocol (operation contract, Rust types, JSON Schemas), the engine and the vamp CLI'),
      leader('SOURCE', 'https://github.com/selfdrivingjazz/vamp (no crates.io or npm package yet)'),
      leader('BINDING', D.binding),
      leader('INSTALL', INSTALL + '  (vamp CLI; macOS, Linux)'),
      leader('VIEWER', 'Vampire, Mac/iOS, proprietary, one-time purchase (soon); ships the vamp CLI and vamp-server')
    ].join('\n')), '');
    p('VAMP keeps a catalog of your media without taking the media: files stay where they are, the catalog holds ids, revisions, metadata and what your tools observe. One authority writes; replicas on other machines and the agents on them follow its ordered event stream.', '');
    p('## Install', '', fence('sh', INSTALL), '');
    p('Installs the `vamp` CLI and its `vamp-media` helper from the latest GitHub release of `selfdrivingjazz/vamp` (MIT, source included): macOS (Apple silicon, Intel) and Linux (x86_64, aarch64; static, any distro). The installer verifies the archive against `SHA256SUMS` and writes to `~/.local/bin`; set `VAMP_INSTALL_DIR`, or pass `sh -s -- --dir DIR`, for another directory, and `--version X` to pin a release. Update with `vamp self-update` (`--check` only reports), or run the installer again. The script is also at `https://vamp.sh/install.sh`.', '');

    head('keep');
    p('The catalog is reference-only. An asset has a stable UUID independent of its path; its original is the file in place, identified by the BLAKE3 digest of its exact bytes. Adding the same file at the same path again returns the same asset. Changed bytes need an explicit `vamp media refresh`, which keeps the asset id and advances its revision. Removing moves an asset to the trash; VAMP never modifies or deletes an original, with one opt-in exception: evicting the local copy after a verified cloud upload (`--delete-local-after-upload`). Bytes that arrive without a file (browser clips, uploads, exploration findings) are stored in the library inbox. Optional cloud storage (S3 or a folder) holds a copy of originals only when you configure it. `vamp export` writes metadata and locators.', '');
    p(fence('sh', runs(KEEP)), '');

    head('deliver');
    p('One local authority (SQLite) owns each library and orders every change into a monotonic event stream. `vamp-server` serves it over HTTP (`/v1`), to replicas on other machines (`vamp contexts remote` with a bearer token, or `vamp join` over Tailscale without one), browser clippers and remote GPU workers. A replica keeps a full mirror, reads offline and follows the stream (`vamp sync`, `vamp sync --watch`, or `GET /v1/events/stream`). The CLI on a replica is read-only: writes go to the authority, through its CLI or HTTP API, or through the Vampire app, which forwards them. Agents use the same CLI and API (`vamp guide` is their manual); `--expected-revision` rejects stale writes.', '');
    DELIVER.forEach(function (s, i) {
      p('### ' + (i + 1) + '. ' + s.t + ' (' + s.host + ')', '', fence('sh', runs(s.run, s.host)), '');
    });

    head('transform');
    p('Representations (thumbnails, previews) are generated by the optional `vamp-media` helper. Processors are local executables you register explicitly: argv only, never a shell; one ToolRequest JSON on stdin, one ToolResponse on stdout. They run as durable jobs on `media_added`, `media_updated` or `representation_ready`, or when enqueued, and return observations (captions, tags, embeddings) or representations. They never edit the catalog or the original. Tags they suggest become metadata only when accepted (`vamp media accept-tags`). Optional bundled models (Florence captions and tags, SigLIP embeddings) install with `vamp setup models --install`; remote machines can run them with `vamp worker`.', '');
    p('A processor registered for this take (`name-tags.json`):', '', fence('json', PROCESSOR_SPEC), '', fence('python', PROCESSOR_SRC), '');
    p(fence('sh', runs([{ cmd: 'vamp media inspect ' + ID_W + '', out: INSPECT }])), '');
    p('Palette recorded on the asset (`metadata.colors`): ' + COLORS.map(function (c) { return c[0] + ' ' + Math.round(c[1] * 100) + '%'; }).join(', ') + '.', '');

    head('share');
    p('Today sharing is at the level of a library. An authority admits replicas by bearer token, or by Tailscale identity: users and node tags in an allowlist (`vamp-server allow`). Everyone admitted sees the whole library; there are no per-folder or per-item share links yet. Every event carries an actor: `VAMP_ACTOR` for CLI writes, `tailnet:<login>/<host>` for writes from apps on replicas; writes made with the bearer token carry the server\'s own actor. Attribution, not authorization. Agents run research missions as explorations (`vamp explore`): findings filed with their source URL, which the owner rates and tags in the app and the agent reads back with `vamp explore feedback`.', '');
    p(fence('sh', runs([ALLOW])), '');
    p('`vamp events --after 0` on the authority after the take:', '', fence('text', EVENTS.map(function (e) {
      return String(e[0]).padStart(3) + '  ' + e[1].padEnd(22) + e[2].padEnd(20) + e[3];
    }).join('\n')), '');

    head('vampire');
    p('Vampire is the proprietary Mac and iOS app on VAMP: an Eagle-style grid for browsing, rating and tagging, replicas over Tailscale, a browser clipper. It is a one-time purchase and is not needed to use the protocol.', '');

    p('## Spec', '');
    p('Open protocol, MIT: the operation contract (`contract.json`), Rust types and generated JSON Schemas. `vamp schema` and `cargo run -p vamp-protocol --example schema` print the same bundle: ' + D.schema.length + ' roots, ' + generated + ' JSON Schemas plus `contract` and `protocol_version`.', '');
    p(D.schema.map(function (s) { return '- `' + s.root + '`' + (s.title !== s.root ? ' (' + s.title + ')' : '') + ': ' + s.note; }).join('\n'), '');
    p('### Event kinds (' + D.event_kinds.length + ')', '', D.event_kinds.join(', '), '');
    p('### Processor triggers', '', D.triggers.join(', '), '');
    p('### Job states', '', D.job_states.join(', '), '');
    p('### Error codes', '', D.error_codes.join(', '), '');
    p('### Native operations (contract.native)', '', D.native_ops.join(', '), '');
    p('### HTTP endpoints (vamp-server, part of Vampire)', '', D.endpoints.map(function (e) { return '- `' + e + '`'; }).join('\n'), '');
    p('### CLI (`vamp commands`)', '', D.cli.map(function (c) {
      return '- `vamp ' + c.name + '`' + (c.subs.length ? ' [' + c.subs.join('|') + ']' : '') + ': ' + c.about;
    }).join('\n'), '');

    p('## Links', '');
    p('- [Human view](index.html)', '- [llms.txt](llms.txt)', '- [index.md](index.md): this page as markdown', '- [install](install): the installer script (`' + INSTALL + '`)', '- [session.log](session.log): the raw take (vamp 0.1.0, scratch homes, 15 Oct 2026)', '- [Source](https://github.com/selfdrivingjazz/vamp): protocol, engine and vamp CLI (MIT); packages: soon', '- Vampire: soon');
    return L.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  var SUMMARY = 'VAMP is an experimental, MIT-licensed visual media protocol for humans and agents (wire 0.1): keep media where it is (identified by BLAKE3), deliver it between an authority, its replicas and the agents on them over one ordered event stream, transform it with tools you register, and share it with the people and machines you admit. Vampire is the Mac/iOS viewer built on it.';

  function banner() { return root.VampField.ascii(76, 27, { aspect: 0.5, radius: 10.5 }); }

  var api = {
    TAGLINE: TAGLINE, INSTALL: INSTALL, SECTIONS: SECTIONS, KEEP: KEEP, DELIVER: DELIVER, PROCESSOR_SPEC: PROCESSOR_SPEC,
    INSPECT: INSPECT, COLORS: COLORS, EVENTS: EVENTS, ALLOW: ALLOW, ID_W: ID_W, ID_M: ID_M,
    machine: function (D) {
      return banner() + '\n\nVAMP.SH :: MACHINE-READABLE INDEX\n' +
        '# ' + TAGLINE + '\n' +
        '# Plain-text twin of vamp.sh for agents, crawlers and people who prefer it raw. Also served as llms.txt and index.md.\n\n' + body(D);
    },
    llms: function (D) {
      return '# VAMP\n\n> ' + SUMMARY + '\n\n' + body(D).replace('- [llms.txt](llms.txt)\n', '');
    },
    markdown: function (D) {
      return '# VAMP\n\n> ' + TAGLINE + '\n\n' + fence('text', banner()) + '\n\n' + body(D).replace('- [index.md](index.md): this page as markdown\n', '');
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.VampContent = api;
})(typeof window !== 'undefined' ? window : globalThis);
