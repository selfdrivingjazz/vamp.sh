/* vamp.sh / human-machine prototype. No dependencies. */
(function () {
  'use strict';

  var D = window.VAMP_DATA;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };

  /* ── JSON-ish highlighting (works on cut excerpts with … markers) ── */
  function hl(src) {
    return esc(src).replace(/("(?:[^"\\]|\\.)*")(\s*:)?|(\b-?\d+(?:\.\d+)?\b)|\b(true|false|null)\b|(…(?: \d+ more)?)/g,
      function (m, str, colon, num, lit, cut) {
        if (str) return '<span class="' + (colon ? 'j-k' : 'j-s') + '">' + str + '</span>' + (colon || '');
        if (num) return '<span class="j-n">' + num + '</span>';
        if (lit) return '<span class="j-l">' + lit + '</span>';
        return '<span class="j-cut">' + cut + '</span>';
      });
  }

  /* ── The recorded session (session.log), shortened with … ── */
  var SESSION = [
    {
      t: 'Init', d: 'A scratch home. The real library is never touched.',
      run: [
        { cmd: 'export VAMP_HOME=/tmp/vamp-lander VAMP_ACTOR=agent:lander-human-machine' },
        { cmd: 'vamp init --name lander', out: '{\n  "context": {\n    "library_id": "405a94fd-ce2b-4d2e-ab48-085bb725b595",\n    "original_root": null,\n    "state_dir": "/tmp/vamp-lander/libraries/405a94fd-…"\n  },\n  "name": "lander"\n}' }
      ]
    },
    {
      t: 'Add', d: 'Read once, hash, reference in place.',
      run: [
        { cmd: 'vamp media add moon-bat.jpg', out: '{\n  "id": "bc8b501d-ea5a-4c0d-90a8-5c1d5c296698",\n  "name": "moon-bat.jpg",\n  "original": {\n    "blake3": "504de3d9c82ce940bf99747384e890c05751591f1aa27571bb6202d36d22dfc0",\n    "byte_size": 30552,\n    "hash_state": "hashed",\n    "mime": "image/jpeg",\n    "path": "/tmp/refs/moon-bat.jpg",\n    "storage": "local",\n    …\n  },\n  "revision": 1,\n  …\n}' }
      ]
    },
    {
      t: 'Patch', d: 'A MetadataPatch, guarded by the revision you read.',
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
      t: 'Schema', d: 'Every payload type, printed by the binary itself.',
      run: [
        { cmd: "vamp schema | jq -r 'keys[]'", out: D.schema.map(function (s) { return s.root; }).join('\n'), plain: true }
      ]
    }
  ];

  /* ── Tape + kinds list ── */
  (function () {
    var tape = $('#tape');
    var items = D.event_kinds.map(function (k, i) { return '<span><b>' + String(i + 1).padStart(2, '0') + '</b>' + k + '</span>'; }).join('');
    tape.innerHTML = items + items;
    $('#kinds').innerHTML = D.event_kinds.map(function (k, i) {
      return '<li data-kind="' + k + '"><span class="pix" aria-hidden="true">' + String(i + 1).padStart(2, '0') + '</span>' + k + '</li>';
    }).join('');
    $('#kinds-count').textContent = D.event_kinds.length;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { tape.parentNode.classList.toggle('paused', !e[0].isIntersecting); }).observe(tape.parentNode);
    }
  })();

  /* ── One clock: the field, the hero counter and the four beat columns share it ── */
  var beatEls = Array.prototype.slice.call(document.querySelectorAll('#beats li'));
  var barEl = $('#bar');
  var beatCols = Array.prototype.slice.call(document.querySelectorAll('.beat'));
  var EPOCH = performance.now();
  var field = null;

  function onBeat(bar, beat) {
    barEl.textContent = String(bar).padStart(4, '0');
    for (var i = 0; i < 4; i++) {
      beatEls[i].classList.toggle('on', i === beat);
      beatCols[i].classList.toggle('on', i === beat);
    }
  }

  var metro = { on: false, last: -1 };
  function metroTick(now) {
    if (!metro.on) return;
    requestAnimationFrame(metroTick);
    var b = Math.floor((now - EPOCH) / window.VampField.BEAT_MS);
    if (b !== metro.last) { metro.last = b; onBeat((b >> 2) + 1, b & 3); }
  }

  function layout(w, h) {
    if (w < 600) return { cx: w * 0.5, cy: w * 0.76, r: w * 0.32 };
    if (w < 1100) return { cx: w * 0.66, cy: h * 0.36, r: Math.min(w * 0.24, h * 0.27) };
    return { cx: w * 0.75, cy: h * 0.45, r: Math.min(w * 0.22, h * 0.35) };
  }

  function initField() {
    var canvas = $('#field');
    field = new window.VampField.Field(canvas, { layout: layout, epoch: EPOCH, reduced: reduced.matches });
    var heroOn = true, barOn = false;
    function sync() {
      var live = !document.hidden && !reduced.matches && document.body.dataset.view === 'human';
      if (live && heroOn) field.start(); else field.stop();
      var tick = live && (heroOn || barOn);
      if (tick && !metro.on) { metro.on = true; requestAnimationFrame(metroTick); }
      if (!tick) metro.on = false;
      $('#field-state').textContent = reduced.matches ? 'still' : live && heroOn ? 'looping' : 'paused';
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { heroOn = e[0].isIntersecting; sync(); }).observe(canvas);
      new IntersectionObserver(function (e) { barOn = e[0].isIntersecting; sync(); }).observe($('#bar-grid'));
    }
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener && reduced.addEventListener('change', function () { field.reduced = reduced.matches; if (reduced.matches) { field.stop(); field.resize(); } sync(); });
    var raf = 0;
    new ResizeObserver(function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { field.resize(); }); }).observe(canvas);
    initField.sync = sync;
    if (reduced.matches) onBeat(1, 0);
    sync();
  }

  /* ── Terminal replay ── */
  var term = $('#term'), stepsEl = $('#steps');
  stepsEl.innerHTML = SESSION.map(function (s, i) {
    return '<li><button type="button" data-step="' + i + '"><span class="n">' + String(i + 1).padStart(2, '0') + '</span><span class="t">' + esc(s.t) + '</span><span class="d">' + esc(s.d) + '</span></button></li>';
  }).join('');
  var stepLis = Array.prototype.slice.call(stepsEl.children);

  function renderOut(r) {
    var html = '';
    if (r.out) html += (r.err ? '<span class="err">' + esc(r.out) + '</span>' : r.plain ? esc(r.out) : hl(r.out)) + '\n';
    if (r.exit) html += '<span class="exit">[exit ' + r.exit + ']</span>\n';
    return html;
  }
  function staticStep(s) {
    return s.run.map(function (r) { return '<span class="prompt">$</span> <span class="cmd">' + esc(r.cmd) + '</span>\n' + renderOut(r); }).join('\n') + '\n';
  }
  function markSteps(i) {
    stepLis.forEach(function (li, k) { li.classList.toggle('on', k === i); li.classList.toggle('done', k < i); });
  }

  var player = { step: 0, timer: 0, token: 0, visible: false, started: false };
  function wait(ms, tok) { return new Promise(function (res) { player.timer = setTimeout(function () { res(tok === player.token); }, ms); }); }
  function whenVisible(tok) {
    return new Promise(function (res) {
      (function check() { if (tok !== player.token) return res(false); if (player.visible && !document.hidden) return res(true); player.timer = setTimeout(check, 250); })();
    });
  }

  async function play(from) {
    clearTimeout(player.timer);
    var tok = ++player.token;
    var i = from;
    term.innerHTML = SESSION.slice(0, i).map(staticStep).join('');
    while (tok === player.token) {
      markSteps(i);
      var s = SESSION[i];
      for (var k = 0; k < s.run.length; k++) {
        var r = s.run[k];
        var line = document.createElement('span');
        line.innerHTML = '<span class="prompt">$</span> <span class="cmd"></span><span class="caret"></span>';
        term.appendChild(line);
        var cmdEl = line.querySelector('.cmd');
        for (var c = 0; c <= r.cmd.length; c++) {
          if (!(await whenVisible(tok))) return;
          cmdEl.textContent = r.cmd.slice(0, c);
          term.scrollTop = term.scrollHeight;
          if (!(await wait(c === r.cmd.length ? 260 : 16 + Math.random() * 26, tok))) return;
        }
        line.querySelector('.caret').remove();
        term.insertAdjacentHTML('beforeend', '\n');
        var out = renderOut(r).split('\n');
        for (var o = 0; o < out.length - 1; o++) {
          term.insertAdjacentHTML('beforeend', out[o] + '\n');
          term.scrollTop = term.scrollHeight;
          if (!(await wait(22, tok))) return;
        }
        term.insertAdjacentHTML('beforeend', '\n');
        if (!(await wait(520, tok))) return;
      }
      if (!(await wait(1500, tok))) return;
      i = i + 1;
      if (i >= SESSION.length) {
        if (!(await wait(2600, tok))) return;
        i = 0;
        term.innerHTML = '';
      }
      player.step = i;
    }
  }

  function initTerminal() {
    stepsEl.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-step]');
      if (!b) return;
      var i = +b.dataset.step;
      if (reduced.matches) {
        markSteps(i);
        var target = term.querySelectorAll('.step-block')[i];
        if (target) term.scrollTop = target.offsetTop - term.offsetTop;
        return;
      }
      player.started = true;
      play(i);
    });
    if (reduced.matches) {
      term.innerHTML = SESSION.map(function (s) { return '<span class="step-block">' + staticStep(s) + '</span>'; }).join('');
      markSteps(0);
      return;
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        player.visible = e[0].isIntersecting;
        if (player.visible && !player.started) { player.started = true; play(0); }
      }, { threshold: 0.35 }).observe(term);
    } else { player.visible = true; play(0); }
  }

  /* ── Schema explorer (tabs) ── */
  var rootsEl = $('#roots');
  rootsEl.innerHTML = D.schema.map(function (s, i) {
    var count = s.root === 'protocol_version' ? '' : s.root === 'contract' ? s.props + ' keys' : s.props + ' props';
    return '<button type="button" role="tab" id="tab-' + s.root + '" aria-controls="root-panel" aria-selected="false" tabindex="-1" data-i="' + i + '">' +
      '<span class="pix">' + String(i + 1).padStart(2, '0') + '</span><span>' + s.root + '</span><span class="c">' + count + '</span></button>';
  }).join('');
  var tabs = Array.prototype.slice.call(rootsEl.children);
  function selectRoot(i, focus) {
    var s = D.schema[i];
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
    if (focus) tabs[i].focus();
    $('#root-panel').setAttribute('aria-labelledby', 'tab-' + s.root);
    $('#root-name').textContent = s.root;
    var meta = [s.title];
    if (s.required) meta.push(s.required + ' required');
    if (s.defs.length) meta.push('$defs: ' + s.defs.join(', '));
    $('#root-meta').textContent = meta.join('  /  ');
    $('#root-note').textContent = s.note;
    $('#root-json').innerHTML = hl(s.json);
  }
  rootsEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) selectRoot(+b.dataset.i); });
  rootsEl.addEventListener('keydown', function (e) {
    var cur = tabs.indexOf(document.activeElement); if (cur < 0) return;
    var n = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (e.key === 'Home') { selectRoot(0, true); e.preventDefault(); }
    else if (e.key === 'End') { selectRoot(tabs.length - 1, true); e.preventDefault(); }
    else if (n) { selectRoot((cur + n + tabs.length) % tabs.length, true); e.preventDefault(); }
  });
  selectRoot(0);

  /* ── Machine view: the human page, walked into plain text ── */
  var PROVIDERS = {
    session: function () {
      return SESSION.map(function (s, i) {
        return '### ' + (i + 1) + '. ' + s.t + '\n' + s.d + '\n\n```sh\n' + s.run.map(function (r) {
          return '$ ' + r.cmd + (r.out ? '\n' + r.out : '') + (r.exit ? '\n[exit ' + r.exit + ']' : '');
        }).join('\n') + '\n```\n';
      }).join('\n');
    },
    schema: function () {
      return D.schema.map(function (s) { return '- ' + s.root + (s.title !== s.root ? ' (' + s.title + ')' : '') + ': ' + s.note; }).join('\n') +
        '\n\nFull bundle: `vamp schema`, or `cargo run -p vamp-protocol --example schema` in the protocol repo.';
    }
  };

  function inline(node) {
    var out = '';
    node.childNodes.forEach(function (n) {
      if (n.nodeType === 3) { out += n.nodeValue; return; }
      if (n.nodeType !== 1 || n.getAttribute('aria-hidden') === 'true' || n.dataset.md === 'skip') return;
      if (n.matches('.beat-n')) { out += n.textContent; return; }
      if (n.matches('.num')) { out += n.textContent; return; }
      if (n.tagName === 'CODE' || n.matches('.mach')) { out += '`' + n.textContent + '`'; return; }
      if (n.tagName === 'A') { out += '[' + inline(n).trim() + '](' + n.getAttribute('href') + ')'; return; }
      if (n.tagName === 'DFN') { out += n.textContent; return; }
      if (n.matches('.idx')) return;
      out += inline(n);
    });
    return out.replace(/\s+/g, ' ');
  }

  function walk(node, lines) {
    Array.prototype.forEach.call(node.children, function (el) {
      if (el.dataset.md === 'skip' || el.getAttribute('aria-hidden') === 'true' || el.tagName === 'CANVAS' || el.tagName === 'IMG') return;
      if (el.dataset.mdProvider) { lines.push(PROVIDERS[el.dataset.mdProvider](), ''); return; }
      var tag = el.tagName;
      if (tag === 'H1') lines.push('# ' + inline(el).trim(), '');
      else if (tag === 'H2') lines.push('', '## ' + inline(el).trim(), '');
      else if (tag === 'H3') lines.push('### ' + inline(el).trim(), '');
      else if (tag === 'P') { var t = inline(el).trim(); if (t) lines.push(t, ''); }
      else if (tag === 'PRE') lines.push('```', el.textContent.replace(/\n+$/, ''), '```', '');
      else if (tag === 'UL' || tag === 'OL') {
        Array.prototype.forEach.call(el.children, function (li) {
          if (li.querySelector('p, pre')) { walk(li, lines); return; }
          lines.push('- ' + inline(li).trim());
        });
        lines.push('');
      } else if (tag === 'A') lines.push('[' + inline(el).trim() + '](' + el.getAttribute('href') + ')', '');
      else walk(el, lines);
    });
  }

  function leader(k, v) { return (k + ' ').padEnd(20, '.') + ' ' + v; }

  function machineBody() {
    var L = [];
    L.push('## About', '', '```text');
    L.push(leader('NAME', 'VAMP'));
    L.push(leader('WHAT', 'media-catalog interoperability protocol'));
    L.push(leader('WIRE_VERSION', D.protocol_version));
    L.push(leader('STATUS', D.status));
    L.push(leader('LICENSE', 'MIT: contract, Rust types, generated JSON Schemas'));
    L.push(leader('SOURCE', 'not public yet (soon); no crates.io or npm package yet'));
    L.push(leader('BINDING', D.binding));
    L.push(leader('APP', 'Vampire, Mac/iOS, proprietary, one-time purchase; ships the vamp CLI'));
    L.push('```', '');
    walk($('#human'), L);
    L.push('', '## Contract index', '');
    L.push('Names below are read from contract.json and `vamp commands`.', '');
    L.push('### Event kinds (' + D.event_kinds.length + ')', '', D.event_kinds.map(function (k) { return '- ' + k; }).join('\n'), '');
    L.push('### Processor triggers', '', D.triggers.join(', '), '');
    L.push('### Job states', '', D.job_states.join(', '), '');
    L.push('### Error codes', '', D.error_codes.join(', '), '');
    L.push('### Native operations (contract.native)', '', D.native_ops.join(', '), '');
    L.push('### HTTP endpoints (vamp-server, part of Vampire)', '', D.endpoints.map(function (e) { return '- ' + e; }).join('\n'), '');
    L.push('### CLI (`vamp commands`)', '', D.cli.map(function (c) {
      return '- vamp ' + c.name + (c.subs.length ? ' [' + c.subs.join('|') + ']' : '') + ': ' + c.about;
    }).join('\n'), '');
    L.push('## Links', '');
    L.push('- [llms.txt](llms.txt): this document as a file');
    L.push('- [session.log](session.log): the raw recorded session');
    L.push('- [Human view](#human)');
    L.push('- Protocol source: soon');
    return L.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  function banner() { return window.VampField.ascii(76, 27, { aspect: 0.5, radius: 10.5 }); }

  function machineText() {
    var art = banner();
    return art + '\n\n' +
      'VAMP.SH :: MACHINE-READABLE INDEX\n' +
      '# Plain-text twin of vamp.sh for agents, crawlers and people who prefer it raw.\n' +
      '# Same content as the human view. Also served as llms.txt.\n\n' + machineBody();
  }

  function llmsText() {
    return '# VAMP\n\n> VAMP is an experimental, MIT-licensed media-catalog interoperability protocol (wire ' + D.protocol_version +
      '). A reference-only catalog: originals stay in place, identified by BLAKE3; assets have stable UUIDs; revisions guard writes; every change is an ordered event. Vampire is the proprietary Mac/iOS app built on it.\n\n' +
      '```text\n' + banner() + '\n```\n\n' +
      machineBody().replace(/^# /gm, '## ').replace('- [llms.txt](llms.txt): this document as a file\n', '');
  }

  function renderMachine() {
    var doc = $('#machine-doc');
    if (doc.dataset.ready) return;
    var text = machineText();
    var artEnd = text.indexOf('\n\n');
    var html = '<span class="art">' + esc(text.slice(0, artEnd)) + '</span>' + esc(text.slice(artEnd))
      .replace(/^(#{1,3} .*|VAMP\.SH :: .*)$/gm, '<span class="h">$1</span>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, label, href) {
        var view = href === '#human' ? ' data-view-link="human"' : '';
        return '[' + label + '](<a href="' + href + '"' + view + '>' + href + '</a>)';
      });
    doc.innerHTML = html;
    doc.dataset.ready = '1';
  }

  window.VampMachine = { text: machineText, llms: llmsText };

  /* ── HUMAN | MACHINE ── */
  var toggleBtns = Array.prototype.slice.call(document.querySelectorAll('.toggle button'));
  function setView(view, push) {
    var machine = view === 'machine';
    if (machine) renderMachine();
    document.body.dataset.view = view;
    $('#human').hidden = machine;
    $('#machine').hidden = !machine;
    toggleBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.view === view ? 'true' : 'false'); });
    if (push) history.replaceState(null, '', machine ? '#machine' : location.pathname + location.search);
    if (initField.sync) initField.sync();
    if (push) { window.scrollTo(0, 0); }
  }
  toggleBtns.forEach(function (b) { b.addEventListener('click', function () { setView(b.dataset.view, true); }); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-view-link]');
    if (!a) return;
    e.preventDefault();
    setView(a.dataset.viewLink, true);
  });

  var initial = location.hash === '#machine' ? 'machine' : 'human';
  setView(initial, false);

  (document.fonts && document.fonts.load ? document.fonts.load('500 12px "Geist Mono"') : Promise.resolve()).then(function () {
    initField();
    initTerminal();
  });
})();
