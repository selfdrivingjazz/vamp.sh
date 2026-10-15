/* vamp.sh. No dependencies. One clock (92 BPM) drives the field, the counter, the bar and the terminal. */
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

  /* ── static renders ── */
  $('#kinds').innerHTML = D.event_kinds.map(function (k) { return '<li>' + k + '</li>'; }).join('');
  $('#kinds-count').textContent = D.event_kinds.length;

  /* ── the clock ── */
  var beatEls = all('#beats li'), beatCols = all('.beat'), barEl = $('#bar');
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
    var b = Math.floor((now - EPOCH) / BEAT);
    if (b !== metro.last) { metro.last = b; onBeat((b >> 2) + 1, b & 3); }
  }
  /* ms until the next multiple of `beats` on the shared clock */
  function untilGrid(beats) {
    var span = BEAT * beats, t = performance.now() - EPOCH;
    return Math.ceil(t / span + 1e-6) * span - t;
  }

  function layout(w, h) {
    if (w < 600) return { cx: w * 0.5, cy: w * 0.52, r: w * 0.3 };
    if (w < 1100) return { cx: w * 0.7, cy: h * 0.33, r: Math.min(w * 0.22, h * 0.24) };
    return { cx: w * 0.75, cy: h * 0.45, r: Math.min(w * 0.22, h * 0.35) };
  }

  var field, sync = function () {};
  function initField() {
    var canvas = $('#field');
    field = new F.Field(canvas, { layout: layout, epoch: EPOCH, reduced: reduced.matches });
    var heroOn = true, barOn = false;
    sync = function () {
      var live = !document.hidden && !reduced.matches && document.body.dataset.view === 'human';
      if (live && heroOn) field.start(); else field.stop();
      var tick = live && (heroOn || barOn);
      if (tick && !metro.on) { metro.on = true; requestAnimationFrame(metroTick); }
      if (!tick) metro.on = false;
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { heroOn = e[0].isIntersecting; sync(); }).observe(canvas);
      new IntersectionObserver(function (e) { barOn = e[0].isIntersecting; sync(); }).observe($('#bar-grid'));
    }
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', function () {
      field.reduced = reduced.matches;
      if (reduced.matches) { field.stop(); field.resize(); onBeat(1, 0); }
      sync();
    });
    var raf = 0;
    new ResizeObserver(function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { field.resize(); }); }).observe(canvas);
    if (reduced.matches) onBeat(1, 0);
    sync();
  }

  /* ── terminal: commands enter on the beat, steps on the downbeat ── */
  var S = C.SESSION, term = $('#term'), stepsEl = $('#steps');
  stepsEl.innerHTML = S.map(function (s, i) {
    return '<li><button type="button" data-step="' + i + '"><span class="n">' + pad2(i + 1) + '</span> ' + esc(s.t) + '</button></li>';
  }).join('');
  var stepLis = Array.prototype.slice.call(stepsEl.children);

  function outHtml(r) {
    var o = C.sessionOut(D, r), h = '';
    if (o) h += (r.err ? '<span class="err">' + esc(o) + '</span>' : r.plain ? esc(o) : hl(o)) + '\n';
    if (r.exit) h += '<span class="exit">[exit ' + r.exit + ']</span>\n';
    return h;
  }
  function stepHtml(s) {
    return s.run.map(function (r) { return '<span class="prompt">$</span> <span class="cmd">' + esc(r.cmd) + '</span>\n' + outHtml(r); }).join('\n') + '\n';
  }
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
        line.innerHTML = '<span class="prompt">$</span> <span class="cmd"></span><span class="caret"></span>';
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

  /* ── schema roots as tabs ── */
  var rootsEl = $('#roots');
  rootsEl.innerHTML = D.schema.map(function (s, i) {
    return '<button type="button" role="tab" id="tab-' + s.root + '" aria-controls="root-panel" aria-selected="false" tabindex="-1" data-i="' + i + '">' +
      '<span class="n">' + pad2(i + 1) + '</span> ' + s.root + '</button>';
  }).join('');
  var tabs = Array.prototype.slice.call(rootsEl.children);
  function selectRoot(i, focus) {
    var s = D.schema[i];
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
    if (focus) tabs[i].focus();
    $('#root-panel').setAttribute('aria-labelledby', 'tab-' + s.root);
    $('#root-name').textContent = s.root;
    var meta = s.root === 'protocol_version' ? ['string'] : s.root === 'contract' ? [s.props + ' keys'] : [s.title, s.props + ' properties'];
    $('#root-meta').textContent = meta.join(' / ');
    $('#root-json').innerHTML = hl(s.json);
  }
  rootsEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) selectRoot(+b.dataset.i); });
  rootsEl.addEventListener('keydown', function (e) {
    var cur = tabs.indexOf(document.activeElement); if (cur < 0) return;
    var n = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (e.key === 'Home') n = -cur; else if (e.key === 'End') n = tabs.length - 1 - cur;
    if (n === undefined) return;
    e.preventDefault();
    selectRoot((cur + n + tabs.length) % tabs.length, true);
  });
  selectRoot(0);

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
