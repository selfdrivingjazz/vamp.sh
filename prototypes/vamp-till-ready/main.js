// Vamp till ready: one clock at 96 bpm drives everything that moves.
// Four bars of four. Each beat the record steps 1/16 of a turn, the
// event ticker advances one event, and the bar counter ticks.
(() => {
  const BPM = 96;
  const BEAT = 60000 / BPM;          // 625 ms
  const BEATS = 16;                  // four bars
  const STEP = 360 / BEATS;          // one turn per phrase

  const spin = document.querySelector("[data-spin]");
  const ticks = [...document.querySelectorAll("[data-bars] i")];
  const barLabel = document.querySelector("[data-barlabel]");
  const track = document.querySelector("[data-ticker]");
  const toggle = document.querySelector("[data-toggle]");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  let running = false;
  let raf = 0;
  let t0 = 0;
  let pausedAt = 0;
  let lastBeat = -1;
  let seq = 4196;                    // last sequence number printed in the markup

  // A quick move at the top of the beat, then a hold: a step, not a glide.
  const ease = (x) => {
    const m = Math.min(1, x / 0.32);
    return 1 - Math.pow(1 - m, 3);
  };

  function setCount(beat) {
    const b = beat % BEATS;
    ticks.forEach((el, i) => {
      el.classList.toggle("on", i === b);
      el.classList.toggle("down", i < b);
    });
    barLabel.textContent = `bar ${Math.floor(b / 4) + 1} of 4`;
  }

  function advanceTicker() {
    const first = track.firstElementChild;
    if (!first) return;
    const w = first.getBoundingClientRect().width;
    const anim = track.animate(
      [{ transform: "translateX(0)" }, { transform: `translateX(${-w}px)` }],
      { duration: BEAT * 0.42, easing: "cubic-bezier(.2,.7,.2,1)" }
    );
    anim.onfinish = () => {
      // The vamp repeats, but the stream never does: the event re-enters with the next sequence number.
      seq += 1;
      first.querySelector("span").textContent = String(seq);
      track.appendChild(first);
    };
  }

  function frame(now) {
    const t = now - t0;
    const beatF = t / BEAT;
    const beat = Math.floor(beatF);
    const angle = (beat % BEATS + ease(beatF - beat)) * STEP;
    spin.style.transform = `rotate(${angle}deg)`;
    if (beat !== lastBeat) {
      lastBeat = beat;
      setCount(beat);
      if (beat > 0) advanceTicker();
    }
    raf = requestAnimationFrame(frame);
  }

  // The button names the action it will take; the long half hides on small screens.
  function label(isRunning) {
    toggle.innerHTML = isRunning
      ? 'Stop<span class="long"> the vamp</span>'
      : 'Vamp<span class="long"> till ready</span>';
  }

  function start() {
    if (running) return;
    running = true;
    t0 = performance.now() - pausedAt;
    raf = requestAnimationFrame(frame);
    label(true);
  }

  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
    pausedAt = performance.now() - t0;
    label(false);
  }

  toggle.addEventListener("click", () => { autoPaused = false; running ? stop() : start(); });

  // Hold still for people who ask for it; they can still start it by hand.
  toggle.hidden = false;
  setCount(0);
  if (!reduce.matches) start();
  else label(false);
  reduce.addEventListener("change", (e) => (e.matches ? stop() : start()));

  // Don't spin off-screen: pause while neither the cover nor the band is visible.
  const seen = new Map();
  let autoPaused = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => seen.set(e.target, e.isIntersecting));
    const onscreen = [...seen.values()].some(Boolean);
    if (!onscreen && running) { stop(); autoPaused = true; }
    else if (onscreen && autoPaused) { autoPaused = false; start(); }
  });
  io.observe(document.querySelector(".cover"));
  io.observe(document.querySelector(".band"));
})();
