(() => {
'use strict';
const $ = s => document.querySelector(s);
const L = window.LANGS.map(([name, flag, text, dir, lang]) => ({ name, flag, text, dir, lang }));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const explored = new Set();
const store = {
  get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
};

/* ---------- Starry sky ---------- */
const cv = $('#sky'), cx = cv.getContext('2d');
let stars = [];
function sizeSky() {
  cv.width = innerWidth; cv.height = innerHeight;
  stars = Array.from({ length: Math.min(220, Math.floor(innerWidth / 5)) }, () => ({
    x: Math.random() * cv.width, y: Math.random() * cv.height,
    r: Math.random() * 1.4 + .3, p: Math.random() * 6.3, s: Math.random() * .02 + .005
  }));
  if (reduce) drawSky(0);
}
function drawSky(t) {
  cx.clearRect(0, 0, cv.width, cv.height);
  for (const s of stars) {
    const a = reduce ? .7 : .3 + .7 * Math.abs(Math.sin(s.p + t * s.s * .1));
    cx.fillStyle = `rgba(255,240,250,${a})`;
    cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.3); cx.fill();
  }
  if (!reduce) requestAnimationFrame(drawSky);
}

/* ---------- Floating hearts & click sparkles ---------- */
function bgHeart() {
  const e = document.createElement('span');
  e.className = 'fh'; e.textContent = '❤';
  e.style.left = Math.random() * 100 + 'vw';
  e.style.fontSize = 10 + Math.random() * 14 + 'px';
  e.style.animationDuration = 8 + Math.random() * 6 + 's';
  e.addEventListener('animationend', () => e.remove());
  document.body.appendChild(e);
}
function burst(x, y) {
  if (reduce) return;
  for (let i = 0; i < 7; i++) {
    const e = document.createElement('span');
    e.className = 'sp'; e.textContent = i % 2 ? '✦' : '❤';
    e.style.left = x + 'px'; e.style.top = y + 'px';
    e.style.fontSize = 10 + Math.random() * 14 + 'px';
    e.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
    e.addEventListener('animationend', () => e.remove());
    document.body.appendChild(e);
  }
}

/* ---------- Stages ---------- */
function show(id) {
  document.querySelectorAll('.stage').forEach(s => s.classList.toggle('active', s.id === id));
  document.body.dataset.stage = id;
  const st = $('#' + id); if (st) st.scrollTop = 0;
}

/* ---------- Heart of words ---------- */
const f = (x, y) => (x * x + y * y - 1) ** 3 - x * x * y ** 3;
function segs(y) {
  const out = []; let s = null;
  for (let x = -1.3; x <= 1.3; x += .01) {
    const inside = f(x, y) <= 0;
    if (inside && s === null) s = x;
    if (!inside && s !== null) { out.push([s, x]); s = null; }
  }
  return out;
}
let lastW = 0;
function buildHeart() {
  const box = $('#heart');
  const W = box.clientWidth || Math.min(innerWidth, 880);
  lastW = W;
  const narrow = W < 560;
  const rows = narrow ? 30 : 26;
  let maxK = narrow ? 2.6 : 5.2, plan, total, tries = 0;
  do {
    total = 0; plan = [];
    for (let r = 0; r < rows; r++) {
      const y = 1.3 - r * (2.35 / (rows - 1));
      plan.push(segs(y).map(([a, b]) => {
        const k = Math.max(1, Math.round((b - a) / 2.4 * maxK));
        total += k; return { a, b, k };
      }));
    }
    maxK += .3;
  } while (total < L.length && ++tries < 25);
  const fs = Math.min(19, W * .88 / ((maxK - .3) * 12.5));
  box.style.setProperty('--fs', fs + 'px');
  box.textContent = '';
  const frag = document.createDocumentFragment();
  let i = 0;
  plan.forEach((segList, r) => {
    const row = document.createElement('div');
    row.className = 'row';
    row.style.top = r * 100 / rows + '%';
    row.style.height = 100 / rows + '%';
    segList.forEach(({ a, b, k }) => {
      const seg = document.createElement('div');
      seg.className = 'seg';
      const c = (a + b) / 2, pct = v => (v + 1.2) / 2.4 * 100;
      if (k === 1) { seg.style.left = pct(c) - 20 + '%'; seg.style.width = '40%'; }
      else { seg.style.left = pct(a) + '%'; seg.style.width = (pct(b) - pct(a)) + '%'; }
      for (let j = 0; j < k; j++, i++) {
        const idx = i % L.length, l = L[idx];
        const p = document.createElement('button');
        p.type = 'button';
        p.className = 'p c' + (i * 3 % 5) + (explored.has(idx) ? ' seen' : '');
        p.dataset.i = idx;
        p.textContent = l.text;
        p.lang = l.lang; p.dir = l.dir;
        p.style.setProperty('--z', (.9 + .3 * Math.abs(Math.sin(i * 1.7))).toFixed(2));
        p.setAttribute('aria-label', l.name + ': ' + l.text);
        seg.appendChild(p);
      }
      row.appendChild(seg);
    });
    frag.appendChild(row);
  });
  box.appendChild(frag);
}
function updateCount() {
  $('#count').textContent = `Languages explored: ${explored.size} / ${L.length}`;
}

/* ---------- Popup ---------- */
const pop = $('#pop');
let lastFocus = null;
function openPop(idx, ev, btn) {
  const l = L[idx];
  lastFocus = btn;
  $('#pLang').textContent = `${l.name} ${l.flag}`;
  const t = $('#pText'); t.textContent = `“${l.text}”`; t.dir = l.dir; t.lang = l.lang;
  pop.hidden = false;
  requestAnimationFrame(() => pop.classList.add('show'));
  pop.querySelector('.x').focus();
  const r = btn.getBoundingClientRect();
  burst(ev && ev.clientX ? ev.clientX : r.left + r.width / 2, ev && ev.clientY ? ev.clientY : r.top);
  document.querySelectorAll(`.p[data-i="${idx}"]`).forEach(b => b.classList.add('seen'));
  explored.add(idx); updateCount();
  Music.chime();
}
function closePop() {
  pop.classList.remove('show');
  setTimeout(() => { pop.hidden = true; }, 300);
  if (lastFocus) lastFocus.focus({ preventScroll: true });
}
pop.addEventListener('click', e => { if (e.target === pop || e.target.closest('.x')) closePop(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) closePop(); });
$('#heart').addEventListener('click', e => {
  const b = e.target.closest('.p');
  if (b) { e.stopPropagation(); openPop(+b.dataset.i, e, b); }
});
// Occasional shimmer on a random phrase
if (!reduce) setInterval(() => {
  if (document.body.dataset.stage !== 'heartStage') return;
  const ps = document.querySelectorAll('.p');
  const p = ps[Math.floor(Math.random() * ps.length)];
  if (p) { p.classList.add('glint'); setTimeout(() => p.classList.remove('glint'), 1900); }
}, 700);

/* ---------- Music: MP3 if present, otherwise gentle synth ---------- */
const Music = {
  el: null, ctx: null, master: null, mode: 'file', timer: null, step: 0,
  on: store.get('muted') !== '1', started: false,
  start() { this.started = true; this.ui(); if (this.on) this.play(); },
  ui() {
    const b = $('#music');
    b.setAttribute('aria-pressed', this.on);
    b.setAttribute('aria-label', this.on ? 'Pause music' : 'Play music');
  },
  toggle() {
    this.on = !this.on; store.set('muted', this.on ? '0' : '1'); this.ui();
    if (!this.started) { this.started = true; }
    this.on ? this.play() : this.pause();
  },
  play() {
    if (this.mode === 'synth') return this.synthOn();
    if (!this.el) {
      this.el = new Audio('assets/audio/romantic-music.mp3');
      this.el.loop = true; this.el.volume = 0;
      this.el.addEventListener('error', () => this.fallback());
    }
    const p = this.el.play();
    if (p && p.then) p.then(() => this.fade(.5)).catch(err => {
      if (err && err.name !== 'NotAllowedError') this.fallback();
    });
  },
  fade(target) {
    const el = this.el; if (!el) return;
    clearInterval(this._f);
    this._f = setInterval(() => {
      const d = target - el.volume;
      if (Math.abs(d) < .03) { el.volume = target; clearInterval(this._f); return; }
      el.volume = Math.max(0, Math.min(1, el.volume + Math.sign(d) * .03));
    }, 80);
  },
  fallback() {
    if (this.mode === 'synth') return;
    this.mode = 'synth';
    if (this.on && this.started) this.synthOn();
  },
  pause() {
    if (this.el) this.el.pause();
    this.synthOff();
  },
  tone(freq, t, dur, vol, type = 'sine') {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + dur * .3);
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + .1);
  },
  synthOn() {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    if (!this.ctx) {
      this.ctx = new C();
      this.master = this.ctx.createGain(); this.master.gain.value = 0;
      const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
      this.master.connect(lp); lp.connect(this.ctx.destination);
    }
    this.ctx.resume();
    this.master.gain.setTargetAtTime(.14, this.ctx.currentTime, 1.5);
    if (this.timer) return;
    const chords = [[220, 261.63, 329.63], [174.61, 261.63, 349.23], [196, 261.63, 329.63], [196, 246.94, 293.66]];
    const tick = () => {
      const t = this.ctx.currentTime + .05, ch = chords[this.step++ % 4];
      ch.forEach(n => this.tone(n, t, 5, .5, 'triangle'));
      this.tone(ch[0] / 2, t, 5, .6);
      [2, 3, 2, 1].forEach((m, k) => this.tone(ch[k % 3] * (m > 1 ? 2 : 1) * 2, t + .6 + k * .8, 2.4, .22));
    };
    tick(); this.timer = setInterval(tick, 3600);
  },
  synthOff() {
    if (this.master) this.master.gain.setTargetAtTime(0, this.ctx.currentTime, .4);
    clearInterval(this.timer); this.timer = null;
  },
  chime() {
    if (this.mode !== 'synth' || !this.on || !this.ctx || !this.master) return;
    this.tone(880, this.ctx.currentTime, 1, .25);
  }
};
$('#music').addEventListener('click', () => Music.toggle());

