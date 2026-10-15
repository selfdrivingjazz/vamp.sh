/* vamp.sh — lead-sheet prototype
   1. Draws staves (SMuFL glyphs from LeadSheet Music, a renamed OFL subset of Petaluma).
   2. Pencils the chart in as it scrolls into view (skipped under prefers-reduced-motion).
   3. An opt-in Web Audio vamp: Dm9 / G13, medium swing, synced to a playhead. Silent until pressed. */
(() => {
  "use strict";
  document.documentElement.classList.add("js");

  const SVG = "http://www.w3.org/2000/svg";
  // staff space (px) comes from the system's --sp; SMuFL glyphs are set at 4 spaces per em
  const G = { clef: "\uE050", common: "\uE08A", repL: "\uE040", repR: "\uE041", slash: "\uE101" };
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  /* ───────── staves ───────── */

  function el(name, attrs, text) {
    const n = document.createElementNS(SVG, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text) n.textContent = text;
    return n;
  }

  function drawStaff(svg) {
    const w = svg.clientWidth;
    const sp = parseFloat(getComputedStyle(svg).getPropertyValue("--sp")) || 9;
    const key = w + "/" + sp;
    if (!w || svg.__key === key) return;
    svg.__key = key;
    const top = Math.round(sp * 1.6);
    const line = (i) => top + i * sp;   // i = 0 (top) .. 4 (bottom)
    svg.textContent = "";
    for (let i = 0; i < 5; i++) svg.append(el("line", { x1: 0, x2: w, y1: line(i), y2: line(i) }));

    const host = svg.parentElement;
    if (host.hasAttribute("data-lead")) {
      svg.append(el("text", { x: 3, y: line(3) }, G.clef));
      const cx = 3 + 2.9 * sp;
      if (host.hasAttribute("data-time") && w >= cx + 2.4 * sp) svg.append(el("text", { x: cx, y: line(2) }, G.common));
      return;
    }

    const start = host.hasAttribute("data-repeat-start");
    const end = host.hasAttribute("data-repeat-end");
    const open = host.hasAttribute("data-open-end");
    if (start) svg.append(el("text", { x: 0, y: line(4) }, G.repL));
    if (end) svg.append(el("text", { x: w, y: line(4), "text-anchor": "end" }, G.repR));
    else if (!open) svg.append(el("line", { class: "barline", x1: w - 0.8, x2: w - 0.8, y1: line(0), y2: line(4) }));

    // four slashes: comping rhythm, one per beat
    const a = start ? 3.6 * sp : 1.3 * sp;
    const b = end ? w - 4.4 * sp : w - 1.8 * sp;
    const step = (b - a) / 4;
    for (let k = 0; k < 4; k++) {
      svg.append(el("text", { class: "slash", x: a + step * (k + 0.5), y: line(2), "text-anchor": "middle" }, G.slash));
    }
  }

  // every system starts with a clef cell; the very first one also carries common time
  document.querySelectorAll(".bars").forEach((bars) => {
    const lead = bars.querySelector("[data-lead]");
    if (lead) lead.setAttribute("data-time", "");
  });
  document.querySelectorAll("[data-lead]").forEach((lead) => {
    const svg = el("svg", { class: "staff", "aria-hidden": "true" });
    lead.append(svg);
  });
  const staves = [...document.querySelectorAll("svg.staff")];
  const drawAll = () => staves.forEach(drawStaff);
  const ro = new ResizeObserver(drawAll);
  staves.forEach((s) => ro.observe(s));
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(drawAll);
  drawAll();

  /* ───────── the pencil ───────── */

  const groups = [
    // hero: title, its rule, then the four chords left to right, then the cue
    { root: document.querySelector(".title-block"), items: [".tempo-mark", ".title-ink", ".composer", ".system--vamp .chord", ".cue"] },
  ];
  document.querySelectorAll(".rehearsal, .score").forEach((root) =>
    groups.push({ root, items: [".section-h", ".chord", ".trade-h .hand", ".note--pencil .note-h", ".to-coda"] })
  );
  groups.push({ root: document.querySelector(".coda"), items: [".coda-h", ".coda-sign .hand", ".fine .hand"] });

  function arm(group) {
    let delay = group.root.classList.contains("title-block") ? 0.15 : 0;
    group.targets = [];
    group.items.forEach((sel) => {
      group.root.querySelectorAll(sel).forEach((node) => {
        const long = node.classList.contains("title-ink");
        const dur = long ? 1.1 : node.classList.contains("chord--small") ? 0.45 : 0.6;
        node.classList.add("write");
        node.style.setProperty("--delay", delay.toFixed(2) + "s");
        node.style.setProperty("--dur", dur + "s");
        delay += long ? 0.55 : node.classList.contains("chord") ? 0.16 : 0.28;
        group.targets.push(node);
      });
    });
    group.marks = [...group.root.querySelectorAll(".mark, .title-rule")];
  }
  function reveal(group) {
    group.targets.forEach((n) => n.classList.add("is-written"));
    group.marks.forEach((n) => n.classList.add("is-written"));
  }

  if (!reduceMotion.matches && "IntersectionObserver" in window) {
    groups.forEach(arm);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const g = groups.find((x) => x.root === e.target);
        if (g) reveal(g);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -18% 0px", threshold: 0.05 });
    groups.forEach((g) => io.observe(g.root));
  }

  /* ───────── the vamp (opt-in sound) ───────── */

  const button = document.querySelector(".play");
  const label = button.querySelector(".play-label");
  const system = document.querySelector(".system--vamp .bars");
  const vampBars = [...system.querySelectorAll(".bar")];
  const playhead = system.querySelector(".playhead");

  const BPM = 132;
  const BEAT = 60 / BPM;
  const SWING = 2 / 3;                       // swung eighth falls two-thirds through the beat
  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // rootless voicings, smooth voice leading: Dm9 (F A C E) → G13 (F B E A)
  const VOICING = [[53, 57, 60, 64], [53, 57, 60, 64], [53, 59, 64, 69], [53, 59, 64, 69]];
  // walking bass, chromatic approach into each new chord
  const BASS = [[38, 41, 45, 48], [50, 48, 45, 44], [43, 47, 50, 53], [52, 50, 47, 49]];
  // comping per bar as [beat offset, length in beats]
  const COMP = [[[0, 0.9], [1 + SWING, 1.9]], [[1 + SWING, 0.5], [3, 0.9]], [[0, 0.9], [1 + SWING, 1.9]], [[0.0 + SWING, 0.5], [2, 1.6]]];

  let ctx = null, master = null, voices = null, room = null, noise = null;
  let playing = false, t0 = 0, nextBeat = 0, timer = 0, raf = 0;

  function setupAudio() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.2;
    master = ctx.createGain(); master.gain.value = 0;
    master.connect(comp).connect(ctx.destination);

    // small room: generated impulse, sent from every voice at a low level
    const len = Math.floor(ctx.sampleRate * 1.4);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    room = ctx.createConvolver(); room.buffer = ir;
    const roomOut = ctx.createGain(); roomOut.gain.value = 0.22;
    room.connect(roomOut).connect(master);

    voices = ctx.createBiquadFilter(); voices.type = "lowpass"; voices.frequency.value = 3200; voices.Q.value = 0.4;
    voices.connect(master); voices.connect(room);

    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  }

  function epiano(t, m, dur, vel) {
    const f = midi(m);
    const car = ctx.createOscillator(); car.type = "sine"; car.frequency.value = f;
    const mod = ctx.createOscillator(); mod.type = "sine"; mod.frequency.value = f;
    const idx = ctx.createGain();
    idx.gain.setValueAtTime(f * 2.2, t);
    idx.gain.exponentialRampToValueAtTime(f * 0.18, t + 0.35);
    mod.connect(idx).connect(car.frequency);
    const tine = ctx.createOscillator(); tine.type = "sine"; tine.frequency.value = f * 4.01;
    const tg = ctx.createGain(); tg.gain.setValueAtTime(vel * 0.12, t); tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(vel, t + 0.006);
    amp.gain.exponentialRampToValueAtTime(vel * 0.32, t + 0.9);
    amp.gain.setValueAtTime(vel * 0.32, t + dur);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.28);
    car.connect(amp); tine.connect(tg).connect(amp);
    amp.connect(voices);
    const stop = t + dur + 0.32;
    [car, mod, tine].forEach((o) => { o.start(t); o.stop(stop); });
  }

  function bass(t, m, dur) {
    const f = midi(m);
    const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f;
    const s = ctx.createOscillator(); s.type = "sine"; s.frequency.value = f;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(380, t + 0.25);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.42, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.3);
    g.gain.setValueAtTime(0.18, t + dur);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.07);
    o.connect(lp); s.connect(lp); lp.connect(g).connect(master);
    [o, s].forEach((x) => { x.start(t); x.stop(t + dur + 0.1); });
  }

  function metal(t, vel, decay, hp) {
    const src = ctx.createBufferSource(); src.buffer = noise;
    const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp;
    const bp = ctx.createBiquadFilter(); bp.type = "peaking"; bp.frequency.value = 9000; bp.gain.value = 6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vel, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    src.connect(f).connect(bp).connect(g);
    g.connect(master); g.connect(room);
    src.start(t, Math.random() * 0.5); src.stop(t + decay + 0.02);
  }

  function scheduleBeat(n, t) {
    const bar = Math.floor(n / 4) % 4;
    const beat = n % 4;
    bass(t, BASS[bar][beat], BEAT * 0.86);
    metal(t, beat % 2 ? 0.05 : 0.065, 0.42, 6000);                 // ride
    if (beat % 2) {
      metal(t + BEAT * SWING, 0.035, 0.28, 6500);                   // ride skip note
      metal(t, 0.05, 0.05, 7500);                                   // hi-hat on 2 and 4
    }
    if (beat === 0) {
      COMP[bar].forEach(([off, len]) => {
        const at = t + off * BEAT;
        VOICING[bar].forEach((m, i) => epiano(at + i * 0.004, m, len * BEAT, 0.085));
      });
    }
  }

  function scheduler() {
    const ahead = ctx.currentTime + 0.15;
    while (t0 + nextBeat * BEAT < ahead) {
      scheduleBeat(nextBeat, t0 + nextBeat * BEAT);
      nextBeat++;
    }
  }

  function placePlayhead() {
    const lat = (ctx.outputLatency || ctx.baseLatency || 0);
    const elapsed = Math.max(0, ctx.currentTime - t0 - lat);
    const beats = (elapsed / BEAT) % 16;
    const i = Math.floor(beats / 4);
    const frac = (beats % 4) / 4;
    const bar = vampBars[i];
    vampBars.forEach((b, k) => b.classList.toggle("is-current", k === i));
    playhead.style.transform = `translate(${bar.offsetLeft + frac * bar.offsetWidth}px, ${bar.offsetTop}px)`;
    raf = requestAnimationFrame(placePlayhead);
  }

  async function start() {
    if (!ctx) setupAudio();
    await ctx.resume();
    t0 = ctx.currentTime + 0.12;
    nextBeat = 0;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.9, t0 + 0.05);
    scheduler();
    timer = setInterval(scheduler, 25);
    playing = true;
    system.classList.add("is-playing");
    button.setAttribute("aria-pressed", "true");
    label.textContent = "Stop";
    raf = requestAnimationFrame(placePlayhead);
  }

  function stop() {
    playing = false;
    clearInterval(timer);
    cancelAnimationFrame(raf);
    system.classList.remove("is-playing");
    vampBars.forEach((b) => b.classList.remove("is-current"));
    button.setAttribute("aria-pressed", "false");
    label.textContent = "Play the vamp";
    if (ctx) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      setTimeout(() => { if (!playing) ctx.suspend(); }, 260);
    }
  }

  button.addEventListener("click", () => (playing ? stop() : start()));
  document.addEventListener("visibilitychange", () => { if (document.hidden && playing) stop(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && playing) stop(); });
})();
