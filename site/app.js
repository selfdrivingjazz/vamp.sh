/* vamp.sh. No dependencies. One clock (92 BPM) drives the field's flap and the terminal's entries. */
(function () {
  'use strict';

  var D = window.VAMP_DATA, C = window.VampContent, F = window.VampField;
  var BEAT = F.BEAT_MS;
  var EPOCH = performance.now();
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (s) { return document.querySelector(s); };
  var all = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var pad2 = function (n) { return String(n).padStart(2, '0'); };

  /* JSON-ish highlighting that tolerates cut excerpts (… and "… N more"). */
  function hl(src) {
    return esc(src).replace(/("(?:[^"\\]|\\.)*")(\s*:)?|(\b-?\d+(?:\.\d+)?\b)|\b(true|false|null)\b|(…(?: \d+ more)?)/g,
      function (m, str, colon, num, lit, cut) {
        if (str) return colon ? str + colon : '<span class="j-s">' + str + '</span>';
        if (num) return '<span class="j-n">' + num + '</span>';
        if (lit) return '<span class="j-l">' + lit + '</span>';
        return '<span class="j-cut">' + cut + '</span>';
      });
  }
  function promptHtml(host) { return (host ? '<span class="host">' + host + '</span>' : '') + '<span class="prompt">$</span> '; }
  function outHtml(r) {
    var h = '';
    if (r.out) h += (r.err ? '<span class="err">' + esc(r.out) + '</span>' : r.plain ? esc(r.out) : hl(r.out)) + '\n';
    if (r.exit) h += '<span class="exit">[exit ' + r.exit + ']</span>\n';
    return h;
  }
  function runHtml(r, host) { return promptHtml(host) + '<span class="cmd">' + esc(r.cmd) + '</span>\n' + outHtml(r); }

  /* ── static artifacts, from content.js ── */
  C.KEEP.forEach(function (r, i) {
    $('#keep-' + (i + 1)).innerHTML = runHtml(r).replace(/\n$/, '').split(C.ID_M).join('<mark>' + C.ID_M + '</mark>');
  });
  $('#spec-code').innerHTML = hl(JSON.stringify(JSON.parse(C.PROCESSOR_SPEC), null, 2)
    .replace(/\[\s+("[^"\]]*")\s+\]/g, '[$1]'));
  $('#inspect-code').innerHTML = hl(C.INSPECT);
  $('#swatches').innerHTML = C.COLORS.map(function (c) {
    return '<span style="flex-grow:' + c[1] + ';background:' + c[0] + '"></span>';
  }).join('');
  $('#swatches').setAttribute('aria-label', 'Palette recorded on the asset: ' + C.COLORS.map(function (c) { return c[0] + ' ' + Math.round(c[1] * 100) + '%'; }).join(', '));
  $('#events').innerHTML = C.EVENTS.map(function (e) {
    var agent = e[2].indexOf('agent:') === 0;
    return '<tr' + (agent ? ' class="hot"' : '') + '><td>' + pad2(e[0]) + '</td><td>' + e[1] + '</td><td>' + esc(e[2]) + '</td><td>' + e[3] + '</td></tr>';
  }).join('');
  $('#allow-code').innerHTML = runHtml(C.ALLOW).replace(/\n$/, '');
  $('#roots').innerHTML = D.schema.map(function (s) { return '<li>' + s.root + '</li>'; }).join('');
  $('#schema-count').textContent = D.schema.filter(function (s) { return s.root !== 'contract' && s.root !== 'protocol_version'; }).length;

  /* ── the clock (shared by the field, its stepper and the terminal) ── */
  /* ms until the next multiple of `beats` on the shared clock */
  function untilGrid(beats) {
    var span = BEAT * beats, t = performance.now() - EPOCH;
    return Math.ceil(t / span + 1e-6) * span - t;
  }

  /* The moon: right of the headline on wide screens, above it on phones. */
  function layout(w, h) {
    if (w < 600) return { cx: w * 0.5, cy: w * 0.44, r: w * 0.29 };
    if (w < 1100) return { cx: w * 0.75, cy: h * 0.44, r: Math.min(w * 0.19, h * 0.3) };
    return { cx: w * 0.75, cy: h * 0.44, r: Math.min(w * 0.22, h * 0.33) };
  }

  /* The stepper sits under the moon, counting the figure's beats. */
  var stepper = $('#stepper'), barEl = $('#bar'), beatEls = all('#beats li');
  function onBeat(n) {
    barEl.textContent = String((n >> 2) + 1).padStart(4, '0');
    for (var i = 0; i < 4; i++) beatEls[i].classList.toggle('on', i === (n & 3));
  }
  function placeStepper(g) {
    stepper.style.left = g.cx + 'px';
    stepper.style.top = (g.cy + g.r * 1.16) + 'px';
  }

  var field, sync = function () {};
  function initField() {
    var canvas = $('#field');
    field = new F.Field(canvas, { layout: layout, epoch: EPOCH, reduced: reduced.matches, onBeat: onBeat });
    placeStepper(field.geom);
    onBeat(0);
    var heroOn = true;
    sync = function () {
      var live = !document.hidden && !reduced.matches && document.body.dataset.view === 'human' && heroOn;
      if (live) field.start(); else field.stop();
    };
    new IntersectionObserver(function (e) { heroOn = e[0].isIntersecting; sync(); }).observe(canvas);
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', function () {
      field.reduced = reduced.matches;
      if (reduced.matches) { field.stop(); field.resize(); }
      sync();
    });
    var raf = 0;
    new ResizeObserver(function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () { field.resize(); placeStepper(field.geom); });
    }).observe(canvas);
    sync();
  }

  /* ── Deliver: terminal replay; commands enter on the beat, steps on the downbeat ── */
  var S = C.DELIVER, term = $('#term'), stepsEl = $('#steps');
  stepsEl.innerHTML = S.map(function (s, i) {
    return '<li><button type="button" data-step="' + i + '"><span class="n">' + pad2(i + 1) + '</span> ' + esc(s.t) + ' <span class="where">' + s.host + '</span></button></li>';
  }).join('');
  var stepLis = Array.prototype.slice.call(stepsEl.children);
  function stepHtml(s) { return s.run.map(function (r) { return runHtml(r, s.host); }).join('\n') + '\n'; }
  function mark(i) { stepLis.forEach(function (li, k) { li.classList.toggle('on', k === i); li.classList.toggle('done', k < i); }); }

  var P = { token: 0, timer: 0, visible: false, started: false };
  function wait(ms, tok) {
    return new Promise(function (res) {
      (function go(left) {
        if (tok !== P.token) return res(false);
        if (!P.visible || document.hidden) { P.timer = setTimeout(function () { go(left); }, 200); return; }
        if (left <= 0) return res(true);
        var step = Math.min(left, 200);
        P.timer = setTimeout(function () { go(left - step); }, step);
      })(ms);
    });
  }
  function scroll() { term.scrollTop = term.scrollHeight; }

  async function play(from) {
    clearTimeout(P.timer);
    var tok = ++P.token, i = from;
    term.innerHTML = S.slice(0, i).map(stepHtml).join('');
    scroll();
    while (true) {
      mark(i);
      for (var k = 0; k < S[i].run.length; k++) {
        var r = S[i].run[k];
        if (!(await wait(untilGrid(1), tok))) return;
        var line = document.createElement('span');
        line.innerHTML = promptHtml(S[i].host) + '<span class="cmd"></span><span class="caret"></span>';
        term.appendChild(line);
        var cmd = line.querySelector('.cmd');
        for (var c = 1; c <= r.cmd.length; c++) {
          cmd.textContent = r.cmd.slice(0, c);
          scroll();
          if (!(await wait(BEAT / 24, tok))) return;
        }
        line.querySelector('.caret').remove();
        term.insertAdjacentHTML('beforeend', '\n');
        var out = outHtml(r).split('\n');
        for (var o = 0; o < out.length - 1; o++) {
          term.insertAdjacentHTML('beforeend', out[o] + '\n');
          scroll();
          if (!(await wait(BEAT / 32, tok))) return;
        }
        term.insertAdjacentHTML('beforeend', '\n');
      }
      i += 1;
      if (i >= S.length) {
        if (!(await wait(untilGrid(4) + BEAT * 4, tok))) return;
        i = 0;
        term.innerHTML = '';
      }
      if (!(await wait(untilGrid(4), tok))) return;
    }
  }

  function initTerminal() {
    if (reduced.matches) {
      term.innerHTML = S.map(function (s, i) { return '<span data-block="' + i + '">' + stepHtml(s) + '</span>'; }).join('');
      mark(0);
    }
    stepsEl.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-step]');
      if (!b) return;
      var i = +b.dataset.step;
      if (reduced.matches) {
        mark(i);
        var blk = term.querySelector('[data-block="' + i + '"]');
        if (blk) term.scrollTop = blk.offsetTop - term.offsetTop;
        return;
      }
      P.started = true;
      play(i);
    });
    if (reduced.matches) return;
    new IntersectionObserver(function (e) {
      P.visible = e[0].isIntersecting;
      if (P.visible && !P.started) { P.started = true; play(0); }
    }, { threshold: 0.3 }).observe(term);
  }

  /* ── Machine view ── */
  function renderMachine() {
    var doc = $('#machine-doc');
    if (doc.dataset.ready) return;
    var text = C.machine(D), cut = text.indexOf('\n\n');
    doc.innerHTML = '<span class="art" aria-hidden="true">' + esc(text.slice(0, cut)) + '</span>' + esc(text.slice(cut))
      .replace(/^(#{1,3} .*|VAMP\.SH :: .*)$/gm, '<span class="h">$1</span>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, label, href) {
        var v = href === 'index.html' ? ' data-view-link="human"' : '';
        return '[' + label + '](<a href="' + href + '"' + v + '>' + href + '</a>)';
      });
    doc.dataset.ready = '1';
  }

  var toggles = all('.toggle button');
  function setView(view, user) {
    var machine = view === 'machine';
    if (machine) renderMachine();
    document.body.dataset.view = view;
    $('#human').hidden = machine;
    $('#machine').hidden = !machine;
    toggles.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.view === view)); });
    if (user) {
      history.replaceState(null, '', machine ? '#machine' : location.pathname + location.search);
      window.scrollTo(0, 0);
    }
    sync();
  }
  toggles.forEach(function (b) { b.addEventListener('click', function () { setView(b.dataset.view, true); }); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-view-link]');
    if (a) { e.preventDefault(); setView(a.dataset.viewLink, true); }
  });
  window.addEventListener('hashchange', function () { if (location.hash === '#machine') setView('machine', false); });
  setView(location.hash === '#machine' ? 'machine' : 'human', false);

  (document.fonts ? document.fonts.load('500 11px "Geist Mono"') : Promise.resolve()).then(function () {
    initField();
    initTerminal();
  });
})();