/* ---------- Letter ---------- */
const env = $('#env'), paper = $('#paper');
function reveal() {
  const lines = [...paper.querySelectorAll('.ln')];
  lines.forEach(p => { p.classList.remove('shown'); p.style.transitionDelay = ''; });
  paper.scrollTop = 0; void paper.offsetWidth;
  lines.forEach((p, i) => { p.style.transitionDelay = (reduce ? 0 : i * .7) + 's'; p.classList.add('shown'); });
}
function openEnvelope() {
  if (env.classList.contains('open')) return;
  env.classList.add('open'); $('#hint').classList.add('off');
  setTimeout(() => env.classList.add('gone'), reduce ? 50 : 1000);
  setTimeout(() => { env.hidden = true; paper.hidden = false; reveal(); paper.focus({ preventScroll: true }); }, reduce ? 100 : 1700);
}
function resetEnvelope() {
  env.hidden = false; env.className = 'env'; paper.hidden = true; $('#hint').classList.remove('off');
}
env.addEventListener('click', openEnvelope);
env.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); } });
$('#again').addEventListener('click', reveal);

/* ---------- Wiring ---------- */
$('#open').addEventListener('click', () => { Music.start(); show('heartStage'); });
$('#more').addEventListener('click', () => { resetEnvelope(); show('letterStage'); });

let rz;
addEventListener('resize', () => {
  sizeSky(); clearTimeout(rz);
  rz = setTimeout(() => { if (Math.abs($('#heart').clientWidth - lastW) > 40) buildHeart(); }, 250);
});
sizeSky(); if (!reduce) requestAnimationFrame(drawSky);
if (!reduce) setInterval(bgHeart, 1800);
Music.ui(); buildHeart(); updateCount();
})();
