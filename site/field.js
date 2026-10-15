/*
 * The vamp field: the icon's moon and bat, rendered as ordered-dithered ASCII.
 * The moon's dense cells are the hex digits of moon-bat.jpg's real BLAKE3 digest
 * (see session.log), so the picture is literally drawn from its catalog data.
 *
 * Motion is one seamless loop on the 92 BPM clock, a continuous function of time (no steps, no holds):
 *   the wings flap once every 2 beats (a sine, so the stroke eases through top and bottom),
 *   a faint ring leaves the rim on each downstroke and fades out before the next,
 *   the moon breathes once per bar.
 * Every term is periodic in 4 beats, so the loop point is invisible.
 *
 * Works in the browser (canvas) and in Node (ascii() only, for llms.txt).
 */
(function (root) {
  'use strict';

  var TEMPO = 92;
  var BEAT_MS = 60000 / TEMPO;
  var FRAME_MS = 1000 / 30; // redraw cap
  var HASH = '504de3d9c82ce940bf99747384e890c05751591f1aa27571bb6202d36d22dfc0';
  var RAMP = ' .:-=+*#%@';
  var HEX = '0123456789abcdef';
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  var TAU = Math.PI * 2;

  // Palette from the icon (BRIEF.md). Index = colour slot in the glyph atlas.
  var COLORS = ['#ef514f', '#df3f46', '#ce2b39', '#59142d', '#3f0d28', '#290922', '#ce2b39'];
  var C_MOON = 0, C_HALO = 3, C_FAR = 5, C_RING = 6;

  var bat = null;
  function batBits() {
    if (bat) return bat;
    var B = root.VAMP_BAT;
    var bin = typeof atob === 'function' ? atob(B.b) : Buffer.from(B.b, 'base64').toString('binary');
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    bat = { B: B, bytes: bytes, sx: B.w / (B.x1 - B.x0), sy: B.h / (B.y1 - B.y0) };
    return bat;
  }

  function isBat(x, y) {
    var b = bat, B = b.B;
    if (x < B.x0 || x >= B.x1 || y < B.y0 || y >= B.y1) return false;
    var u = ((x - B.x0) * b.sx) | 0, v = ((y - B.y0) * b.sy) | 0;
    var i = v * B.w + u;
    return ((b.bytes[i >> 3] >> (7 - (i & 7))) & 1) === 1;
  }

  function smooth(t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }

  // The figure at continuous time t (in beats). Periodic in 4 beats.
  function figure(t) {
    var flap = t / 2;                         // one wingbeat per 2 beats
    var ring = flap - Math.floor(flap);        // 0..1 within the wingbeat
    return {
      lift: Math.sin(TAU * flap),              // -1 (down) .. 1 (up), eased at both ends
      ring: ring,
      ringA: Math.sin(Math.PI * ring),         // fades in and out: no pop at the loop point
      swell: 0.5 - 0.5 * Math.cos(TAU * t / 4) // once per bar
    };
  }

  // One cell. dx, dy in moon radii. Returns glyph char code slot or -1, and colour.
  // out = [glyphIndex (0..9 ramp, 10..25 hex), colour]
  function cell(dx, dy, col, row, f, out) {
    // Wings flap by sampling the mask lower (up) or higher (down), more toward the tips.
    var ax = dx < 0 ? -dx : dx;
    var wing = smooth((ax - 0.22) / 1.0);
    var by = dy + f.lift * (0.02 + 0.17 * wing * wing);
    var d = Math.sqrt(dx * dx + dy * dy);
    var bx = BAYER[(row & 3) * 4 + (col & 3)] / 16 - 0.5;

    if (isBat(dx, by)) { out[0] = -1; return; }

    var L, c;
    var rim = 1 + 0.02 * f.swell;
    if (d < rim) {
      // 1-bit ordered dither inside the moon: a cell is a digest digit or nothing.
      L = 0.82 - 0.26 * (dx * 0.45 + dy * 0.8) + 0.14 * f.swell - 0.36 * Math.pow(d / rim, 8);
      if (L + bx * 0.9 < 0.5) { out[0] = -1; return; }
      var g = (dy + 1) * 0.42 + (dx + 1) * 0.08;
      out[0] = 10 + HEX.indexOf(HASH.charAt((row * 11 + col) & 63));
      out[1] = C_MOON + (g < 0.42 ? 0 : g < 0.66 ? 1 : 2);
      return;
    }

    // Halo and the ring that leaves the rim on each downstroke.
    L = 0.46 * Math.exp(-(d - 1) * 1.9);
    c = d < 1.28 ? C_HALO : d < 1.8 ? C_HALO + 1 : C_FAR;
    var rr = 1.08 + f.ring * 1.3;
    if (Math.abs(d - rr) < 0.04) { L += 0.3 * f.ringA * (1 - f.ring); if (f.ring < 0.5) c = C_RING; }
    if (d > 2.1) L = Math.max(L, 0.055 + 0.035 * Math.sin(col * 0.21 + row * 0.37));
    var lv = Math.round(L * 9 + bx * 1.6);
    out[0] = lv < 1 ? -1 : lv > 9 ? 9 : lv; out[1] = c;
  }

  function hash2(x, y) {
    var h = (x * 374761393 + y * 668265263) | 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }

  /* Plain-text rendering for the machine view and llms.txt. */
  function ascii(cols, rows, opts) {
    batBits();
    opts = opts || {};
    var aspect = opts.aspect || 0.5; // cell width / cell height
    var r = opts.radius || rows * 0.34;
    var cx = cols / 2, cy = rows / 2;
    var f = figure(0.5); // wings at the top of the stroke
    var out = [0, 0], lines = [];
    for (var y = 0; y < rows; y++) {
      var s = '';
      for (var x = 0; x < cols; x++) {
        var dx = ((x + 0.5 - cx) * aspect) / r, dy = (y + 0.5 - cy) / r;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > 1.3) { s += ' '; continue; }
        cell(dx, dy, x, y, f, out);
        s += out[0] < 0 ? ' ' : out[0] >= 10 ? HEX.charAt(out[0] - 10) : RAMP.charAt(out[0]);
      }
      lines.push(s.replace(/\s+$/, ''));
    }
    return lines.join('\n');
  }

  /* Canvas field. opts.layout(w, h) -> {cx, cy, r} in CSS px; opts.epoch is the shared
     performance.now() origin of the 92 BPM clock (the terminal enters on the same beats). */
  function Field(canvas, opts) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = opts;
    this.reduced = !!opts.reduced;
    this.running = false;
    this.lastDraw = 0;
    this.revealStart = 0;
    this.out = [0, 0];
    batBits();
    var self = this;
    this.frame = function (now) { self.tick(now); };
    this.resize();
  }

  Field.prototype.resize = function () {
    var c = this.canvas, rect = c.getBoundingClientRect();
    var w = Math.max(1, rect.width), h = Math.max(1, rect.height);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    this.w = w; this.h = h; this.dpr = dpr;
    var fs = Math.max(8, Math.min(11, Math.round(w / 140)));
    var font = '500 ' + fs + 'px "Geist Mono", ui-monospace, monospace';
    this.ctx.font = font;
    this.cw = Math.ceil(this.ctx.measureText('0').width * 10) / 10;
    this.ch = Math.round(fs * 1.12);
    this.cols = Math.ceil(w / this.cw);
    this.rows = Math.ceil(h / this.ch);
    this.geom = this.opts.layout(w, h);
    this.buildAtlas(font);
    // Integer cell boxes, so a cell can be cleared and redrawn without touching its neighbours.
    this.xs = new Int32Array(this.cols + 1);
    this.ys = new Int32Array(this.rows + 1);
    for (var i = 0; i <= this.cols; i++) this.xs[i] = Math.round(i * this.cw * dpr);
    for (var j = 0; j <= this.rows; j++) this.ys[j] = Math.round(j * this.ch * dpr);
    this.state = new Int16Array(this.cols * this.rows).fill(-1); // resizing cleared the canvas
    this.lastDraw = 0;
    // Still frame (reduced motion, OG card, 404): wings at the top of the stroke.
    if (!this.running && (this.reduced || this.revealStart)) this.draw(0.5, 1);
  };

  Field.prototype.buildAtlas = function (font) {
    var dpr = this.dpr, cw = this.cw, ch = this.ch;
    var glyphs = RAMP + HEX; // 26 slots: 0..9 ramp, 10..25 hex
    var a = this.atlas || (this.atlas = document.createElement('canvas'));
    a.width = Math.ceil(glyphs.length * cw * dpr); a.height = Math.ceil(COLORS.length * ch * dpr);
    var x = a.getContext('2d');
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, a.width, a.height);
    x.font = font; x.textBaseline = 'middle'; x.textAlign = 'center';
    for (var ci = 0; ci < COLORS.length; ci++) {
      x.fillStyle = COLORS[ci];
      for (var gi = 1; gi < glyphs.length; gi++) x.fillText(glyphs.charAt(gi), gi * cw + cw / 2, ci * ch + ch / 2 + 0.5);
    }
  };

  /* Only cells whose glyph changed since the last frame are cleared and redrawn: the moon and halo
     are mostly still, so a frame of the flap touches a few hundred cells, not ~15k. */
  Field.prototype.draw = function (t, reveal) {
    var ctx = this.ctx, dpr = this.dpr, cw = this.cw, ch = this.ch, g = this.geom;
    var f = figure(t), out = this.out, atlas = this.atlas, state = this.state, xs = this.xs, ys = this.ys;
    var sw = cw * dpr, sh = ch * dpr, cols = this.cols;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (var row = 0; row < this.rows; row++) {
      var py = (row + 0.5) * ch, dy = (py - g.cy) / g.r, y0 = ys[row], hh = ys[row + 1] - y0;
      for (var col = 0; col < cols; col++) {
        var code = -1;
        if (reveal >= 1 || hash2((col / 4) | 0, (row / 3) | 0) <= reveal) {
          cell(((col + 0.5) * cw - g.cx) / g.r, dy, col, row, f, out);
          if (out[0] >= 0) code = out[0] * 8 + out[1];
        }
        var k = row * cols + col;
        if (code === state[k]) continue;
        state[k] = code;
        var x0 = xs[col], ww = xs[col + 1] - x0;
        ctx.clearRect(x0, y0, ww, hh);
        if (code >= 0) ctx.drawImage(atlas, (code >> 3) * sw, (code & 7) * sh, sw, sh, x0, y0, ww, hh);
      }
    }
  };

  Field.prototype.tick = function (now) {
    if (!this.running) return;
    requestAnimationFrame(this.frame);
    if (!this.revealStart) this.revealStart = now;
    if (now - this.lastDraw < FRAME_MS) return;
    this.lastDraw = now;
    this.draw((now - this.opts.epoch) / BEAT_MS, smooth((now - this.revealStart) / 1100));
  };

  Field.prototype.start = function () {
    if (this.reduced || this.running) return;
    this.running = true;
    requestAnimationFrame(this.frame);
  };

  Field.prototype.stop = function () { this.running = false; };

  var api = { Field: Field, ascii: ascii, BEAT_MS: BEAT_MS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.VampField = api;
})(typeof window !== 'undefined' ? window : globalThis);
