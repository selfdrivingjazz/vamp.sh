/*
 * The complete, plain reference for vamp.sh. The Human page shows artifacts with short labels;
 * the detail lives here. One source for three renderings:
 *   - the Machine view (index.html#machine)
 *   - llms.txt and index.md (written by `node tools/build.mjs`)
 * Runs in the browser and in Node (no DOM). Needs data.js (window.VAMP_DATA) loaded first.
 */
(function (root) {
  'use strict';

  /* The recorded session (session.log), pretty-printed and shortened with …, never rewritten. */
  var SESSION = [
    {
      t: 'Init', d: 'A scratch home; the real library is never touched.',
      run: [
        { cmd: 'export VAMP_HOME=/tmp/vamp-lander VAMP_ACTOR=agent:lander-human-machine' },
        { cmd: 'vamp init --name lander', out: '{\n  "context": {\n    "library_id": "405a94fd-ce2b-4d2e-ab48-085bb725b595",\n    "original_root": null,\n    "state_dir": "/tmp/vamp-lander/libraries/405a94fd-…"\n  },\n  "name": "lander"\n}' }
      ]
    },
    {
      t: 'Add', d: 'Read once, hash with BLAKE3, reference in place.',
      run: [
        { cmd: 'vamp media add moon-bat.jpg', out: '{\n  "id": "bc8b501d-ea5a-4c0d-90a8-5c1d5c296698",\n  "name": "moon-bat.jpg",\n  "original": {\n    "blake3": "504de3d9c82ce940bf99747384e890c05751591f1aa27571bb6202d36d22dfc0",\n    "byte_size": 30552,\n    "hash_state": "hashed",\n    "mime": "image/jpeg",\n    "path": "/tmp/refs/moon-bat.jpg",\n    "storage": "local",\n    …\n  },\n  "revision": 1,\n  …\n}' }
      ]
    },
    {
      t: 'Patch', d: 'A MetadataPatch, guarded by the revision that was read.',
      run: [
        { cmd: 'ID=bc8b501d-ea5a-4c0d-90a8-5c1d5c296698' },
        { cmd: 'cat patch.json', out: '{"tags":["moon","bat","night"],"description":"the icon, at night"}' },
        { cmd: 'vamp media update $ID --patch patch.json --expected-revision 1', out: '{\n  "id": "bc8b501d-ea5a-4c0d-90a8-5c1d5c296698",\n  "metadata": {\n    "description": "the icon, at night",\n    "tags": ["bat", "moon", "night"],\n    …\n  },\n  "revision": 2,\n  …\n}' }
      ]
    },
    {
      t: 'Stale write', d: 'The same expected revision again: refused, nothing written.',
      run: [
        { cmd: 'cat stale.json', out: '{"add_tags":["coral"]}' },
        { cmd: 'vamp media update $ID --patch stale.json --expected-revision 1', out: '{"error":{"code":"operation_failed","message":"revision conflict: expected 1, current 2"},"protocol_version":"0.1"}', err: true, exit: 1 }
      ]
    },
    {
      t: 'Events', d: 'Everything after cursor 1. The refused write left no event.',
      run: [
        { cmd: 'vamp events --after 1', out: '[\n  {\n    "actor": "agent:lander-human-machine",\n    "asset_id": "bc8b501d-ea5a-4c0d-90a8-5c1d5c296698",\n    "kind": "media_updated",\n    "payload": { "change": "metadata" },\n    "revision": 2,\n    "sequence": 2,\n    …\n  }\n]' }
      ]
    },
    {
      t: 'Schema', d: 'Every root of the schema bundle, printed by the binary.',
      run: [
        { cmd: "vamp schema | jq -r 'keys[]'", schemaKeys: true, plain: true }
      ]
    }
  ];

  function leader(k, v) { return (k + ' ').padEnd(20, '.') + ' ' + v; }
  function fence(lang, body) { return '```' + lang + '\n' + body.replace(/\n+$/, '') + '\n```'; }

  function sessionOut(D, r) {
    return r.schemaKeys ? D.schema.map(function (s) { return s.root; }).join('\n') : r.out;
  }

  /* Markdown body shared by the Machine view, llms.txt and index.md. */
  function body(D) {
    var schemaCount = D.schema.length;
    var generated = D.schema.filter(function (s) { return s.root !== 'contract' && s.root !== 'protocol_version'; }).length;
    var L = [];
    var p = function () { for (var i = 0; i < arguments.length; i++) L.push(arguments[i]); };

    p('## About', '', fence('text', [
      leader('NAME', 'VAMP'),
      leader('WHAT', 'media-catalog interoperability protocol'),
      leader('WIRE_VERSION', D.protocol_version),
      leader('STATUS', D.status),
      leader('LICENSE', 'MIT: the contract, Rust types and generated JSON Schemas'),
      leader('SOURCE', 'not public yet (soon); no crates.io or npm package yet'),
      leader('BINDING', D.binding),
      leader('APP', 'Vampire, Mac/iOS, proprietary, one-time purchase; ships the vamp CLI and server')
    ].join('\n')), '');
    p('A vamp is a short figure a band repeats so soloists can come in and go out. VAMP is that figure for media: assets, revisions and events that any tool, app or agent can play over.', '');
    p('The catalog is reference-only. Originals stay where they are and are identified by the BLAKE3 digest of their exact bytes. One local authority (SQLite) writes; replicas follow its event stream.', '');

    p('## The figure: four moves', '');
    p('### 1. Asset', '', 'A stable UUID, independent of the file’s path or digest. The original is referenced in place: path, BLAKE3, byte size, MIME type.', '',
      fence('json', '"id": "bc8b501d-ea5a-4c0d-90a8-5c1d5c296698",\n"original": {\n  "blake3": "504de3d9c82ce940bf99747384e890c05751591f1aa27571bb6202d36d22dfc0",\n  "path": "/tmp/refs/moon-bat.jpg",\n  "storage": "local"\n}'), '');
    p('### 2. Revision', '', 'Metadata changes advance the asset revision. `--expected-revision` rejects a stale write without changing metadata or emitting an event.', '',
      fence('json', '{"error":{"code":"operation_failed","message":"revision conflict: expected 1, current 2"},"protocol_version":"0.1"}'), '');
    p('### 3. Event', '', 'Every change is an ordered event with a monotonic sequence per library. Consumers keep their last sequence and ask for later events (`vamp events --after N`).', '',
      fence('json', '{"sequence": 2, "kind": "media_updated", "actor": "agent:lander-human-machine",\n "revision": 2, "payload": {"change": "metadata"}}'), '');
    p('### 4. Observation', '', 'Processors are explicitly registered local executables, run with argv and never through a shell. One ToolRequest JSON on stdin, one ToolResponse on stdout. They add observations (captions, tags, embeddings) and never edit originals.', '',
      fence('text', 'ProcessorSpec required: ' + ['name', 'events', 'command', 'input', 'output'].join(', ') + '\ntriggers: ' + D.triggers.join(', ')), '');
    p('### Event kinds (' + D.event_kinds.length + ')', '', D.event_kinds.map(function (k) { return '- ' + k; }).join('\n'), '');

    p('## Session', '');
    p('Recorded on 15 Oct 2026 with `vamp 0.1.0` against a scratch library (`VAMP_HOME=/tmp/vamp-lander`). The `vamp` CLI ships with Vampire. JSON on stdout; errors as JSON on stderr with a nonzero exit. Output is pretty-printed and shortened where marked `…`, never rewritten. Raw take: [session.log](session.log).', '');
    SESSION.forEach(function (s, i) {
      p('### ' + (i + 1) + '. ' + s.t, '', s.d, '', fence('sh', s.run.map(function (r) {
        var o = sessionOut(D, r);
        return '$ ' + r.cmd + (o ? '\n' + o : '') + (r.exit ? '\n[exit ' + r.exit + ']' : '');
      }).join('\n')), '');
    });

    p('## Schema', '');
    p('`vamp schema` and `cargo run -p vamp-protocol --example schema` print the same bundle: ' + schemaCount + ' roots, ' + generated + ' JSON Schemas plus `contract` and `protocol_version`.', '');
    p(D.schema.map(function (s) { return '- `' + s.root + '`' + (s.title !== s.root ? ' (' + s.title + ')' : '') + ': ' + s.note; }).join('\n'), '');

    p('## Agents', '');
    p('Agents work in the library with the same CLI; `vamp guide` prints their manual. A research mission is an exploration: a folder of findings, each filed with its source URL. The owner answers in the app with ratings and tags; the agent reads them back with `vamp explore feedback`.', '');
    p(fence('sh', [
      '# agent opens a mission',
      '$ vamp explore ensure night-shapes --title "Night shapes" --brief "bat silhouettes, moon discs, 1-bit"',
      '"name": "Night shapes", "items": [], "link": "vampire://open?library=405a94fd-…&folder=4fcc26b5-…"',
      '',
      '# agent files a finding, with provenance',
      '$ vamp explore add night-shapes --name "Moon, 1-bit" --note "threshold at 90: the bat survives as pure ink" \\',
      '    --tags moon,dither --url https://vamp.sh/ --file moon-1bit.png',
      '"status": "created", "kind": "file", "source_url": "https://vamp.sh/", "tags": ["dither", "moon"]',
      '',
      '# owner rates it 5 and tags it more-like-this',
      '{"kind": "media_updated", "actor": "local", "payload": {"change": "metadata"}, "sequence": 11}',
      '',
      '# agent reads it back',
      '$ vamp explore feedback night-shapes',
      '"counts": {"like": 1, "more_like_this": 1},',
      '"items": [{"name": "Moon, 1-bit", "rating": 5, "signals": ["like", "more_like_this"], …}]'
    ].join('\n')), '');
    p('In this take the owner’s turn was played from the CLI, so its actor is `local`; from the app it is `tailnet:<login>/<host>`. Ratings 4–5 read as like, 1–2 as dislike; `more-like-this` means go deeper.', '');

    p('## Vampire', '');
    p('The Mac and iOS library app built on VAMP: an Eagle-style grid, replicas over Tailscale, a browser clipper. Proprietary, a one-time purchase. The protocol does not require it.', '');

    p('## Contract index', '');
    p('Names read from `contract.json` and `vamp commands`.', '');
    p('### Processor triggers', '', D.triggers.join(', '), '');
    p('### Job states', '', D.job_states.join(', '), '');
    p('### Error codes', '', D.error_codes.join(', '), '');
    p('### Native operations (contract.native)', '', D.native_ops.join(', '), '');
    p('### HTTP endpoints (vamp-server, part of Vampire)', '', D.endpoints.map(function (e) { return '- `' + e + '`'; }).join('\n'), '');
    p('### CLI (`vamp commands`)', '', D.cli.map(function (c) {
      return '- `vamp ' + c.name + '`' + (c.subs.length ? ' [' + c.subs.join('|') + ']' : '') + ': ' + c.about;
    }).join('\n'), '');

    p('## Links', '');
    p('- [Human view](index.html)', '- [llms.txt](llms.txt)', '- [index.md](index.md): this page as markdown', '- [session.log](session.log): the raw recorded session', '- Protocol source and packages: soon');
    return L.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  var SUMMARY = 'VAMP is an experimental, MIT-licensed media-catalog interoperability protocol (wire 0.1). A reference-only catalog: originals stay in place, identified by BLAKE3; assets have stable UUIDs; revisions guard writes; every change is an ordered event. Vampire is the proprietary Mac/iOS app built on it.';

  function banner() { return root.VampField.ascii(76, 27, { aspect: 0.5, radius: 10.5 }); }

  var api = {
    SESSION: SESSION,
    sessionOut: sessionOut,
    /* Machine view: banner, then the reference. */
    machine: function (D) {
      return banner() + '\n\nVAMP.SH :: MACHINE-READABLE INDEX\n' +
        '# Plain-text twin of vamp.sh for agents, crawlers and people who prefer it raw.\n' +
        '# Also served as llms.txt and index.md.\n\n' + body(D);
    },
    /* llms.txt (llmstxt.org): H1, blockquote summary, sections. */
    llms: function (D) {
      return '# VAMP\n\n> ' + SUMMARY + '\n\n' + body(D).replace('- [llms.txt](llms.txt)\n', '');
    },
    /* index.md: the page as markdown. */
    markdown: function (D) {
      return '# VAMP\n\n> The protocol is the vamp: assets, revisions and events that apps and agents play over.\n\n' +
        fence('text', banner()) + '\n\n' + body(D).replace('- [index.md](index.md): this page as markdown\n', '');
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.VampContent = api;
})(typeof window !== 'undefined' ? window : globalThis);
